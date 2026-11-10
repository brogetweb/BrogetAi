import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:printing/printing.dart';

import 'api.dart';
import 'pay_launch.dart' if (dart.library.html) 'pay_launch_web.dart';
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
  var gender = '';
  var agreed = false;
  var loading = false;
  var missing = '';
  Customer? customer;
  int? score;
  String message = '';
  String reportId = '';
  String reportUrl = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final found = AgentScope.of(context).customerById(widget.id);
    if (!mounted) return;
    setState(() {
      customer = found;
        missing = found == null ? '' : _missing(found);
      });
    });
  }

  Future<void> submit() async {
    final person = customer;
    final store = AgentScope.of(context);
    if (person == null || loading) return;
    if (!agreed) {
      store.showToast(false, 'Consent is required', _consent);
      return;
    }
    if (gender.isEmpty) {
      store.showToast(false, 'Select gender', 'CIBIL needs the customer’s gender as per PAN.');
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
        gender: gender,
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
        reportUrl = report.reportUrl;
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
            _Result(customer: person, score: score, message: message, reportId: reportId, reportUrl: reportUrl)
          else
            _ConsentForm(
              customer: person,
              missing: missing,
              agreed: agreed,
              gender: gender,
              onAgree: (value) => setState(() => agreed = value ?? false),
              onGender: (value) => setState(() => gender = value),
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
          const Text('Name, mobile, gender, and PAN are sent to TransUnion CIBIL with the customer’s consent.', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFF8B95A7), fontSize: 12, height: 1.4)),
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
    required this.gender,
    required this.onAgree,
    required this.onGender,
    required this.onSubmit,
  });

  final Customer customer;
  final String missing;
  final bool agreed;
  final String gender;
  final ValueChanged<bool?> onAgree;
  final ValueChanged<String> onGender;
  final VoidCallback? onSubmit;

  @override
  Widget build(BuildContext context) {
    final ready = missing.isEmpty;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Get the report', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: dashNavy, letterSpacing: -0.4)),
        const SizedBox(height: 6),
        const Text('Confirm the customer, pick gender, accept consent, then fetch CIBIL Broget.', style: TextStyle(color: Color(0xFF64748B), height: 1.4, fontSize: 13)),
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
              const Text('Gender (as per PAN)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: dashNavy)),
              const SizedBox(height: 12),
              Row(
                children: [
                  for (final option in const ['Male', 'Female']) ...[
                    if (option == 'Female') const SizedBox(width: 10),
                    Expanded(
                      child: Material(
                        color: gender == option ? const Color(0xFFEAF1FF) : const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(14),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(14),
                          onTap: ready ? () => onGender(option) : null,
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: gender == option ? dashBlue : const Color(0xFFE6EBF5), width: gender == option ? 1.4 : 1),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(gender == option ? Icons.check_circle : Icons.circle_outlined, size: 18, color: gender == option ? dashBlue : const Color(0xFFB0B8C6)),
                                const SizedBox(width: 8),
                                Text(option, style: TextStyle(fontWeight: FontWeight.w800, color: gender == option ? dashBlue : dashNavy)),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: const Color(0xFFFFF6E5), borderRadius: BorderRadius.circular(16)),
          child: const Text(
            'Each CIBIL Broget check takes ₹61.36 from your wallet.',
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
  const _Result({required this.customer, required this.score, required this.message, required this.reportId, this.reportUrl = ''});

  final Customer customer;
  final int? score;
  final String message;
  final String reportId;
  final String reportUrl;

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
        if (widget.reportUrl.isNotEmpty) ...[
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: () async {
              final uri = Uri.tryParse(widget.reportUrl);
              if (uri == null || !await launchPayment(uri)) {
                if (context.mounted) AgentScope.of(context).showToast(false, 'Full report', 'Could not open the report link.');
              }
            },
            icon: const Icon(Icons.open_in_new_rounded, size: 18),
            label: const Text('View full CIBIL report', style: TextStyle(fontWeight: FontWeight.w800)),
            style: OutlinedButton.styleFrom(
              foregroundColor: dashBlue,
              side: const BorderSide(color: Color(0xFFBFDBFE)),
              minimumSize: const Size.fromHeight(48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ],
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
