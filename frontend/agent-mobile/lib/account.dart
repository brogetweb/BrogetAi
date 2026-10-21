import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'store.dart';
import 'support_pages.dart';
import 'ui.dart';

class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final store = AgentScope.of(context);
    final checked = store.customers.where((customer) => customer.cibil == CibilState.ready).length;
    final progress = store.customers.where((customer) => customer.cibil == CibilState.checking).length;
    final now = DateTime.now();
    final month = store.customers.where((customer) => customer.noted != null && customer.noted!.year == now.year && customer.noted!.month == now.month).length;

    return ColoredBox(
      color: const Color(0xFFF4F7FB),
      child: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
          children: [
            _Top(store: store),
            const SizedBox(height: 14),
            _Hero(store: store),
            const SizedBox(height: 12),
            Row(
              children: [
                _Stat(icon: Icons.people_alt_outlined, wash: const Color(0xFFEAF1FF), color: dashBlue, value: '${store.customers.length}', label: 'Total Customers'),
                const SizedBox(width: 8),
                _Stat(icon: Icons.description_outlined, wash: const Color(0xFFE8F8EE), color: const Color(0xFF16A34A), value: '$checked', label: 'Reports Checked'),
                const SizedBox(width: 8),
                _Stat(icon: Icons.schedule, wash: const Color(0xFFFFF6E5), color: const Color(0xFFD97706), value: '$progress', label: 'In Progress'),
                const SizedBox(width: 8),
                _Stat(icon: Icons.assignment_outlined, wash: const Color(0xFFF3E8FF), color: const Color(0xFF7C3AED), value: '$month', label: 'This Month'),
              ],
            ),
            const SizedBox(height: 16),
            _Section(
              icon: Icons.person_outline,
              title: 'Account Information',
              children: [
                _Line(icon: Icons.person_outline, label: 'Name', value: store.agentName, onTap: () => _edit(context)),
                _Line(icon: Icons.badge_outlined, label: 'Agent ID', value: store.agentCode, onTap: () => _edit(context)),
                _Line(icon: Icons.phone_outlined, label: 'Mobile Number', value: '+91 ${phoneLabel(store.agentPhone)}', onTap: () => _edit(context)),
                _Line(icon: Icons.mail_outline, label: 'Email Address', value: store.agentEmail, onTap: () => _edit(context)),
                _Line(icon: Icons.apartment_outlined, label: 'Company / Branch', value: store.company, onTap: () => _edit(context)),
              ],
            ),
            const SizedBox(height: 12),
            _Section(
              icon: Icons.lock_outline,
              title: 'Security',
              children: [
                _Line(icon: Icons.key_outlined, label: 'Change Password', onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const _PasswordPage()))),
                _SwitchLine(icon: Icons.fingerprint, label: 'Enable Biometric Login', value: store.biometricOn, onChanged: store.setBiometric),
              ],
            ),
            const SizedBox(height: 12),
            _Section(
              icon: Icons.settings_outlined,
              title: 'App Settings',
              children: [
                _Line(icon: Icons.notifications_none, label: 'Notifications', onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AlertsPage()))),
                _Line(icon: Icons.language, label: 'Language', value: store.language, onTap: () => _pick(context, 'Language', const ['English', 'Hindi'], store.language, store.setLanguage)),
                _Line(icon: Icons.dark_mode_outlined, label: 'Theme', value: store.themeLabel, onTap: () => _pick(context, 'Theme', const ['Light', 'Dark'], store.themeLabel, store.setThemeLabel)),
              ],
            ),
            const SizedBox(height: 12),
            _Section(
              icon: Icons.headset_mic_outlined,
              title: 'Support',
              children: [
                _Line(icon: Icons.help_outline, label: 'Help & Support', onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const HelpSupportPage()))),
                _Line(icon: Icons.article_outlined, label: 'Terms & Conditions', onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const TermsPage()))),
                _Line(icon: Icons.shield_outlined, label: 'Privacy Policy', onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const PrivacyPage()))),
                _Line(icon: Icons.info_outline, label: 'About App', value: 'Version 1.0.0', onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AboutPage()))),
              ],
            ),
            const SizedBox(height: 16),
            TextButton.icon(
              onPressed: store.signOut,
              style: TextButton.styleFrom(
                foregroundColor: const Color(0xFFDC2626),
                backgroundColor: const Color(0xFFFFF1F2),
                minimumSize: const Size.fromHeight(52),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
              ),
              icon: const Icon(Icons.logout),
              label: const Text('Logout'),
            ),
          ],
        ),
      ),
    );
  }

  void _edit(BuildContext context) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => const _EditProfilePage()));
  }

  void _pick(BuildContext context, String title, List<String> options, String current, ValueChanged<String> onPick) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(18))),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(8, 8, 8, 12),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: dashNavy)),
                const SizedBox(height: 6),
                for (final option in options)
                  ListTile(
                    title: Text(option, style: const TextStyle(fontWeight: FontWeight.w700, color: dashNavy)),
                    trailing: option == current ? const Icon(Icons.check_circle, color: dashBlue) : null,
                    onTap: () {
                      onPick(option);
                      Navigator.of(context).pop();
                    },
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _Top extends StatelessWidget {
  const _Top({required this.store});

  final AgentStore store;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 34,
          height: 34,
          alignment: Alignment.center,
          decoration: BoxDecoration(color: dashBlue, borderRadius: BorderRadius.circular(10)),
          child: const Icon(Icons.flight, color: Colors.white, size: 18),
        ),
        const SizedBox(width: 8),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('BerogetAI', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: dashNavy, height: 1.05)),
              Text('CREDIT INSIGHTS', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w700, letterSpacing: 0.7, color: Color(0xFF8B95A7))),
            ],
          ),
        ),
        IconButton(
          visualDensity: VisualDensity.compact,
          onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AlertsPage())),
          icon: Badge(
            isLabelVisible: store.unread > 0,
            label: Text('${store.unread}'),
            child: const Icon(Icons.notifications_none, color: dashNavy),
          ),
        ),
      ],
    );
  }
}

