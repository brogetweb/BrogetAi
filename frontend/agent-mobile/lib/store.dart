import 'dart:async';

import 'package:flutter/foundation.dart';

import 'api.dart';

enum KycStatus { pending, review, verified }

enum CibilState { pending, checking, ready }

enum LoanStatus { draft, submitted, review, needsDocs }

extension KycLabel on KycStatus {
  String get label => switch (this) {
        KycStatus.pending => 'Pending',
        KycStatus.review => 'In review',
        KycStatus.verified => 'Verified',
      };
}

extension LoanLabel on LoanStatus {
  String get label => switch (this) {
        LoanStatus.draft => 'Draft',
        LoanStatus.submitted => 'Submitted',
        LoanStatus.review => 'In review',
        LoanStatus.needsDocs => 'Needs documents',
      };
}

class ConsentRecord {
  ConsentRecord({required this.purpose, required this.at});

  final String purpose;
  final DateTime at;
}

class DeskDocument {
  DeskDocument({required this.name, required this.kind});

  final String name;
  final String kind;
}

class Customer {
  Customer({
    required this.id,
    required this.name,
    required this.phone,
    required this.city,
    required this.kyc,
    this.sampleScore,
    this.noted,
    this.dob,
    this.gender = '',
    this.fatherName = '',
    this.motherName = '',
    this.pan = '',
    this.aadhaar = '',
    this.aadhaarName = '',
    this.aadhaarDob,
    this.email = '',
    this.address = '',
    this.state = '',
    this.pin = '',
    this.cibil = CibilState.pending,
    List<ConsentRecord>? consents,
    List<DeskDocument>? documents,
  })  : consents = consents ?? [],
        documents = documents ?? [];

  final String id;
  String name;
  String phone;
  String city;
  KycStatus kyc;
  int? sampleScore;
  DateTime? noted;
  DateTime? dob;
  String gender;
  String fatherName;
  String motherName;
  String pan;
  String aadhaar;
  String aadhaarName;
  DateTime? aadhaarDob;
  String email;
  String address;
  String state;
  String pin;
  CibilState cibil;
  final List<ConsentRecord> consents;
  final List<DeskDocument> documents;
}

class LoanFile {
  LoanFile({
    required this.id,
    required this.customerId,
    required this.amount,
    required this.purpose,
    required this.note,
    required this.status,
    required this.created,
  });

  final String id;
  final String customerId;
  final int amount;
  final String purpose;
  final String note;
  LoanStatus status;
  final DateTime created;
}

class DeskNotice {
  DeskNotice({required this.title, required this.body, this.read = false, DateTime? at}) : at = at ?? DateTime.now();

  final String title;
  final String body;
  final DateTime at;
  bool read;
}

enum WalletKind { topUp, usage, withdraw }

enum WalletStatus { pending, success, failed }

class WalletEntry {
  WalletEntry({
    required this.id,
    required this.kind,
    required this.amount,
    required this.status,
    required this.note,
    DateTime? at,
  }) : at = at ?? DateTime.now();

  final String id;
  final WalletKind kind;
  final double amount;
  WalletStatus status;
  final String note;
  final DateTime at;
}

class DeskToast {
  DeskToast({required this.id, required this.ok, required this.title, this.detail});

  final int id;
  final bool ok;
  final String title;
  final String? detail;
}

class AgentStore extends ChangeNotifier {
  bool signedIn = false;
  String email = '';
  bool alertsOn = true;
  bool biometricOn = true;
  String agentName = '';
  String agentPhone = '';
  String agentEmail = '';
  String language = 'English';
  String themeLabel = 'Light';
  String agentCode = '';
  final String company = 'Broget AI';
  String desk = '';
  String accessToken = '';
  String refreshToken = '';
  DeskToast? toast;
  Timer? _toastTimer;

  final customers = <Customer>[];
  final checks = <AgentCreditCheck>[];

  final loans = <LoanFile>[];

  final notices = <DeskNotice>[];
  final wallet = <WalletEntry>[];
  double balanceRupees = 0;
  double chargeRupees = 61.36;
  double feeRupees = 52;
  double gstRupees = 9.36;

  int _customerSeq = 1;
  int _loanSeq = 1043;
  Future<void>? _deskRefresh;

  int get unread => notices.where((notice) => !notice.read).length;

  double get walletBalance => balanceRupees;

  bool get lowBalance => balanceRupees + 0.001 < chargeRupees;

  double get walletAdded => wallet.where((entry) => entry.kind == WalletKind.topUp && entry.status == WalletStatus.success).fold(0, (sum, entry) => sum + entry.amount);

