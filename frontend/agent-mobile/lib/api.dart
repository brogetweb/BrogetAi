import 'dart:convert';
import 'dart:typed_data';

import 'package:http/http.dart' as http;

import 'api_base_io.dart' if (dart.library.html) 'api_base_web.dart';

const _definedBase = String.fromEnvironment('API_BASE');

String apiBase() {
  if (_definedBase.isNotEmpty) return _definedBase;
  return defaultApiBase();
}

class ApiException implements Exception {
  ApiException(this.message);

  final String message;
}

class AgentAccount {
  AgentAccount({required this.id, required this.email, required this.name, required this.phone, required this.city});

  final String id;
  final String email;
  final String name;
  final String phone;
  final String city;

  factory AgentAccount.fromJson(Map<String, dynamic> json) {
    return AgentAccount(
      id: '${json['id'] ?? ''}',
      email: '${json['email'] ?? ''}',
      name: '${json['name'] ?? ''}',
      phone: '${json['phone'] ?? ''}',
      city: '${json['city'] ?? ''}',
    );
  }
}

class AgentSession {
  AgentSession({required this.accessToken, required this.refreshToken, required this.user});

  final String accessToken;
  final String refreshToken;
  final AgentAccount user;
}

Future<AgentSession> loginAgent(String email, String password) async {
  final body = await _post('/auth/agent/login', {'email': email, 'password': password});
  final user = body['user'];
  if (user is! Map) throw ApiException('Could not sign in.');
  return AgentSession(
    accessToken: '${body['accessToken'] ?? ''}',
    refreshToken: '${body['refreshToken'] ?? ''}',
    user: AgentAccount.fromJson(Map<String, dynamic>.from(user)),
  );
}

class CreditReportResult {
  CreditReportResult({required this.id, required this.name, required this.message, this.score});

  final String id;
  final String name;
  final String message;
  final int? score;

  factory CreditReportResult.fromJson(Map<String, dynamic> json) {
    final raw = json['score'];
    final parsed = raw == null ? null : int.tryParse('$raw');
    return CreditReportResult(id: '${json['id'] ?? ''}', name: '${json['name'] ?? ''}', message: '${json['message'] ?? ''}', score: parsed);
  }
}

Future<({Uint8List bytes, String filename})> downloadCreditReportPdf({required String accessToken, required String id}) async {
  try {
    final response = await http.get(Uri.parse('${apiBase()}/credit-reports/mine/$id/download'), headers: {'Authorization': 'Bearer $accessToken'}).timeout(const Duration(seconds: 35));
    if (response.statusCode >= 200 && response.statusCode < 300 && response.bodyBytes.isNotEmpty) {
      final named = RegExp(r'filename="([^"]+)"').firstMatch(response.headers['content-disposition'] ?? '');
      return (bytes: response.bodyBytes, filename: named?.group(1) ?? 'credit-report.pdf');
    }
    final json = response.body.isEmpty ? <String, dynamic>{} : Map<String, dynamic>.from(jsonDecode(response.body) as Map);
    final message = json['message'];
    throw ApiException(message is String ? message : 'Could not download the report.');
  } on ApiException {
    rethrow;
  } catch (_) {
    throw ApiException('The API is not reachable.');
  }
}

Future<CreditReportResult> requestCreditReport({
  required String accessToken,
  required String firstName,
  required String lastName,
  required String mobile,
  required String dateOfBirth,
  required String email,
  required String pan,
  required String otp,
}) async {
  final body = await _post(
    '/credit-reports',
    {
      'firstName': firstName,
      'lastName': lastName,
      'mobile': mobile,
      'dateOfBirth': dateOfBirth,
      'email': email,
      'pan': pan,
      'otp': otp,
      'consentAcceptance': 'Yes',
    },
    accessToken: accessToken,
    timeout: const Duration(seconds: 35),
  );
  return CreditReportResult.fromJson(body);
}

class SavedCustomer {
  SavedCustomer({
    required this.id,
    required this.name,
    required this.firstName,
    required this.lastName,
    required this.mobile,
    required this.email,
    required this.pan,
    required this.dateOfBirth,
    required this.cibil,
    this.score,
  });

