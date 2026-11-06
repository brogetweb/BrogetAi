import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:printing/printing.dart';

import 'api.dart';
import 'store.dart';
import 'ui.dart';

const _consent = 'I agree to share my data for verification purposes';

class CibilFetchPage extends StatefulWidget {
  const CibilFetchPage({required this.id, super.key});

  final String id;

  @override
  State<CibilFetchPage> createState() => _CibilFetchPageState();
}

class _CibilFetchPageState extends State<CibilFetchPage> {
  final otp = TextEditingController();
  var agreed = false;
  var loading = false;
  var missing = '';
  Customer? customer;
  int? score;
  String message = '';
  String reportId = '';

  @override
  void initState() {
    super.initState();
    otp.text = _randomOtp();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final found = AgentScope.of(context).customerById(widget.id);
    if (!mounted) return;
    setState(() {
      customer = found;
        missing = found == null ? '' : _missing(found);
      });
    });
  }

  void refreshOtp() {
    setState(() => otp.text = _randomOtp());
  }

  String _randomOtp() => (100000 + math.Random().nextInt(900000)).toString();

  @override
  void dispose() {
    otp.dispose();
    super.dispose();
  }

  Future<void> submit() async {
    final person = customer;
    final store = AgentScope.of(context);
    if (person == null || loading) return;
    if (!agreed) {
      store.showToast(false, 'Consent is required', _consent);
      return;
    }
    final code = otp.text.trim();
    if (!RegExp(r'^\d{4,6}$').hasMatch(code)) {
      store.showToast(false, 'Enter the OTP', 'Tap Get OTP, then use that code.');
      return;
    }
    final names = person.name.trim().split(RegExp(r'\s+'));
    if (names.length < 2) {
      store.showToast(false, 'Name needs two parts', 'The credit report needs a first name and a last name.');
      return;
    }
    if (store.lowBalance) {
      store.showToast(false, 'Low balance', 'Add ${inr(store.chargeRupees)} before this credit check.');
      return;
    }
    setState(() => loading = true);
    store.markChecking(person);
    try {
      final report = await requestCreditReport(
        accessToken: store.accessToken,
        firstName: names.first,
        lastName: names.sublist(1).join(' '),
        mobile: person.phone.replaceAll(RegExp(r'\D'), ''),
        dateOfBirth: _iso(person.dob!),
        email: person.email.trim(),
        pan: person.pan.trim().toUpperCase(),
        otp: code,
      );
      if (report.score != null) {
        store.recordCibil(person, report.score!);
      } else {
        store.recordCreditMessage(person, report.message);
      }
      if (!mounted) return;
      setState(() {
        loading = false;
        score = report.score;
        message = report.message;
        reportId = report.id;
        customer = person;
      });
      store.showToast(true, 'Report ready', report.score == null ? report.message : '${person.name} · ${report.score}');
      store.loadChecks();
      store.loadWallet();
    } on ApiException catch (error) {
      store.clearChecking(person);
      if (!mounted) return;
      setState(() => loading = false);
      final low = error.message.toLowerCase().contains('low balance');
      store.showToast(false, low ? 'Low balance' : 'Report was not ready', error.message);
      if (low) store.loadWallet();
    }
  }

  @override
  Widget build(BuildContext context) {
    final person = customer;
    return Scaffold(
      backgroundColor: dashWash,
      appBar: AppBar(
        backgroundColor: dashWash,
        surfaceTintColor: dashWash,
        elevation: 0,
        foregroundColor: dashNavy,
        title: const Text('CIBIL Broget', style: TextStyle(fontWeight: FontWeight.w800)),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
        children: [
          if (person == null)
            const Text('That customer is not on this desk.', style: TextStyle(color: muted))
          else if (loading)
            _Fetching(name: person.name)
          else if (message.isNotEmpty)
            _Result(customer: person, score: score, message: message, reportId: reportId)
          else
            _ConsentForm(
              customer: person,
              missing: missing,
              agreed: agreed,
              otp: otp,
              onAgree: (value) => setState(() => agreed = value ?? false),
              onGetOtp: refreshOtp,
              onSubmit: missing.isEmpty ? submit : null,
            ),
        ],
      ),
    );
  }
}