  double get walletUsed => wallet.where((entry) => entry.kind != WalletKind.topUp && entry.status == WalletStatus.success).fold(0, (sum, entry) => sum + entry.amount);

  WalletEntry? get lastWalletEntry => wallet.isEmpty ? null : wallet.first;

  Future<void> loadWallet() async {
    if (accessToken.isEmpty) return;
    final view = await fetchWallet(accessToken);
    balanceRupees = view.balance;
    chargeRupees = view.charge;
    feeRupees = view.fee;
    gstRupees = view.gst;
    wallet
      ..clear()
      ..addAll(view.entries.map((row) {
        final kind = switch (row.kind) {
          'usage' => WalletKind.usage,
          'withdraw' => WalletKind.withdraw,
          _ => WalletKind.topUp,
        };
        final status = switch (row.status) {
          'success' => WalletStatus.success,
          'failed' => WalletStatus.failed,
          _ => WalletStatus.pending,
        };
        return WalletEntry(id: row.id, kind: kind, amount: row.amount, status: status, note: row.note, at: row.createdAt);
      }));
    notifyListeners();
  }

  int get consentCount => customers.fold(0, (sum, customer) => sum + customer.consents.length);

  void showToast(bool ok, String title, [String? detail]) {
    final id = DateTime.now().microsecondsSinceEpoch;
    toast = DeskToast(id: id, ok: ok, title: title, detail: detail);
    _toastTimer?.cancel();
    _toastTimer = Timer(const Duration(milliseconds: 4500), () {
      if (toast?.id != id) return;
      toast = null;
      notifyListeners();
    });
    notifyListeners();
  }

  void dismissToast() {
    _toastTimer?.cancel();
    if (toast == null) return;
    toast = null;
    notifyListeners();
  }

  Future<String?> signIn(String mail, String password) async {
    try {
      final session = await loginAgent(mail, password);
      email = session.user.email;
      agentEmail = session.user.email;
      agentName = session.user.name;
      agentPhone = session.user.phone;
      agentCode = session.user.id;
      desk = session.user.city;
      accessToken = session.accessToken;
      refreshToken = session.refreshToken;
      signedIn = true;
      await refreshDesk();
      showToast(true, 'Signed in', session.user.email);
      return null;
    } on ApiException catch (error) {
      showToast(false, 'Could not sign in', error.message);
      return error.message;
    }
  }

  void signOut() {
    final token = refreshToken;
    signedIn = false;
    email = '';
    agentEmail = '';
    agentName = '';
    agentPhone = '';
    agentCode = '';
    desk = '';
    accessToken = '';
    refreshToken = '';
    customers.clear();
    checks.clear();
    loans.clear();
    notices.clear();
    wallet.clear();
    balanceRupees = 0;
    showToast(true, 'Signed out');
    if (token.isNotEmpty) logoutAgent(token);
  }

  void setAlerts(bool value) {
    alertsOn = value;
    notifyListeners();
  }

  void setBiometric(bool value) {
    biometricOn = value;
    notifyListeners();
  }

  void setLanguage(String value) {
    language = value;
    notifyListeners();
  }

  void setThemeLabel(String value) {
    themeLabel = value;
    notifyListeners();
  }

  void updateProfile({required String name, required String phone, required String mail}) {
    agentName = name.trim();
    agentPhone = phone.replaceAll(RegExp(r'\D'), '');
    agentEmail = mail.trim();
    notifyListeners();
  }

  Customer? customerById(String id) {
    for (final customer in customers) {
      if (customer.id == id) return customer;
    }
    return null;
  }

  List<LoanFile> loansFor(String customerId) {
    return loans.where((loan) => loan.customerId == customerId).toList();
  }

  Future<void> refreshDesk() {
    if (accessToken.isEmpty) return Future.value();
    final running = _deskRefresh;
    if (running != null) return running;
    final task = _loadDesk();
    _deskRefresh = task;
    return task.whenComplete(() {
      if (identical(_deskRefresh, task)) _deskRefresh = null;
    });
  }

  Future<void> _loadDesk() async {
    try {
      final rows = await listMyCustomers(accessToken);
      replaceCustomers(rows);
    } catch (_) {
      return;
    }
    try {
      await loadChecks();
    } catch (_) {}
    try {
      await loadWallet();
    } catch (_) {}
  }