  final String id;
  final String name;
  final String firstName;
  final String lastName;
  final String mobile;
  final String email;
  final String pan;
  final String dateOfBirth;
  final String cibil;
  final int? score;

  factory SavedCustomer.fromJson(Map<String, dynamic> json) {
    final raw = json['score'];
    return SavedCustomer(
      id: '${json['id'] ?? ''}',
      name: '${json['name'] ?? ''}',
      firstName: '${json['firstName'] ?? ''}',
      lastName: '${json['lastName'] ?? ''}',
      mobile: '${json['mobile'] ?? ''}',
      email: '${json['email'] ?? ''}',
      pan: '${json['pan'] ?? ''}',
      dateOfBirth: '${json['dateOfBirth'] ?? ''}',
      cibil: '${json['cibil'] ?? 'Not checked'}',
      score: raw == null ? null : int.tryParse('$raw'),
    );
  }
}

Future<SavedCustomer> createCustomer({
  required String accessToken,
  required String firstName,
  required String lastName,
  required String mobile,
  required String dateOfBirth,
  required String email,
  required String pan,
}) async {
  final body = await _post('/customers', {
    'firstName': firstName,
    'lastName': lastName,
    'mobile': mobile,
    'dateOfBirth': dateOfBirth,
    'email': email,
    'pan': pan,
  }, accessToken: accessToken);
  return SavedCustomer.fromJson(body);
}

Future<List<SavedCustomer>> listMyCustomers(String accessToken) async {
  final rows = await _get('/customers/mine', accessToken);
  return rows.map(SavedCustomer.fromJson).toList();
}

class AgentCreditCheck {
  AgentCreditCheck({required this.id, required this.name, required this.mobile, required this.status, required this.checkedAt, this.score});

  final String id;
  final String name;
  final String mobile;
  final String status;
  final DateTime checkedAt;
  final int? score;

  factory AgentCreditCheck.fromJson(Map<String, dynamic> json) {
    final raw = json['score'];
    return AgentCreditCheck(
      id: '${json['id'] ?? ''}',
      name: '${json['name'] ?? ''}',
      mobile: '${json['mobile'] ?? ''}',
      status: '${json['status'] ?? ''}',
      checkedAt: DateTime.tryParse('${json['createdAt'] ?? ''}')?.toLocal() ?? DateTime.now(),
      score: raw == null ? null : int.tryParse('$raw'),
    );
  }
}

Future<List<AgentCreditCheck>> listMyCreditReports(String accessToken) async {
  final rows = await _get('/credit-reports/mine', accessToken, failure: 'Could not load your checks.');
  return rows.map(AgentCreditCheck.fromJson).toList();
}

Future<void> submitKycDocument({
  required String accessToken,
  required String kind,
  required String fileName,
  String? dataBase64,
}) async {
  await _post('/kyc-documents', {
    'kind': kind,
    'fileName': fileName,
    if (dataBase64 != null && dataBase64.isNotEmpty) 'dataBase64': dataBase64,
  }, accessToken: accessToken, timeout: const Duration(seconds: 30));
}

class WalletRow {
  WalletRow({required this.id, required this.kind, required this.amount, required this.status, required this.note, required this.createdAt});

  final String id;
  final String kind;
  final double amount;
  final String status;
  final String note;
  final DateTime createdAt;
}

class WalletView {
  WalletView({required this.balance, required this.added, required this.spent, required this.fee, required this.gst, required this.charge, required this.lowBalance, required this.entries});

  final double balance;
  final double added;
  final double spent;
  final double fee;
  final double gst;
  final double charge;
  final bool lowBalance;
  final List<WalletRow> entries;