class _Hero extends StatelessWidget {
  const _Hero({required this.store});

  final AgentStore store;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 14, 12, 14),
      decoration: BoxDecoration(
        color: const Color(0xFFF3F7FF),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE3ECFF)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _Avatar(),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(store.agentName, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: dashNavy)),
                const SizedBox(height: 2),
                Text('Agent ID: ${store.agentCode}', style: const TextStyle(color: Color(0xFF8B95A7), fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                _Meta(icon: Icons.phone_outlined, text: '+91 ${phoneLabel(store.agentPhone)}'),
                const SizedBox(height: 2),
                _Meta(icon: Icons.mail_outline, text: store.agentEmail),
              ],
            ),
          ),
          const SizedBox(width: 6),
          OutlinedButton.icon(
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const _EditProfilePage())),
            style: OutlinedButton.styleFrom(
              foregroundColor: dashBlue,
              backgroundColor: Colors.white,
              side: const BorderSide(color: Color(0xFFD6E4FF)),
              visualDensity: VisualDensity.compact,
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 11),
            ),
            icon: const Icon(Icons.edit_outlined, size: 14),
            label: const Text('Edit Profile'),
          ),
        ],
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  const _Avatar();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 72,
      height: 72,
      child: Stack(
        children: [
          Container(
            width: 68,
            height: 68,
            alignment: Alignment.center,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFF93C5FD), Color(0xFF2563EB)]),
            ),
            child: const Text('R', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w800)),
          ),
          Positioned(
            right: 0,
            bottom: 2,
            child: Material(
              color: Colors.white,
              shape: const CircleBorder(),
              elevation: 1,
              child: InkWell(
                customBorder: const CircleBorder(),
                onTap: () {
                  showDialog<void>(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Profile photo', style: TextStyle(fontWeight: FontWeight.w800, color: dashNavy)),
                      content: const Text('The desk avatar stays on this device. A camera upload is not connected yet.'),
                      actions: [TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('OK'))],
                    ),
                  );
                },
                child: const Padding(
                  padding: EdgeInsets.all(5),
                  child: Icon(Icons.photo_camera_outlined, size: 14, color: dashBlue),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Meta extends StatelessWidget {
  const _Meta({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 13, color: const Color(0xFF8B95A7)),
        const SizedBox(width: 4),
        Expanded(child: Text(text, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Color(0xFF5C677A), fontSize: 12))),
      ],
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.icon, required this.wash, required this.color, required this.value, required this.label});

  final IconData icon;
  final Color wash;
  final Color color;
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.fromLTRB(6, 10, 6, 8),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFEEF1F6))),
        child: Column(
          children: [
            Container(
              width: 28,
              height: 28,
              alignment: Alignment.center,
              decoration: BoxDecoration(color: wash, borderRadius: BorderRadius.circular(8)),
              child: Icon(icon, size: 16, color: color),
            ),
            const SizedBox(height: 6),
            Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: dashNavy, height: 1)),
            const SizedBox(height: 2),
            Text(label, textAlign: TextAlign.center, maxLines: 2, style: const TextStyle(fontSize: 9, height: 1.15, fontWeight: FontWeight.w600, color: Color(0xFF8B95A7))),
          ],
        ),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.icon, required this.title, required this.children});

  final IconData icon;
  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFEEF1F6))),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
            child: Row(
              children: [
                Icon(icon, size: 16, color: dashNavy),
                const SizedBox(width: 8),
                Text(title, style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy)),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          for (var i = 0; i < children.length; i++) ...[
            children[i],
            if (i != children.length - 1) const Divider(height: 1, indent: 46, color: Color(0xFFF1F5F9)),
          ],
        ],
      ),
    );
  }
}