  Future<void> loadChecks() async {
    if (accessToken.isEmpty) return;
    final rows = await listMyCreditReports(accessToken);
    checks
      ..clear()
      ..addAll(rows);
    for (final customer in customers) {
      final mobile = customer.phone.replaceAll(RegExp(r'\D'), '');
      final mine = checks.where((check) => check.mobile.replaceAll(RegExp(r'\D'), '') == mobile && mobile.isNotEmpty);
      final scored = mine.where((check) => check.status == 'ready' && check.score != null);
      final ready = mine.where((check) => check.status == 'ready');
      if (scored.isNotEmpty) {
        customer.sampleScore = scored.first.score;
        customer.cibil = CibilState.ready;
      } else if (ready.isNotEmpty) {
        customer.cibil = CibilState.ready;
      }
    }
    notifyListeners();
  }

  void replaceCustomers(List<SavedCustomer> rows) {
    customers
      ..clear()
      ..addAll(rows.map((row) {
        final parts = row.dateOfBirth.split('-');
        final dob = parts.length == 3 ? DateTime.tryParse(row.dateOfBirth) : null;
        final checked = row.cibil == 'Checked' || row.score != null;
        return Customer(
          id: row.id,
          name: row.name,
          phone: row.mobile,
          city: '',
          kyc: KycStatus.pending,
          cibil: checked ? CibilState.ready : CibilState.pending,
          sampleScore: row.score,
          dob: dob,
          pan: row.pan,
          email: row.email,
        );
      }));
    notifyListeners();
  }

  Customer addCustomer({
    required String name,
    required String phone,
    required DateTime dob,
    required String pan,
    required String email,
    String? id,
  }) {
    final customer = Customer(
      id: id ?? 'C$_customerSeq',
      name: name.trim(),
      phone: phone.trim(),
      city: '',
      kyc: KycStatus.pending,
      dob: dob,
      pan: pan.trim().toUpperCase(),
      email: email.trim(),
    );
    if (id == null) _customerSeq += 1;
    customers.insert(0, customer);
    notices.insert(0, DeskNotice(title: 'Customer added', body: '${customer.name} is on your desk.'));
    notifyListeners();
    return customer;
  }

  void markChecking(Customer customer) {
    customer.cibil = CibilState.checking;
    notifyListeners();
  }

  void clearChecking(Customer customer) {
    customer.cibil = CibilState.pending;
    notifyListeners();
  }

  void recordCibil(Customer customer, int score) {
    customer.sampleScore = score;
    customer.cibil = CibilState.ready;
    customer.noted = DateTime.now();
    notices.insert(0, DeskNotice(title: 'Credit analytics report', body: '${customer.name} · $score'));
    notifyListeners();
  }

  void recordCreditMessage(Customer customer, String message) {
    customer.cibil = CibilState.ready;
    customer.noted = DateTime.now();
    notices.insert(0, DeskNotice(title: 'Credit analytics report', body: '${customer.name} · $message'));
    notifyListeners();
  }

  void addConsent(Customer customer, String purpose) {
    customer.consents.insert(0, ConsentRecord(purpose: purpose, at: DateTime.now()));
    notices.insert(0, DeskNotice(title: 'Consent saved', body: '${customer.name} agreed to $purpose.'));
    notifyListeners();
  }

  void addDocument(Customer customer, String name, String kind) {
    customer.documents.insert(0, DeskDocument(name: name.trim(), kind: kind));
    notifyListeners();
  }

  void sendKycForReview(Customer customer) {
    if (customer.kyc != KycStatus.pending || customer.documents.isEmpty) return;
    customer.kyc = KycStatus.review;
    notices.insert(0, DeskNotice(title: 'KYC in review', body: '${customer.name} is waiting on a document check.'));
    notifyListeners();
  }

  void addLoan({required String customerId, required int amount, required String purpose, required String note}) {
    final loan = LoanFile(
      id: 'BG-$_loanSeq',
      customerId: customerId,
      amount: amount,
      purpose: purpose,
      note: note.trim(),
      status: LoanStatus.draft,
      created: DateTime.now(),
    );
    _loanSeq += 1;
    loans.insert(0, loan);
    notifyListeners();
  }

  void advance(LoanFile loan) {
    if (loan.status == LoanStatus.draft) {
      loan.status = LoanStatus.submitted;
    } else if (loan.status == LoanStatus.submitted) {
      loan.status = LoanStatus.review;
    } else {
      return;
    }
    final customer = customerById(loan.customerId);
    notices.insert(0, DeskNotice(title: loan.status.label, body: '${loan.id} for ${customer?.name ?? 'a customer'}.'));
    notifyListeners();
  }

  void markRead(DeskNotice notice) {
    if (notice.read) return;
    notice.read = true;
    notifyListeners();
  }

  void markAllRead() {
    var changed = false;
    for (final notice in notices) {
      if (!notice.read) {
        notice.read = true;
        changed = true;
      }
    }
    if (changed) notifyListeners();
  }
}