  factory WalletView.fromJson(Map<String, dynamic> json) {
    final rows = json['entries'];
    final entries = rows is List
        ? rows.whereType<Map>().map((row) {
            final item = Map<String, dynamic>.from(row);
            return WalletRow(
              id: '${item['id'] ?? ''}',
              kind: '${item['kind'] ?? ''}',
              amount: double.tryParse('${item['amount'] ?? 0}') ?? 0,
              status: '${item['status'] ?? ''}',
              note: '${item['note'] ?? ''}',
              createdAt: DateTime.tryParse('${item['createdAt'] ?? ''}')?.toLocal() ?? DateTime.now(),
            );
          }).toList()
        : <WalletRow>[];
    return WalletView(
      balance: double.tryParse('${json['balance'] ?? 0}') ?? 0,
      added: double.tryParse('${json['added'] ?? 0}') ?? 0,
      spent: double.tryParse('${json['spent'] ?? 0}') ?? 0,
      fee: double.tryParse('${json['fee'] ?? 52}') ?? 52,
      gst: double.tryParse('${json['gst'] ?? 9.36}') ?? 9.36,
      charge: double.tryParse('${json['charge'] ?? 61.36}') ?? 61.36,
      lowBalance: json['lowBalance'] == true,
      entries: entries,
    );
  }
}

Future<WalletView> fetchWallet(String accessToken) async {
  final body = await _postGet('/wallet', accessToken);
  return WalletView.fromJson(body);
}

Future<String> createWalletTopup({required String accessToken, required double amount, required String mobile}) async {
  final body = await _post('/wallet/topups', {'amount': amount, 'mobile': mobile}, accessToken: accessToken, timeout: const Duration(seconds: 35));
  final url = '${body['paymentUrl'] ?? ''}';
  if (url.isEmpty) throw ApiException('Broget Pay did not return a payment link.');
  return url;
}

Future<void> createWalletPayout({
  required String accessToken,
  required double amount,
  required String mobile,
  required String holderName,
  required String bankName,
  required String accountNumber,
  required String ifsc,
}) async {
  await _post('/wallet/payouts', {
    'amount': amount,
    'mobile': mobile,
    'holderName': holderName,
    'bankName': bankName,
    'accountNumber': accountNumber,
    'ifsc': ifsc,
  }, accessToken: accessToken, timeout: const Duration(seconds: 35));
}

Future<void> logoutAgent(String refreshToken) async {
  try {
    await _post('/auth/logout', {'refreshToken': refreshToken});
  } catch (_) {}
}

Future<Map<String, dynamic>> _postGet(String path, String accessToken) async {
  try {
    final response = await http.get(Uri.parse('${apiBase()}$path'), headers: {'Authorization': 'Bearer $accessToken'}).timeout(const Duration(seconds: 8));
    final json = response.body.isEmpty ? <String, dynamic>{} : Map<String, dynamic>.from(jsonDecode(response.body) as Map);
    if (response.statusCode >= 200 && response.statusCode < 300) return json;
    final message = json['message'];
    throw ApiException(message is String ? message : 'Could not load the wallet.');
  } on ApiException {
    rethrow;
  } catch (_) {
    throw ApiException('The API is not reachable.');
  }
}

Future<List<Map<String, dynamic>>> _get(String path, String accessToken, {String failure = 'Could not load your customers.'}) async {
  try {
    final response = await http.get(
      Uri.parse('${apiBase()}$path'),
      headers: {'Authorization': 'Bearer $accessToken'},
    ).timeout(const Duration(seconds: 8));
    if (response.statusCode < 200 || response.statusCode >= 300) throw ApiException(failure);
    final decoded = jsonDecode(response.body);
    if (decoded is! List) return [];
    return decoded.map((row) => Map<String, dynamic>.from(row as Map)).toList();
  } on ApiException {
    rethrow;
  } catch (_) {
    throw ApiException('The API is not reachable.');
  }
}

Future<Map<String, dynamic>> _post(String path, Map<String, dynamic> payload, {String? accessToken, Duration timeout = const Duration(seconds: 8)}) async {
  try {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (accessToken != null && accessToken.isNotEmpty) headers['Authorization'] = 'Bearer $accessToken';
    final response = await http.post(Uri.parse('${apiBase()}$path'), headers: headers, body: jsonEncode(payload)).timeout(timeout);
    final json = response.body.isEmpty ? <String, dynamic>{} : Map<String, dynamic>.from(jsonDecode(response.body) as Map);
    if (response.statusCode >= 200 && response.statusCode < 300) return json;
    final message = json['message'];
    final detail = message is List ? message.join(' ') : message is String ? message : 'Could not sign in.';
    throw ApiException(detail);
  } on ApiException {
    rethrow;
  } catch (_) {
    throw ApiException('The API is not reachable.');
  }
}