class _Line extends StatelessWidget {
  const _Line({required this.icon, required this.label, this.value, this.onTap});

  final IconData icon;
  final String label;
  final String? value;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Row(
          children: [
            Icon(icon, size: 18, color: const Color(0xFF8B95A7)),
            const SizedBox(width: 12),
            Expanded(child: Text(label, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF3D4658), fontSize: 14))),
            if (value != null) ...[
              const SizedBox(width: 8),
              Flexible(child: Text(value!, maxLines: 1, overflow: TextOverflow.ellipsis, textAlign: TextAlign.right, style: const TextStyle(color: Color(0xFF5C677A), fontSize: 13, fontWeight: FontWeight.w600))),
            ],
            if (onTap != null) ...[
              const SizedBox(width: 4),
              const Icon(Icons.chevron_right, size: 18, color: Color(0xFFB0B8C6)),
            ],
          ],
        ),
      ),
    );
  }
}

class _SwitchLine extends StatelessWidget {
  const _SwitchLine({required this.icon, required this.label, required this.value, required this.onChanged});

  final IconData icon;
  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 4, 8, 4),
      child: Row(
        children: [
          Icon(icon, size: 18, color: const Color(0xFF8B95A7)),
          const SizedBox(width: 12),
          Expanded(child: Text(label, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF3D4658), fontSize: 14))),
          Switch(value: value, activeThumbColor: Colors.white, activeTrackColor: dashBlue, onChanged: onChanged),
        ],
      ),
    );
  }
}

class _EditProfilePage extends StatefulWidget {
  const _EditProfilePage();

  @override
  State<_EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<_EditProfilePage> {
  final name = TextEditingController();
  final phone = TextEditingController();
  final mail = TextEditingController();
  var error = '';
  var ready = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (ready) return;
    ready = true;
    final store = AgentScope.of(context);
    name.text = store.agentName;
    phone.text = store.agentPhone;
    mail.text = store.agentEmail;
  }

  @override
  void dispose() {
    name.dispose();
    phone.dispose();
    mail.dispose();
    super.dispose();
  }