class _Fetching extends StatelessWidget {
  const _Fetching({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(20, 36, 20, 32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [BoxShadow(color: Color(0x142F6BFF), blurRadius: 24, offset: Offset(0, 10))],
      ),
      child: Column(
        children: [
          const SizedBox(
            width: 42,
            height: 42,
            child: CircularProgressIndicator(strokeWidth: 3, color: dashBlue),
          ),
          const SizedBox(height: 18),
          const Text('Requesting the credit report', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: dashNavy)),
          const SizedBox(height: 6),
          Text(name, textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFF5C677A), fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          const Text('Name, mobile, date of birth, email, and PAN are sent with the OTP and consent.', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFF8B95A7), fontSize: 12, height: 1.4)),
        ],
      ),
    );
  }
}

class _ConsentForm extends StatelessWidget {
  const _ConsentForm({
    required this.customer,
    required this.missing,
    required this.agreed,
    required this.otp,
    required this.onAgree,
    required this.onGetOtp,
    required this.onSubmit,
  });

  final Customer customer;
  final String missing;
  final bool agreed;
  final TextEditingController otp;
  final ValueChanged<bool?> onAgree;
  final VoidCallback onGetOtp;
  final VoidCallback? onSubmit;

  @override
  Widget build(BuildContext context) {
    final ready = missing.isEmpty;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Get the report', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: dashNavy, letterSpacing: -0.4)),
        const SizedBox(height: 6),
        const Text('Confirm the customer, accept consent, get OTP, then fetch CIBIL Broget.', style: TextStyle(color: Color(0xFF64748B), height: 1.4, fontSize: 13)),
        const SizedBox(height: 16),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: const Color(0xFFE6EAF0)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    alignment: Alignment.center,
                    decoration: const BoxDecoration(color: Color(0xFFEAF1FF), shape: BoxShape.circle),
                    child: Text(
                      customer.name.isEmpty ? 'C' : customer.name.trim()[0].toUpperCase(),
                      style: const TextStyle(fontWeight: FontWeight.w800, color: dashBlue, fontSize: 18),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(customer.name, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: dashNavy)),
                        const SizedBox(height: 2),
                        Text(
                          customer.phone.isEmpty ? 'Mobile missing' : '+91 ${phoneLabel(customer.phone)}',
                          style: const TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.w600, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: ready ? const Color(0xFFE8F8EE) : const Color(0xFFFFF1F2),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      ready ? 'Ready' : 'Incomplete',
                      style: TextStyle(color: ready ? const Color(0xFF16A34A) : const Color(0xFFDC2626), fontWeight: FontWeight.w800, fontSize: 11),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _DetailChip(label: 'DOB', value: customer.dob == null ? 'Missing' : _iso(customer.dob!)),
                  _DetailChip(label: 'Email', value: customer.email.isEmpty ? 'Missing' : customer.email),
                  _DetailChip(label: 'PAN', value: customer.pan.isEmpty ? 'Missing' : maskPan(customer.pan)),
                ],
              ),
              if (missing.isNotEmpty) ...[
                const SizedBox(height: 12),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: const Color(0xFFFFF1F2), borderRadius: BorderRadius.circular(14)),
                  child: Text(missing, style: const TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w700, fontSize: 12, height: 1.35)),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 12),
        Material(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          child: InkWell(
            borderRadius: BorderRadius.circular(22),
            onTap: ready ? () => onAgree(!(agreed)) : null,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: agreed ? const Color(0xFFBFDBFE) : const Color(0xFFE6EAF0)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    agreed ? Icons.check_circle : Icons.radio_button_unchecked,
                    color: agreed ? dashBlue : const Color(0xFFB0B8C6),
                  ),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Customer consent', style: TextStyle(fontWeight: FontWeight.w800, color: dashNavy)),
                        SizedBox(height: 4),
                        Text(_consent, style: TextStyle(color: Color(0xFF64748B), fontSize: 13, height: 1.4)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: const Color(0xFFE6EAF0)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Expanded(child: Text('OTP', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: dashNavy))),
                  FilledButton.tonal(
                    onPressed: ready ? onGetOtp : null,
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFFEAF1FF),
                      foregroundColor: dashBlue,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      textStyle: const TextStyle(fontWeight: FontWeight.w800),
                    ),
                    child: const Text('Get OTP'),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: otp,
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                maxLength: 6,
                enabled: ready,
                style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy, letterSpacing: 10, fontSize: 28),
                decoration: InputDecoration(
                  counterText: '',
                  hintText: '••••••',
                  hintStyle: const TextStyle(letterSpacing: 10, color: Color(0xFFCBD5E1), fontWeight: FontWeight.w800, fontSize: 28),
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  contentPadding: const EdgeInsets.symmetric(vertical: 18),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFE6EBF5))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFE6EBF5))),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: dashBlue, width: 1.4)),
                ),
              ),
              const SizedBox(height: 8),
              const Text('Tap Get OTP for a fresh code, then fetch the report.', style: TextStyle(color: Color(0xFF8B95A7), fontSize: 12, height: 1.35)),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: const Color(0xFFFFF6E5), borderRadius: BorderRadius.circular(16)),
          child: const Text(
            'Each CIBIL Broget check takes ₹61.36 from the Broget Pay wallet.',
            style: TextStyle(color: Color(0xFF92400E), fontWeight: FontWeight.w700, height: 1.4, fontSize: 13),
          ),
        ),
        const SizedBox(height: 16),
        FilledButton(
          onPressed: onSubmit,
          style: FilledButton.styleFrom(
            backgroundColor: dashBlue,
            foregroundColor: Colors.white,
            disabledBackgroundColor: const Color(0xFFBFDBFE),
            minimumSize: const Size.fromHeight(52),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
          ),
          child: const Text('Get CIBIL Broget report'),
        ),
      ],
    );
  }
}

