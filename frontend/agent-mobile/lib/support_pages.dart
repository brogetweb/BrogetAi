import 'package:flutter/material.dart';

import 'ui.dart';

class HelpSupportPage extends StatelessWidget {
  const HelpSupportPage({super.key});

  @override
  Widget build(BuildContext context) {
    return _SupportFrame(
      title: 'Help & Support',
      children: const [
        _Intro(icon: Icons.headset_mic_outlined, wash: Color(0xFFEAF1FF), color: dashBlue, title: 'How can we help?', body: 'Answers for the desk tools you use every day. Records stay on this device.'),
        SizedBox(height: 14),
        _Faq(question: 'How do I add a customer?', answer: 'Enter the first name, last name, mobile, date of birth, email, and PAN. Those are the details AO Pay uses for the credit analytics report.'),
        _Faq(question: 'How do I check a credit analytics report?', answer: 'Open CIBIL Check, select the customer, confirm consent, enter the OTP, then get the report.'),
        _Faq(question: 'Where do KYC documents go?', answer: 'KYC & Documents keeps Aadhaar, PAN, selfie, and address proof on this device. Submit for Verification moves the file to step 2.'),
        _Faq(question: 'How do I update my profile?', answer: 'Open Profile and tap Edit Profile. You can change your name, mobile number, and email. Agent ID and company stay fixed.'),
        SizedBox(height: 8),
        _ContactCard(),
      ],
    );
  }
}

class TermsPage extends StatelessWidget {
  const TermsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const _SupportFrame(
      title: 'Terms & Conditions',
      children: [
        _Intro(icon: Icons.article_outlined, wash: Color(0xFFFFF6E5), color: Color(0xFFD97706), title: 'Desk terms', body: 'These terms describe how the BerogetAI agent desk works on this device.'),
        SizedBox(height: 14),
        _Clause(index: '01', title: 'The desk', body: 'The app is a working desk for customers, KYC, and CIBIL checks. It does not approve a loan or complete a payment.'),
        _Clause(index: '02', title: 'Customer records', body: 'Names, contact details, and identity fields you enter stay on this device until the app restarts. You are responsible for what you type.'),
        _Clause(index: '03', title: 'Credit checks', body: 'A check runs only after you add a customer or select one on CIBIL Check. The score shown is the one saved for that customer on this desk.'),
        _Clause(index: '04', title: 'Your account', body: 'Keep your password private. Signing out ends the session on this device. Profile edits stay until the app restarts.'),
      ],
    );
  }
}

class PrivacyPage extends StatelessWidget {
  const PrivacyPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const _SupportFrame(
      title: 'Privacy Policy',
      children: [
        _Intro(icon: Icons.shield_outlined, wash: Color(0xFFE8F8EE), color: Color(0xFF16A34A), title: 'Your data on this desk', body: 'BerogetAI keeps the agent desk private. Here is what stays on the phone, and what is masked.'),
        SizedBox(height: 14),
        _Clause(index: '01', title: 'What is stored', body: 'Customer profiles, consents, KYC labels, and score results stay in the app session on this device.'),
        _Clause(index: '02', title: 'PAN and Aadhaar', body: 'You enter them on the add-customer form so a check can run. Outside that form they are masked on the customer file and on the score screen.'),
        _Clause(index: '03', title: 'Documents', body: 'KYC previews are shown in the app. A file is not sent to a server from this build.'),
        _Clause(index: '04', title: 'How long it stays', body: 'Records remain until you restart the app. Signing out ends the session. It does not upload the desk somewhere else.'),
      ],
    );
  }
}

class AboutPage extends StatelessWidget {
  const AboutPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const _SupportFrame(
      title: 'About BerogetAI',
      children: [
        _AboutHero(),
        SizedBox(height: 14),
        _Feature(icon: Icons.person_add_alt_1, wash: Color(0xFFEAF1FF), color: dashBlue, title: 'Customers', body: 'Add a customer in five steps and keep the file on your desk.'),
        _Feature(icon: Icons.speed, wash: Color(0xFFE8F8EE), color: Color(0xFF16A34A), title: 'CIBIL Check', body: 'Pick a saved customer and fetch the report from their profile.'),
        _Feature(icon: Icons.badge_outlined, wash: Color(0xFFFFF6E5), color: Color(0xFFD97706), title: 'KYC', body: 'Aadhaar, PAN, selfie, and address proof, then submit for verification.'),
        _Feature(icon: Icons.verified_user_outlined, wash: Color(0xFFF3E8FF), color: Color(0xFF7C3AED), title: 'On this device', body: 'The desk does not approve a loan or complete a payment from here.'),
      ],
    );
  }
}

