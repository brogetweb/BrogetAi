import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'api.dart';
import 'profile.dart';
import 'profile_store.dart';
import 'theme.dart';
import 'widgets.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final emailCtrl = TextEditingController();
  final passwordCtrl = TextEditingController();
  final formKey = GlobalKey<FormState>();
  var loading = false;

  @override
  void dispose() {
    emailCtrl.dispose();
    passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!(formKey.currentState?.validate() ?? false)) return;
    setState(() => loading = true);
    try {
      final data = await BookApi.instance.login(
        emailOrPhone: emailCtrl.text.trim(),
        password: passwordCtrl.text,
      );
      final user = Map<String, dynamic>.from(data['user'] as Map? ?? {});
      await ProfileStore.instance.saveSession(
        profile: BookProfile.fromJson(user),
        accessToken: '${data['accessToken'] ?? ''}',
        refreshToken: '${data['refreshToken'] ?? ''}',
      );
      if (!mounted) return;
      final name = BookProfile.fromJson(user).firstName;
      Navigator.pop(context, true);
      showLoginSuccessToast(context, name: name);
    } catch (e) {
      if (!mounted) return;
      showBookToast(context, '$e', kind: BookToastKind.error);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bookWash,
      appBar: AppBar(title: const Text('Sign In')),
      body: Form(
        key: formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          children: [
            SoftCard(
              child: Column(
                children: [
                  TextFormField(
                    controller: emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    validator: (v) => (v == null || v.trim().length < 3) ? 'Email or phone required' : null,
                    decoration: _decor('Email or Phone', Icons.person_outline_rounded),
                    style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14, color: bookNavy),
                  ),
                  const SizedBox(height: 10),
                  TextFormField(
                    controller: passwordCtrl,
                    obscureText: true,
                    validator: (v) => (v == null || v.length < 6) ? 'Password min 6 chars' : null,
                    decoration: _decor('Password', Icons.lock_outline_rounded),
                    style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14, color: bookNavy),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            PrimaryCta(label: loading ? 'Please wait...' : 'Sign In', onPressed: loading ? () {} : _login),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const CreateProfilePage())),
              child: Text('New user? Create Profile', style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
            ),
          ],
        ),
      ),
    );
  }

  InputDecoration _decor(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon, color: bookBlueBright, size: 20),
      filled: true,
      fillColor: bookField,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: bookLine)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: bookLine)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: bookBlueBright, width: 1.4)),
    );
  }
}