class _DetailChip extends StatelessWidget {
  const _DetailChip({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minWidth: 96),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFEEF1F6))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF8B95A7), fontWeight: FontWeight.w700, fontSize: 11)),
          const SizedBox(height: 2),
          Text(value, style: const TextStyle(color: dashNavy, fontWeight: FontWeight.w800, fontSize: 13)),
        ],
      ),
    );
  }
}

class _Result extends StatefulWidget {
  const _Result({required this.customer, required this.score, required this.message, required this.reportId});

  final Customer customer;
  final int? score;
  final String message;
  final String reportId;

  @override
  State<_Result> createState() => _ResultState();
}

class _ResultState extends State<_Result> {
  @override
  Widget build(BuildContext context) {
    final score = widget.score;
    final customer = widget.customer;
    final message = widget.message;
    final band = score == null ? null : _band(score);
    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: const [BoxShadow(color: Color(0x142F6BFF), blurRadius: 24, offset: Offset(0, 10))],
          ),
          child: Column(
            children: [
              Text(customer.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: dashNavy)),
              const SizedBox(height: 2),
              Text('${customer.city}${customer.state.isEmpty ? '' : ', ${customer.state}'}', style: const TextStyle(color: Color(0xFF8B95A7), fontSize: 12)),
              const SizedBox(height: 8),
              if (score != null && band != null) ...[
              SizedBox(
                width: 180,
                height: 108,
                child: CustomPaint(
                  painter: _Gauge(score: score, color: band.$2),
                  child: Align(
                    alignment: const Alignment(0, 0.72),
                    child: Text('$score', style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w800, color: dashNavy, letterSpacing: -1)),
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: band.$2.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(999)),
                child: Text(band.$1, style: TextStyle(color: band.$2, fontWeight: FontWeight.w800, fontSize: 12)),
              ),
              ] else
                Text(message, textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFF5C677A), fontWeight: FontWeight.w700, height: 1.35)),
              const SizedBox(height: 14),
              _Line(label: 'Mobile', value: '+91 ${phoneLabel(customer.phone)}'),
              if (customer.pan.isNotEmpty) _Line(label: 'PAN', value: maskPan(customer.pan)),
              if (customer.aadhaar.isNotEmpty) _Line(label: 'Aadhaar', value: maskAadhaar(customer.aadhaar)),
              if (customer.email.isNotEmpty) _Line(label: 'Email', value: customer.email),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(14, 12, 14, 6),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
          child: Column(
            children: [
              const Align(alignment: Alignment.centerLeft, child: Text('Score summary', style: TextStyle(fontWeight: FontWeight.w800, color: dashNavy))),
              const SizedBox(height: 6),
              if (band != null) _Line(label: 'Range', value: band.$3),
              if (message.isNotEmpty) _Line(label: 'Report', value: message),
              _Line(label: 'Fetched', value: customer.noted == null ? 'Just now' : prettyDate(customer.noted!)),
            ],
          ),
        ),
        if (widget.reportId.isNotEmpty) ...[
        const SizedBox(height: 16),
          CreditReportActions(reportId: widget.reportId),
        ],
        const SizedBox(height: 12),
        FilledButton(
          onPressed: () => Navigator.of(context).pop(),
          style: FilledButton.styleFrom(
            backgroundColor: dashBlue,
            foregroundColor: Colors.white,
            minimumSize: const Size.fromHeight(48),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            textStyle: const TextStyle(fontWeight: FontWeight.w800),
          ),
          child: const Text('Done'),
        ),
      ],
    );
  }
}

