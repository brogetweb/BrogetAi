import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:http/http.dart' as http;
import 'package:open_filex/open_filex.dart';
import 'package:path_provider/path_provider.dart';

import 'booking_store.dart';
import 'profile_store.dart';

String bookApiBase() {
  const fromEnv = String.fromEnvironment('BOOK_API_BASE');
  if (fromEnv.isNotEmpty) return fromEnv.replaceAll(RegExp(r'/$'), '');
  if (Platform.isAndroid) return 'http://10.0.2.2:3000/api/v1';
  return 'http://127.0.0.1:3000/api/v1';
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

  Uri _uri(String path) => Uri.parse('${bookApiBase()}$path');

  Map<String, String> _headers({bool auth = false}) {
    final headers = <String, String>{'Content-Type': 'application/json', 'Accept': 'application/json'};
    final token = ProfileStore.instance.accessToken;
    if (auth && token != null && token.isNotEmpty) headers['Authorization'] = 'Bearer $token';
    return headers;
  }

  Future<Map<String, dynamic>> register({
    required String fullName,
    required String email,
    required String phone,
    required String password,
    String city = '',
    String gender = 'Male',
  }) async {
    final res = await http.post(
      _uri('/book/auth/register'),
      headers: _headers(),
      body: jsonEncode({
        'fullName': fullName,
        'email': email,
        'phone': phone,
        'password': password,
        'city': city,
        'gender': gender,
      }),
    );
    return _decode(res);
  }

  Future<Map<String, dynamic>> login({required String emailOrPhone, required String password}) async {
    final res = await http.post(
      _uri('/book/auth/login'),
      headers: _headers(),
      body: jsonEncode({'emailOrPhone': emailOrPhone, 'password': password}),
    );
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
    final res = await http.post(
      _uri(path),
      headers: _headers(auth: !guest && ProfileStore.instance.hasToken),
      body: jsonEncode({
        'origin': origin,
        'destination': destination,
        'travelDate': travelDateIso,
        'adults': adults,
        'cabin': cabin,
        'bookingType': 0,
      }),
    );
    return _decode(res);
  }

  Future<({Uint8List bytes, String filename, String pnr})> downloadTicketPdf(BookBooking booking) async {
    final res = await http.post(
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
    );
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
      if (parsed is Map<String, dynamic>) body = parsed;
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
    throw BookApiException('Request failed (${res.statusCode}). Check API is running at ${bookApiBase()}.');
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
