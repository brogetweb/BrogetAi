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
  var hidePass = true;

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
    final top = MediaQuery.paddingOf(context).top;
    return Scaffold(
      backgroundColor: bookWash,
      body: Form(
        key: formKey,
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            Container(
              padding: EdgeInsets.fromLTRB(16, top + 8, 16, 22),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Color(0xFF0B1F3A), Color(0xFF0052CC), Color(0xFF0066FF)],
                ),
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    style: IconButton.styleFrom(
                      backgroundColor: Colors.white.withValues(alpha: 0.12),
                      foregroundColor: Colors.white,
                    ),
                    icon: const Icon(Icons.arrow_back_rounded),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: Image.asset(
                          'assets/images/app_icon.png',
                          width: 52,
                          height: 52,
                          fit: BoxFit.cover,
                          errorBuilder: (_, _, _) => Container(
                            width: 52,
                            height: 52,
                            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)),
                            child: const Icon(Icons.flight_takeoff_rounded, color: bookBlueBright),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Welcome back', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 22, height: 1.1)),
                            Text('Sign in to book flights faster', style: GoogleFonts.poppins(color: Colors.white70, fontWeight: FontWeight.w500, fontSize: 12.5)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 18, 16, 24),
              child: Column(
                children: [
                  SoftCard(
                    padding: const EdgeInsets.fromLTRB(14, 16, 14, 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Account', style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 14, color: bookNavy)),
                        const SizedBox(height: 4),
                        Text('Use your email or 10-digit mobile', style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 11.5, color: bookMuted)),
                        const SizedBox(height: 14),
                        TextFormField(
                          controller: emailCtrl,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.next,
                          validator: (v) => (v == null || v.trim().length < 3) ? 'Email or phone required' : null,
                          decoration: _decor('Email or Phone', Icons.person_outline_rounded),
                          style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14, color: bookNavy),
                        ),
                        const SizedBox(height: 10),
                        TextFormField(
                          controller: passwordCtrl,
                          obscureText: hidePass,
                          textInputAction: TextInputAction.done,
                          onFieldSubmitted: (_) => loading ? null : _login(),
                          validator: (v) => (v == null || v.length < 6) ? 'Password min 6 chars' : null,
                          decoration: _decor(
                            'Password',
                            Icons.lock_outline_rounded,
                            suffix: IconButton(
                              onPressed: () => setState(() => hidePass = !hidePass),
                              icon: Icon(hidePass ? Icons.visibility_outlined : Icons.visibility_off_outlined, size: 20, color: bookMuted),
                            ),
                          ),
                          style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14, color: bookNavy),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  PrimaryCta(label: loading ? 'Signing in...' : 'Sign In', onPressed: loading ? () {} : _login),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      const Expanded(child: Divider(color: bookLine)),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        child: Text('New here?', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 11.5, color: bookMuted)),
                      ),
                      const Expanded(child: Divider(color: bookLine)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size.fromHeight(44),
                      foregroundColor: bookNavy,
                      side: const BorderSide(color: bookLine),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const CreateProfilePage())),
                    child: Text('Create Profile', style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13.5)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  InputDecoration _decor(String label, IconData icon, {Widget? suffix}) {
    return InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon, color: bookBlueBright, size: 20),
      suffixIcon: suffix,
      filled: true,
      fillColor: bookField,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: bookLine)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: bookLine)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: bookBlueBright, width: 1.4)),
    );
  }
}