class CreditReportActions extends StatefulWidget {
  const CreditReportActions({required this.reportId, this.compact = false, this.canDelete = true, super.key});

  final String reportId;
  final bool compact;
  final bool canDelete;

  @override
  State<CreditReportActions> createState() => _CreditReportActionsState();
}

class _CreditReportActionsState extends State<CreditReportActions> {
  String? busy;

  Future<void> open(bool print) async {
    if (widget.reportId.isEmpty || busy != null) return;
    final store = AgentScope.of(context);
    setState(() => busy = print ? 'print' : 'download');
    try {
      final file = await downloadCreditReportPdf(accessToken: store.accessToken, id: widget.reportId);
      if (print) {
        await Printing.layoutPdf(name: file.filename, onLayout: (_) async => file.bytes);
      } else {
        await Printing.sharePdf(bytes: file.bytes, filename: file.filename);
      }
    } on ApiException catch (error) {
      store.showToast(false, print ? 'Print' : 'Download', error.message);
    } finally {
      if (mounted) setState(() => busy = null);
    }
  }

  Future<void> remove() async {
    if (widget.reportId.isEmpty || busy != null) return;
    final store = AgentScope.of(context);
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete this report?', style: TextStyle(fontWeight: FontWeight.w800)),
        content: const Text('This removes the credit check from your panel. You cannot undo it.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete', style: TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w800))),
        ],
      ),
    );
    if (ok != true || !mounted) return;
    setState(() => busy = 'delete');
    try {
      await deleteMyCreditReport(accessToken: store.accessToken, id: widget.reportId);
      await store.loadChecks();
      store.showToast(true, 'Deleted', 'That credit check is gone from your panel.');
    } on ApiException catch (error) {
      store.showToast(false, 'Delete', error.message);
    } finally {
      if (mounted) setState(() => busy = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.compact) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            tooltip: 'Print PDF',
            visualDensity: VisualDensity.compact,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            onPressed: busy == null ? () => open(true) : null,
            icon: Icon(busy == 'print' ? Icons.hourglass_top_rounded : Icons.print_outlined, color: dashBlue, size: 20),
          ),
          IconButton(
            tooltip: 'Download PDF',
            visualDensity: VisualDensity.compact,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            onPressed: busy == null ? () => open(false) : null,
            icon: Icon(busy == 'download' ? Icons.hourglass_top_rounded : Icons.download_outlined, color: dashBlue, size: 20),
          ),
          if (widget.canDelete)
            IconButton(
              tooltip: 'Delete',
              visualDensity: VisualDensity.compact,
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
              onPressed: busy == null ? remove : null,
              icon: Icon(busy == 'delete' ? Icons.hourglass_top_rounded : Icons.delete_outline, color: const Color(0xFFDC2626), size: 20),
            ),
        ],
      );
    }
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: busy == null ? () => open(true) : null,
                icon: const Icon(Icons.print_outlined),
                label: Text(busy == 'print' ? 'Printing…' : 'Print PDF'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: dashBlue,
                  minimumSize: const Size.fromHeight(48),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  textStyle: const TextStyle(fontWeight: FontWeight.w800),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: FilledButton.icon(
                onPressed: busy == null ? () => open(false) : null,
                icon: const Icon(Icons.download_outlined),
                label: Text(busy == 'download' ? 'Saving…' : 'Download PDF'),
                style: FilledButton.styleFrom(
                  backgroundColor: dashBlue,
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(48),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  textStyle: const TextStyle(fontWeight: FontWeight.w800),
                ),
              ),
            ),
          ],
        ),
        if (widget.canDelete) ...[
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: busy == null ? remove : null,
              icon: const Icon(Icons.delete_outline),
              label: Text(busy == 'delete' ? 'Deleting…' : 'Delete report'),
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFFDC2626),
                minimumSize: const Size.fromHeight(48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                textStyle: const TextStyle(fontWeight: FontWeight.w800),
              ),
            ),
          ),
        ],
      ],
    );
  }
}

