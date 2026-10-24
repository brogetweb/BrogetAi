import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'api.dart';
import 'cibil_fetch.dart';
import 'ui.dart';

class AddCustomerPage extends StatefulWidget {
  const AddCustomerPage({super.key});

  @override
  State<AddCustomerPage> createState() => _AddCustomerPageState();
}

class _AddCustomerPageState extends State<AddCustomerPage> {
  final firstName = TextEditingController();
  final lastName = TextEditingController();
  final mobile = TextEditingController();
  final email = TextEditingController();
  final pan = TextEditingController();
  var saving = false;
  var error = '';
  DateTime? dob;

  @override
  void dispose() {
    firstName.dispose();
    lastName.dispose();
    mobile.dispose();
    email.dispose();
    pan.dispose();
    super.dispose();
  }

  String? problem() {
    if (firstName.text.trim().length < 1) return 'Enter the first name.';
    if (lastName.text.trim().length < 1) return 'Enter the last name.';
    if (!RegExp(r'^[6-9]\d{9}$').hasMatch(mobile.text.trim())) return 'Enter a 10-digit mobile number.';
    if (dob == null) return 'Choose the date of birth.';
    if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(email.text.trim())) return 'Enter a valid email address.';
    if (!RegExp(r'^[A-Z]{5}\d{4}[A-Z]$').hasMatch(pan.text.trim().toUpperCase())) return 'Enter a 10-character PAN.';
    return null;
  }

  Future<void> save() async {
    final message = problem();
    if (message != null) {
      setState(() => error = message);
      return;
    }
    if (saving) return;
    setState(() {
      saving = true;
      error = '';
    });
    final store = AgentScope.of(context);
    try {
      final saved = await createCustomer(
        accessToken: store.accessToken,
        firstName: firstName.text.trim(),
        lastName: lastName.text.trim(),
        mobile: mobile.text.trim(),
        dateOfBirth: _iso(dob!),
        email: email.text.trim(),
        pan: pan.text.trim().toUpperCase(),
      );
      final customer = store.addCustomer(
        id: saved.id,
        name: saved.name,
        phone: saved.mobile,
        dob: dob!,
        pan: saved.pan,
        email: saved.email,
      );
      store.showToast(true, 'Customer added', saved.name);
      if (!mounted) return;
      await Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => CibilFetchPage(id: customer.id)));
    } on ApiException catch (caught) {
      if (!mounted) return;
      setState(() {
        saving = false;
        error = caught.message;
      });
      store.showToast(false, 'Could not add the customer', caught.message);
    }
  }

  Future<void> pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: dob ?? DateTime(1990, 1, 1),
      firstDate: DateTime(1940),
      lastDate: DateTime.now(),
    );
    if (picked == null) return;
    setState(() => dob = picked);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F6FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        foregroundColor: dashNavy,
        title: const Text('Add customer', style: TextStyle(fontWeight: FontWeight.w800)),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
        children: [
          const Text('Credit analytics details', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.4, color: dashNavy)),
          const SizedBox(height: 6),
          const Text('Only these details are needed. Consent and the OTP come on the next step.', style: TextStyle(color: Color(0xFF8B95A7), fontSize: 13, height: 1.35)),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
            child: Column(
              children: [
                _Field(label: 'First name', controller: firstName, hint: 'First name', icon: Icons.person_outline, caps: TextCapitalization.words),
                const SizedBox(height: 14),
                _Field(label: 'Last name', controller: lastName, hint: 'Last name', icon: Icons.person_outline, caps: TextCapitalization.words),
                const SizedBox(height: 14),
                _Field(
                  label: 'Mobile',
                  controller: mobile,
                  hint: '10-digit mobile',
                  icon: Icons.phone_outlined,
                  keyboard: TextInputType.phone,
                  prefix: '+91',
                  formatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(10)],
                ),
                const SizedBox(height: 14),
                _DateField(value: dob, onTap: pickDate),
                const SizedBox(height: 14),
                _Field(label: 'Email', controller: email, hint: 'name@email.com', icon: Icons.mail_outline, keyboard: TextInputType.emailAddress),
                const SizedBox(height: 14),
                _Field(
                  label: 'PAN',
                  controller: pan,
                  hint: 'ABCDE1234F',
                  icon: Icons.credit_card,
                  caps: TextCapitalization.characters,
                  formatters: [FilteringTextInputFormatter.allow(RegExp(r'[A-Za-z0-9]')), LengthLimitingTextInputFormatter(10), _UpperCase()],
                ),
                if (error.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Align(alignment: Alignment.centerLeft, child: Text(error, style: const TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w700, fontSize: 13))),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: saving ? null : save,
            style: FilledButton.styleFrom(
              backgroundColor: dashBlue,
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(50),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              textStyle: const TextStyle(fontWeight: FontWeight.w800),
            ),
            child: Text(saving ? 'Saving' : 'Continue'),
          ),
        ],
      ),
    );
  }
}

class _Field extends StatelessWidget {
  const _Field({required this.label, required this.controller, required this.hint, required this.icon, this.keyboard, this.caps, this.formatters, this.prefix});

  final String label;
  final TextEditingController controller;
  final String hint;
  final IconData icon;
  final TextInputType? keyboard;
  final TextCapitalization? caps;
  final List<TextInputFormatter>? formatters;
  final String? prefix;

  @override
  Widget build(BuildContext context) {
    const border = OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12)), borderSide: BorderSide(color: Color(0xFFE2E8F0)));
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: dashNavy)),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          keyboardType: keyboard,
          textCapitalization: caps ?? TextCapitalization.none,
          inputFormatters: formatters,
          style: const TextStyle(fontWeight: FontWeight.w700, color: dashNavy, fontSize: 14),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Color(0xFFB0B8C6), fontWeight: FontWeight.w600),
            prefixIcon: Icon(icon, size: 18, color: const Color(0xFF8B95A7)),
            prefixText: prefix == null ? null : '$prefix  ',
            prefixStyle: const TextStyle(color: dashNavy, fontWeight: FontWeight.w800),
            filled: true,
            fillColor: const Color(0xFFF7F9FC),
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(vertical: 14),
            border: border,
            enabledBorder: border,
            focusedBorder: const OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12)), borderSide: BorderSide(color: dashBlue, width: 1.4)),
          ),
        ),
      ],
    );
  }
}

class _DateField extends StatelessWidget {
  const _DateField({required this.value, required this.onTap});

  final DateTime? value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final empty = value == null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Date of birth', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: dashNavy)),
        const SizedBox(height: 6),
        Material(
          color: const Color(0xFFF7F9FC),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: Color(0xFFE2E8F0))),
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
              child: Row(
                children: [
                  const Icon(Icons.calendar_today_outlined, size: 18, color: Color(0xFF8B95A7)),
                  const SizedBox(width: 10),
                  Text(empty ? 'Select date' : prettyDate(value!), style: TextStyle(color: empty ? const Color(0xFFB0B8C6) : dashNavy, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

String _iso(DateTime value) {
  final month = value.month.toString().padLeft(2, '0');
  final day = value.day.toString().padLeft(2, '0');
  return '${value.year}-$month-$day';
}

class _UpperCase extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    return newValue.copyWith(text: newValue.text.toUpperCase());
  }
}