class _SupportFrame extends StatelessWidget {
  const _SupportFrame({required this.title, required this.children});

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        foregroundColor: dashNavy,
        leading: IconButton(onPressed: () => Navigator.of(context).pop(), icon: const Icon(Icons.arrow_back)),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
        children: children,
      ),
    );
  }
}

class _Intro extends StatelessWidget {
  const _Intro({required this.icon, required this.wash, required this.color, required this.title, required this.body});

  final IconData icon;
  final Color wash;
  final Color color;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: const Color(0xFFEEF1F6))),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 42,
            height: 42,
            alignment: Alignment.center,
            decoration: BoxDecoration(color: wash, borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: dashNavy)),
                const SizedBox(height: 4),
                Text(body, style: const TextStyle(color: Color(0xFF5C677A), height: 1.4, fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Faq extends StatefulWidget {
  const _Faq({required this.question, required this.answer});

  final String question;
  final String answer;

  @override
  State<_Faq> createState() => _FaqState();
}

class _FaqState extends State<_Faq> {
  var open = false;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          onTap: () => setState(() => open = !open),
          borderRadius: BorderRadius.circular(14),
          child: Container(
            padding: const EdgeInsets.fromLTRB(14, 12, 12, 12),
            decoration: BoxDecoration(borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFEEF1F6))),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(child: Text(widget.question, style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy, fontSize: 14))),
                    Icon(open ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, color: const Color(0xFF8B95A7)),
                  ],
                ),
                if (open) ...[
                  const SizedBox(height: 8),
                  Text(widget.answer, style: const TextStyle(color: Color(0xFF5C677A), height: 1.4, fontSize: 13)),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ContactCard extends StatelessWidget {
  const _ContactCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFEEF1F6))),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Contact', style: TextStyle(fontWeight: FontWeight.w800, color: dashNavy)),
          SizedBox(height: 10),
          _ContactRow(icon: Icons.mail_outline, label: 'Email', value: 'support@beroget.ai'),
          SizedBox(height: 8),
          _ContactRow(icon: Icons.schedule, label: 'Hours', value: 'Mon–Sat, 10:00–18:00'),
        ],
      ),
    );
  }
}

class _ContactRow extends StatelessWidget {
  const _ContactRow({required this.icon, required this.label, required this.value});

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: dashBlue),
        const SizedBox(width: 10),
        Text(label, style: const TextStyle(color: Color(0xFF8B95A7), fontSize: 13)),
        const Spacer(),
        Text(value, style: const TextStyle(fontWeight: FontWeight.w700, color: dashNavy, fontSize: 13)),
      ],
    );
  }
}

class _Clause extends StatelessWidget {
  const _Clause({required this.index, required this.title, required this.body});

  final String index;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFEEF1F6))),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(index, style: const TextStyle(color: dashBlue, fontWeight: FontWeight.w800, fontSize: 13)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy)),
                  const SizedBox(height: 4),
                  Text(body, style: const TextStyle(color: Color(0xFF5C677A), height: 1.4, fontSize: 13)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AboutHero extends StatelessWidget {
  const _AboutHero();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 22, 16, 18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        gradient: const LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFF1E4ED8), Color(0xFF2F6BFF)]),
      ),
      child: const Column(
        children: [
          _Plane(),
          SizedBox(height: 10),
          Text('BerogetAI', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
          Text('CREDIT INSIGHTS', style: TextStyle(color: Color(0xFFD6E4FF), fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1)),
          SizedBox(height: 8),
          Text('Agent desk for customers, KYC, and CIBIL checks.', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFFD6E4FF), height: 1.35)),
          SizedBox(height: 10),
          _VersionPill(),
        ],
      ),
    );
  }
}

class _Plane extends StatelessWidget {
  const _Plane();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 52,
      height: 52,
      alignment: Alignment.center,
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
      child: const CibilBadge(size: 52),
    );
  }
}

class _VersionPill extends StatelessWidget {
  const _VersionPill();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.16), borderRadius: BorderRadius.circular(999)),
      child: const Text('Version 1.0.0', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12)),
    );
  }
}

class _Feature extends StatelessWidget {
  const _Feature({required this.icon, required this.wash, required this.color, required this.title, required this.body});

  final IconData icon;
  final Color wash;
  final Color color;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFEEF1F6))),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 36,
              height: 36,
              alignment: Alignment.center,
              decoration: BoxDecoration(color: wash, borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, color: color, size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy)),
                  const SizedBox(height: 2),
                  Text(body, style: const TextStyle(color: Color(0xFF5C677A), height: 1.35, fontSize: 13)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