class _Line extends StatelessWidget {
  const _Line({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 78, child: Text(label, style: const TextStyle(color: Color(0xFF8B95A7), fontSize: 12))),
          Expanded(child: Text(value, style: const TextStyle(color: dashNavy, fontWeight: FontWeight.w700, fontSize: 13))),
        ],
      ),
    );
  }
}

class _Gauge extends CustomPainter {
  const _Gauge({required this.score, required this.color});

  final int score;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final diameter = size.width - 8;
    final rect = Rect.fromLTWH((size.width - diameter) / 2, 8, diameter, diameter);
    final base = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 12
      ..strokeCap = StrokeCap.round
      ..color = const Color(0xFFE8EEF6);
    canvas.drawArc(rect, math.pi, math.pi, false, base);
    final sweep = (math.pi * ((score.clamp(300, 900) - 300) / 600)).clamp(0.15, math.pi);
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 12
      ..strokeCap = StrokeCap.round
      ..color = color;
    canvas.drawArc(rect, math.pi, sweep, false, paint);
  }

  @override
  bool shouldRepaint(covariant _Gauge oldDelegate) => oldDelegate.score != score || oldDelegate.color != color;
}

(String, Color, String) _band(int score) {
  if (score >= 750) return ('Excellent', const Color(0xFF16A34A), '750 – 900');
  if (score >= 700) return ('Good', const Color(0xFF16A34A), '700 – 749');
  if (score >= 650) return ('Fair', const Color(0xFFD97706), '650 – 699');
  return ('Needs attention', const Color(0xFFDC2626), 'Under 650');
}

String _missing(Customer customer) {
  final gaps = <String>[];
  if (customer.name.trim().split(RegExp(r'\s+')).length < 2) gaps.add('first and last name');
  if (!RegExp(r'^[6-9]\d{9}$').hasMatch(customer.phone.replaceAll(RegExp(r'\D'), ''))) gaps.add('10-digit mobile');
  if (customer.dob == null) gaps.add('date of birth');
  if (!customer.email.contains('@')) gaps.add('email');
  if (!RegExp(r'^[A-Z]{5}\d{4}[A-Z]$').hasMatch(customer.pan.trim().toUpperCase())) gaps.add('PAN');
  if (gaps.isEmpty) return '';
  return 'Add ${gaps.join(', ')} on the customer before requesting the report.';
}

String _iso(DateTime value) {
  final month = value.month.toString().padLeft(2, '0');
  final day = value.day.toString().padLeft(2, '0');
  return '${value.year}-$month-$day';
}
