import 'dart:math' as math;

import 'package:flutter/material.dart';

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
      store.showToast(false, 'Enter the OTP', 'Use the OTP the customer received.');
      return;
    }
    final names = person.name.trim().split(RegExp(r'\s+'));
    if (names.length < 2) {
      store.showToast(false, 'Name needs two parts', 'AO Pay needs a first name and a last name.');
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
        customer = person;
      });
      store.showToast(true, 'Report ready', report.score == null ? report.message : '${person.name} · ${report.score}');
      store.loadChecks();
    } on ApiException catch (error) {
      store.clearChecking(person);
      if (!mounted) return;
      setState(() => loading = false);
      store.showToast(false, 'Report was not ready', error.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    final person = customer;
    return Scaffold(
      backgroundColor: const Color(0xFFF3F6FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        foregroundColor: dashNavy,
        title: const Text('Credit analytics report', style: TextStyle(fontWeight: FontWeight.w800)),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 20, 16, 28),
        children: [
          if (person == null)
            const Text('That customer is not on this desk.', style: TextStyle(color: muted))
          else if (loading)
            _Fetching(name: person.name)
          else if (message.isNotEmpty)
            _Result(customer: person, score: score, message: message)
          else
            _ConsentForm(
              customer: person,
              missing: missing,
              agreed: agreed,
              otp: otp,
              onAgree: (value) => setState(() => agreed = value ?? false),
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
          const Text('Requesting the AO Pay report', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: dashNavy)),
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
    required this.onSubmit,
  });

  final Customer customer;
  final String missing;
  final bool agreed;
  final TextEditingController otp;
  final ValueChanged<bool?> onAgree;
  final VoidCallback? onSubmit;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(customer.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: dashNavy)),
              const SizedBox(height: 8),
              const Text('AO Pay Credit Analytics uses these saved details.', style: TextStyle(color: Color(0xFF5C677A), fontSize: 13, height: 1.35)),
              const SizedBox(height: 10),
              _Line(label: 'Mobile', value: customer.phone.isEmpty ? 'Missing' : '+91 ${phoneLabel(customer.phone)}'),
              _Line(label: 'Date of birth', value: customer.dob == null ? 'Missing' : _iso(customer.dob!)),
              _Line(label: 'Email', value: customer.email.isEmpty ? 'Missing' : customer.email),
              _Line(label: 'PAN', value: customer.pan.isEmpty ? 'Missing' : maskPan(customer.pan)),
              if (missing.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(missing, style: const TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w700, fontSize: 12, height: 1.35)),
              ],
            ],
          ),
        ),
        const SizedBox(height: 12),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Customer consent', style: TextStyle(fontWeight: FontWeight.w800, color: dashNavy)),
              const SizedBox(height: 6),
              Text(_consent, style: const TextStyle(color: Color(0xFF5C677A), fontSize: 13, height: 1.35)),
              CheckboxListTile(
                contentPadding: EdgeInsets.zero,
                value: agreed,
                activeColor: dashBlue,
                onChanged: missing.isEmpty ? onAgree : null,
                title: const Text('The customer accepted this consent.', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: dashNavy)),
                controlAffinity: ListTileControlAffinity.leading,
              ),
              const Text('OTP', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: dashNavy)),
              const SizedBox(height: 6),
              TextField(
                controller: otp,
                keyboardType: TextInputType.number,
                enabled: missing.isEmpty,
                style: const TextStyle(fontWeight: FontWeight.w700, color: dashNavy),
                decoration: InputDecoration(
                  hintText: 'OTP from the customer',
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE6EBF5))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE6EBF5))),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        FilledButton(
          onPressed: onSubmit,
          style: FilledButton.styleFrom(
            backgroundColor: dashBlue,
            foregroundColor: Colors.white,
            minimumSize: const Size.fromHeight(48),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            textStyle: const TextStyle(fontWeight: FontWeight.w800),
          ),
          child: const Text('Get credit analytics report'),
        ),
      ],
    );
  }
}

class _Result extends StatelessWidget {
  const _Result({required this.customer, required this.score, required this.message});

  final Customer customer;
  final int? score;
  final String message;

  @override
  Widget build(BuildContext context) {
    final band = score == null ? null : _band(score!);
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
                    painter: _Gauge(score: score!, color: band.$2),
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
              if (message.isNotEmpty) _Line(label: 'AO Pay', value: message),
              _Line(label: 'Fetched', value: customer.noted == null ? 'Just now' : prettyDate(customer.noted!)),
            ],
          ),
        ),
        const SizedBox(height: 16),
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
