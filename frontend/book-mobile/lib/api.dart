import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:http/http.dart' as http;
import 'package:open_filex/open_filex.dart';
import 'package:path_provider/path_provider.dart';

import 'booking_store.dart';
import 'profile_store.dart';

/// Live EC2 API (HTTP). Cleartext is allowed in AndroidManifest for device installs.
const _prodBookApiBase = 'http://65.2.205.197/api/v1';

String bookApiBase() {
  const fromEnv = String.fromEnvironment('BOOK_API_BASE');
  if (fromEnv.isNotEmpty) return fromEnv.replaceAll(RegExp(r'/$'), '');
  return _prodBookApiBase;
}

String digitsPhone(String raw) {
  final digits = raw.replaceAll(RegExp(r'\D'), '');
  if (digits.length >= 10) return digits.substring(digits.length - 10);
  return digits;
}

class BookApiException implements Exception {
  BookApiException(this.message);
  final String message;
  @override
  String toString() => message;
}

class BookApi {
  BookApi._();
  static final BookApi instance = BookApi._();

  static const _timeout = Duration(seconds: 25);

  Uri _uri(String path) => Uri.parse('${bookApiBase()}$path');

  Map<String, String> _headers({bool auth = false}) {
    final headers = <String, String>{'Content-Type': 'application/json', 'Accept': 'application/json'};
    final token = ProfileStore.instance.accessToken;
    if (auth && token != null && token.isNotEmpty) headers['Authorization'] = 'Bearer $token';
    return headers;
  }

  Future<http.Response> _post(String path, {required Object body, bool auth = false}) async {
    try {
      return await http
          .post(_uri(path), headers: _headers(auth: auth), body: jsonEncode(body))
          .timeout(_timeout);
    } on TimeoutException {
      throw BookApiException('Server timed out. Check internet and try again.');
    } on SocketException catch (e) {
      throw BookApiException('Cannot reach server (${bookApiBase()}). ${e.message}');
    } on HandshakeException {
      throw BookApiException('Secure connection failed. Try again on Wi‑Fi/mobile data.');
    } on http.ClientException catch (e) {
      throw BookApiException('Network error: ${e.message}');
    }
  }

  Future<Map<String, dynamic>> register({
    required String fullName,
    required String email,
    required String phone,
    required String password,
    String city = '',
    String gender = 'Male',
  }) async {
    final res = await _post(
      '/book/auth/register',
      body: {
        'fullName': fullName,
        'email': email,
        'phone': digitsPhone(phone),
        'password': password,
        'city': city,
        'gender': gender,
      },
    );
    return _decode(res);
  }

  Future<Map<String, dynamic>> login({required String emailOrPhone, required String password}) async {
    final key = emailOrPhone.trim();
    final normalized = RegExp(r'^\d').hasMatch(key) ? digitsPhone(key) : key;
    final res = await _post(
      '/book/auth/login',
      body: {'emailOrPhone': normalized, 'password': password},
    );
    return _decode(res);
  }

  Future<Map<String, dynamic>> quoteFlight({required double netFare, required String sector}) async {
    final res = await _post('/book/flights/quote', body: {'netFare': netFare, 'sector': sector});
    return _decode(res);
  }

  Future<Map<String, dynamic>> createFlightCheckout({
    required double netFare,
    required String sector,
    required Map<String, dynamic> flight,
    required List<Map<String, dynamic>> passengers,
    String? payMobile,
  }) async {
    final res = await _post(
      '/book/flights/checkout',
      auth: true,
      body: {
        'netFare': netFare,
        'sector': sector,
        'flight': flight,
        'passengers': passengers,
        if (payMobile != null && payMobile.isNotEmpty) 'payMobile': digitsPhone(payMobile),
      },
    );
    return _decode(res);
  }

  Future<Map<String, dynamic>> flightOrderStatus(String requestId) async {
    try {
      final res = await http.get(_uri('/book/flights/orders/$requestId'), headers: _headers(auth: true)).timeout(_timeout);
      return _decode(res);
    } on TimeoutException {
      throw BookApiException('Could not check payment status.');
    } on SocketException catch (e) {
      throw BookApiException('Cannot reach server. ${e.message}');
    }
  }

  Future<Map<String, dynamic>> confirmDemoFlightPay(String requestId) async {
    final res = await _post('/book/flights/orders/$requestId/demo-pay', auth: true, body: {});
    return _decode(res);
  }