  void save() {
    if (name.text.trim().length < 2) {
      setState(() => error = 'Enter your name.');
      return;
    }
    if (phone.text.replaceAll(RegExp(r'\D'), '').length != 10) {
      setState(() => error = 'Use a 10-digit mobile number.');
      return;
    }
    if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(mail.text.trim())) {
      setState(() => error = 'Enter a valid email address.');
      return;
    }
    AgentScope.of(context).updateProfile(name: name.text, phone: phone.text, mail: mail.text);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final store = AgentScope.of(context);
    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB),
      appBar: AppBar(backgroundColor: Colors.white, surfaceTintColor: Colors.white, elevation: 0, foregroundColor: dashNavy, title: const Text('Edit Profile', style: TextStyle(fontWeight: FontWeight.w800))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
        children: [
          _Field(label: 'Name', controller: name, icon: Icons.person_outline, caps: TextCapitalization.words),
          const SizedBox(height: 12),
          _Field(label: 'Agent ID', initial: store.agentCode, icon: Icons.badge_outlined, readOnly: true),
          const SizedBox(height: 12),
          _Field(label: 'Mobile Number', controller: phone, icon: Icons.phone_outlined, keyboard: TextInputType.phone, formatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(10)]),
          const SizedBox(height: 12),
          _Field(label: 'Email Address', controller: mail, icon: Icons.mail_outline, keyboard: TextInputType.emailAddress),
          const SizedBox(height: 12),
          _Field(label: 'Company / Branch', initial: store.company, icon: Icons.apartment_outlined, readOnly: true),
          if (error.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(error, style: const TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w700)),
          ],
          const SizedBox(height: 20),
          FilledButton(
            onPressed: save,
            style: FilledButton.styleFrom(backgroundColor: dashBlue, foregroundColor: Colors.white, minimumSize: const Size.fromHeight(48), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), textStyle: const TextStyle(fontWeight: FontWeight.w800)),
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
}

class _PasswordPage extends StatefulWidget {
  const _PasswordPage();

  @override
  State<_PasswordPage> createState() => _PasswordPageState();
}

class _PasswordPageState extends State<_PasswordPage> {
  final current = TextEditingController();
  final next = TextEditingController();
  final again = TextEditingController();
  var error = '';

  @override
  void dispose() {
    current.dispose();
    next.dispose();
    again.dispose();
    super.dispose();
  }

  void save() {
    if (current.text.length < 6) {
      setState(() => error = 'Enter your current password.');
      return;
    }
    if (next.text.length < 6) {
      setState(() => error = 'Use at least 6 characters.');
      return;
    }
    if (next.text != again.text) {
      setState(() => error = 'The new passwords do not match.');
      return;
    }
    final messenger = ScaffoldMessenger.of(context);
    Navigator.of(context).pop();
    messenger.showSnackBar(const SnackBar(content: Text('Password updated on this device.')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB),
      appBar: AppBar(backgroundColor: Colors.white, surfaceTintColor: Colors.white, elevation: 0, foregroundColor: dashNavy, title: const Text('Change Password', style: TextStyle(fontWeight: FontWeight.w800))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
        children: [
          _Field(label: 'Current Password', controller: current, icon: Icons.lock_outline, obscure: true),
          const SizedBox(height: 12),
          _Field(label: 'New Password', controller: next, icon: Icons.key_outlined, obscure: true),
          const SizedBox(height: 12),
          _Field(label: 'Confirm Password', controller: again, icon: Icons.key_outlined, obscure: true),
          if (error.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(error, style: const TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w700)),
          ],
          const SizedBox(height: 20),
          FilledButton(
            onPressed: save,
            style: FilledButton.styleFrom(backgroundColor: dashBlue, foregroundColor: Colors.white, minimumSize: const Size.fromHeight(48), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), textStyle: const TextStyle(fontWeight: FontWeight.w800)),
            child: const Text('Update Password'),
          ),
        ],
      ),
    );
  }
}

class _Field extends StatelessWidget {
  const _Field({required this.label, required this.icon, this.controller, this.initial, this.readOnly = false, this.obscure = false, this.keyboard, this.caps, this.formatters});

  final String label;
  final IconData icon;
  final TextEditingController? controller;
  final String? initial;
  final bool readOnly;
  final bool obscure;
  final TextInputType? keyboard;
  final TextCapitalization? caps;
  final List<TextInputFormatter>? formatters;

  @override
  Widget build(BuildContext context) {
    const border = OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12)), borderSide: BorderSide(color: Color(0xFFE2E8F0)));
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: dashNavy)),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          initialValue: controller == null ? initial : null,
          readOnly: readOnly,
          obscureText: obscure,
          keyboardType: keyboard,
          textCapitalization: caps ?? TextCapitalization.none,
          inputFormatters: formatters,
          style: TextStyle(fontWeight: FontWeight.w700, color: readOnly ? const Color(0xFF8B95A7) : dashNavy),
          decoration: InputDecoration(
            prefixIcon: Icon(icon, size: 18, color: const Color(0xFF8B95A7)),
            filled: true,
            fillColor: readOnly ? const Color(0xFFF7F9FC) : Colors.white,
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