  Future<Map<String, dynamic>> searchFlights({
    required String origin,
    required String destination,
    required String travelDateIso,
    int adults = 1,
    String cabin = '0',
    bool guest = false,
  }) async {
    final path = guest || !ProfileStore.instance.hasToken ? '/book/flights/search/guest' : '/book/flights/search';
    final res = await _post(
      path,
      auth: !guest && ProfileStore.instance.hasToken,
      body: {
        'origin': origin,
        'destination': destination,
        'travelDate': travelDateIso,
        'adults': adults,
        'cabin': cabin,
        'bookingType': 0,
      },
    );
    return _decode(res);
  }

  Future<({Uint8List bytes, String filename, String pnr})> downloadTicketPdf(BookBooking booking) async {
    late final http.Response res;
    try {
      res = await http
          .post(
            _uri('/book/flights/ticket-pdf'),
            headers: _headers(),
            body: jsonEncode({
              'bookingId': booking.id,
              'pnr': booking.pnr,
              'airline': booking.airline,
              'flightCode': booking.flightCode,
              'fromCode': booking.fromCode,
              'toCode': booking.toCode,
              'date': booking.date,
              'depart': booking.depart,
              'arrive': booking.arrive,
              'duration': booking.duration,
              'travellerName': booking.travellerName,
              'email': booking.email,
              'phone': booking.phone,
              'total': booking.total,
              'cabin': booking.cabin,
            }),
          )
          .timeout(_timeout);
    } on TimeoutException {
      throw BookApiException('Ticket download timed out.');
    } on SocketException catch (e) {
      throw BookApiException('Cannot reach server for ticket PDF. ${e.message}');
    }
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw BookApiException('Could not download ticket PDF (${res.statusCode}).');
    }
    final disposition = res.headers['content-disposition'] ?? '';
    final named = RegExp(r'filename="?([^";]+)"?').firstMatch(disposition);
    final filename = named?.group(1) ?? 'eticket-${booking.id}.pdf';
    final pnr = booking.pnr.isNotEmpty ? booking.pnr : filename.replaceAll(RegExp(r'[^A-Za-z0-9]'), '').toUpperCase();
    return (bytes: res.bodyBytes, filename: filename, pnr: pnr);
  }

  Future<String> saveAndOpenTicketPdf(BookBooking booking) async {
    final file = await downloadTicketPdf(booking);
    final dir = await getTemporaryDirectory();
    final path = '${dir.path}/${file.filename}';
    final out = File(path);
    await out.writeAsBytes(file.bytes, flush: true);
    await OpenFilex.open(path);
    return path;
  }

  Map<String, dynamic> _decode(http.Response res) {
    Map<String, dynamic> body = {};
    try {
      final parsed = jsonDecode(res.body);
      if (parsed is Map<String, dynamic>) {
        body = parsed;
      } else if (parsed is Map) {
        body = Map<String, dynamic>.from(parsed);
      }
    } catch (_) {
      body = {'message': res.body};
    }
    if (res.statusCode >= 200 && res.statusCode < 300) return body;
    final message = body['message'];
    if (message is String && message.isNotEmpty) throw BookApiException(message);
    if (message is List && message.isNotEmpty) {
      final first = message.first;
      if (first is Map && first['constraints'] is Map) {
        final constraints = Map<String, dynamic>.from(first['constraints'] as Map);
        throw BookApiException(constraints.values.first.toString());
      }
      throw BookApiException(first.toString());
    }
    throw BookApiException('Request failed (${res.statusCode}) at ${bookApiBase()}.');
  }
}

String cabinCode(String cabin) {
  switch (cabin.toLowerCase()) {
    case 'business':
      return '1';
    case 'first':
      return '2';
    case 'premium economy':
    case 'premium economy ':
      return '3';
    default:
      return '0';
  }
}

/// Accepts YYYY-MM-DD or "Sun, 15 Dec 2026".
String toIsoDate(String value) {
  final iso = RegExp(r'^(\d{4})-(\d{2})-(\d{2})$').firstMatch(value.trim());
  if (iso != null) return value.trim();
  const months = {
    'jan': '01',
    'feb': '02',
    'mar': '03',
    'apr': '04',
    'may': '05',
    'jun': '06',
    'jul': '07',
    'aug': '08',
    'sep': '09',
    'oct': '10',
    'nov': '11',
    'dec': '12',
  };
  final m = RegExp(r'(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})').firstMatch(value);
  if (m == null) {
    final now = DateTime.now().add(const Duration(days: 14));
    return '${now.year.toString().padLeft(4, '0')}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  }
  final day = m.group(1)!.padLeft(2, '0');
  final month = months[m.group(2)!.toLowerCase()] ?? '01';
  final year = m.group(3)!;
  return '$year-$month-$day';
}
