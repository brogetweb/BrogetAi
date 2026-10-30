import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'api.dart';
import 'login.dart';
import 'profile_store.dart';
import 'shell.dart';
import 'theme.dart';
import 'widgets.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({this.forceCreate = false, this.showBack = false, super.key});

  final bool forceCreate;
  final bool showBack;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: ProfileStore.instance,
      builder: (context, _) {
        final profile = ProfileStore.instance.profile;
        if (profile == null || forceCreate) {
          return CreateProfilePage(existing: profile, bookingGate: forceCreate);
        }
        return _ProfileView(profile: profile, showBack: showBack);
      },
    );
  }
}

class CreateProfilePage extends StatefulWidget {
  const CreateProfilePage({this.existing, this.bookingGate = false, super.key});

  final BookProfile? existing;
  final bool bookingGate;

  @override
  State<CreateProfilePage> createState() => _CreateProfilePageState();
}

class _CreateProfilePageState extends State<CreateProfilePage> {
  late final nameCtrl = TextEditingController(text: widget.existing?.fullName ?? '');
  late final emailCtrl = TextEditingController(text: widget.existing?.email ?? '');
  late final phoneCtrl = TextEditingController(text: widget.existing?.phone ?? '');
  late final cityCtrl = TextEditingController(text: widget.existing?.city ?? '');
  final passwordCtrl = TextEditingController();
  late var gender = widget.existing?.gender ?? 'Male';
  var saving = false;
  final formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    nameCtrl.dispose();
    emailCtrl.dispose();
    phoneCtrl.dispose();
    cityCtrl.dispose();
    passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!(formKey.currentState?.validate() ?? false)) return;
    setState(() => saving = true);
    try {
      if (widget.existing == null) {
        final data = await BookApi.instance.register(
          fullName: nameCtrl.text.trim(),
          email: emailCtrl.text.trim(),
          phone: phoneCtrl.text.trim().replaceAll(RegExp(r'\D'), '').substring(0, 10),
          password: passwordCtrl.text,
          city: cityCtrl.text.trim(),
          gender: gender,
        );
        final user = Map<String, dynamic>.from(data['user'] as Map? ?? {});
        await ProfileStore.instance.saveSession(
          profile: BookProfile.fromJson(user),
          accessToken: '${data['accessToken'] ?? ''}',
          refreshToken: '${data['refreshToken'] ?? ''}',
        );
      } else {
        await ProfileStore.instance.save(
          BookProfile(
            id: widget.existing!.id,
            fullName: nameCtrl.text.trim(),
            email: emailCtrl.text.trim(),
            phone: phoneCtrl.text.trim(),
            gender: gender,
            city: cityCtrl.text.trim(),
          ),
        );
      }
      if (!mounted) return;
      showBookToast(
        context,
        widget.existing == null
            ? (widget.bookingGate ? 'Account created. Continue booking.' : 'Account created successfully')
            : 'Profile updated successfully',
        kind: BookToastKind.success,
        icon: widget.existing == null ? Icons.person_add_alt_1_rounded : Icons.check_circle_rounded,
      );
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      showBookToast(context, '$e', kind: BookToastKind.error);
    } finally {
      if (mounted) setState(() => saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final editing = widget.existing != null;
    return Scaffold(
      backgroundColor: bookWash,
      appBar: AppBar(title: Text(editing ? 'Edit profile' : 'Create profile')),
      body: Form(
        key: formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 24),
          children: [
            if (widget.bookingGate) ...[
              Text(
                'Create a profile before booking your ticket.',
                style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 13, color: bookMuted, height: 1.4),
              ),
              const SizedBox(height: 14),
            ],
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: bookLine),
              ),
              child: Column(
                children: [
                  _Field(
                    controller: nameCtrl,
                    label: 'Full name',
                    hint: 'Rahul Sharma',
                    icon: Icons.badge_outlined,
                    validator: (v) => (v == null || v.trim().length < 2) ? 'Name required' : null,
                  ),
                  const SizedBox(height: 10),
                  _Field(
                    controller: emailCtrl,
                    label: 'Email',
                    hint: 'you@email.com',
                    icon: Icons.email_outlined,
                    keyboard: TextInputType.emailAddress,
                    validator: (v) {
                      final value = v?.trim() ?? '';
                      if (!value.contains('@') || !value.contains('.')) return 'Valid email required';
                      return null;
                    },
                  ),
                  const SizedBox(height: 10),
                  _Field(
                    controller: phoneCtrl,
                    label: 'Mobile number',
                    hint: '9876543210',
                    icon: Icons.phone_outlined,
                    keyboard: TextInputType.phone,
                    validator: (v) {
                      final digits = (v ?? '').replaceAll(RegExp(r'\D'), '');
                      if (digits.length < 10) return '10-digit mobile required';
                      return null;
                    },
                  ),
                  const SizedBox(height: 10),
                  _Field(
                    controller: cityCtrl,
                    label: 'City',
                    hint: 'Mumbai',
                    icon: Icons.location_city_outlined,
                  ),
                  if (!editing) ...[
                    const SizedBox(height: 10),
                    _Field(
                      controller: passwordCtrl,
                      label: 'Password',
                      hint: 'Min 6 characters',
                      icon: Icons.lock_outline_rounded,
                      obscure: true,
                      validator: (v) => (v == null || v.length < 6) ? 'Password min 6 chars' : null,
                    ),
                  ],
                  const SizedBox(height: 12),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text('Gender', style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w600, color: bookMuted)),
                  ),
                  const SizedBox(height: 6),
                  SegmentTabs(
                    value: gender,
                    onChanged: (value) => setState(() => gender = value),
                    items: const [('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            PrimaryCta(
              label: saving ? 'Please wait...' : (editing ? 'Save profile' : 'Create profile'),
              onPressed: saving ? () {} : _save,
            ),
            if (!editing) ...[
              const SizedBox(height: 10),
              TextButton(
                onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginPage())),
                child: Text('Already have an account? Sign in', style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ProfileView extends StatelessWidget {
  const _ProfileView({required this.profile, this.showBack = false});

  final BookProfile profile;
  final bool showBack;

  Future<void> _logout(BuildContext context) async {
    final go = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Text('Log out?', style: GoogleFonts.poppins(fontWeight: FontWeight.w800, color: bookNavy)),
        content: Text(
          'You can sign in again anytime to book tickets.',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 13.5, color: bookMuted, height: 1.4),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(
            style: FilledButton.styleFrom(minimumSize: const Size(0, 40), padding: const EdgeInsets.symmetric(horizontal: 16)),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Log out'),
          ),
        ],
      ),
    );
    if (go != true) return;
    await ProfileStore.instance.clear();
    if (!context.mounted) return;
    BookShell.openHome();
    showLogoutSuccessToast(context);
  }

  void _goBack(BuildContext context) {
    if (Navigator.of(context).canPop()) {
      Navigator.of(context).pop();
      return;
    }
    BookShell.openFlights();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bookWash,
      appBar: AppBar(
        leading: showBack || Navigator.of(context).canPop()
            ? IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                onPressed: () => _goBack(context),
              )
            : null,
        title: const Text('My Profile'),
        automaticallyImplyLeading: false,
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
        children: [
          Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Color(0xFF0B1F3A), Color(0xFF163A6B)],
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: Colors.white.withValues(alpha: 0.16),
                    child: Text(
                      profile.firstName.isEmpty ? 'T' : profile.firstName[0].toUpperCase(),
                      style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 24, color: Colors.white),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(profile.fullName, style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 17, color: Colors.white)),
                        const SizedBox(height: 2),
                        Text(profile.email, style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 12, color: Colors.white70)),
                        if (profile.city.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Text(profile.city, style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 11.5, color: Colors.white60)),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: bookLine),
              ),
              child: Column(
                children: [
                  _InfoTile(Icons.phone_outlined, 'Mobile', profile.phone),
                  _divider(),
                  _InfoTile(Icons.wc_outlined, 'Gender', profile.gender),
                  if (profile.city.isNotEmpty) ...[
                    _divider(),
                    _InfoTile(Icons.location_city_outlined, 'City', profile.city),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: bookLine),
              ),
              child: Column(
                children: [
                  _ActionTile(
                    icon: Icons.edit_outlined,
                    label: 'Edit profile',
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => CreateProfilePage(existing: profile))),
                  ),
                  _divider(),
                  _ActionTile(
                    icon: Icons.confirmation_number_outlined,
                    label: 'My bookings',
                    onTap: BookShell.openBookings,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                foregroundColor: bookHotel,
                side: BorderSide(color: bookHotel.withValues(alpha: 0.35)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              onPressed: () => _logout(context),
              icon: const Icon(Icons.logout_rounded, size: 18),
              label: Text('Log out', style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 14)),
            ),
        ],
      ),
    );
  }

  Widget _divider() => const Divider(height: 1, indent: 14, endIndent: 14, color: bookLine);
}

class _InfoTile extends StatelessWidget {
  const _InfoTile(this.icon, this.label, this.value);

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      dense: true,
      leading: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(color: bookSoftBlue, borderRadius: BorderRadius.circular(10)),
        child: Icon(icon, size: 18, color: bookBlueBright),
      ),
      title: Text(label, style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w600, color: bookMuted)),
      subtitle: Text(value, style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w700, color: bookNavy)),
    );
  }
}

class _ActionTile extends StatelessWidget {
  const _ActionTile({required this.icon, required this.label, required this.onTap});

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      leading: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(color: bookSoftBlue, borderRadius: BorderRadius.circular(10)),
        child: Icon(icon, size: 18, color: bookBlueBright),
      ),
      title: Text(label, style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w700, color: bookNavy)),
      trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
    );
  }
}

class _Field extends StatelessWidget {
  const _Field({
    required this.controller,
    required this.label,
    required this.hint,
    required this.icon,
    this.keyboard,
    this.validator,
    this.obscure = false,
  });

  final TextEditingController controller;
  final String label;
  final String hint;
  final IconData icon;
  final TextInputType? keyboard;
  final String? Function(String?)? validator;
  final bool obscure;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboard,
      obscureText: obscure,
      validator: validator,
      style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14, color: bookNavy),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(icon, color: bookBlueBright, size: 20),
        filled: true,
        fillColor: bookField,
        labelStyle: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 12, color: bookMuted),
        hintStyle: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 13, color: const Color(0xFF94A3B8)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: bookLine)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: bookLine)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: bookBlueBright, width: 1.4)),
        errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: bookHotel)),
      ),
    );
  }
}

Future<bool> ensureProfileForBooking(BuildContext context) async {
  if (ProfileStore.instance.hasProfile && ProfileStore.instance.hasToken) return true;

  final go = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      title: Text('Sign in required', style: GoogleFonts.poppins(fontWeight: FontWeight.w800, color: bookNavy)),
      content: Text(
        'Login or create a profile to complete booking.',
        style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 13.5, color: bookMuted, height: 1.4),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Later')),
        FilledButton(
          style: FilledButton.styleFrom(minimumSize: const Size(0, 40), padding: const EdgeInsets.symmetric(horizontal: 16)),
          onPressed: () => Navigator.pop(context, true),
          child: const Text('Continue'),
        ),
      ],
    ),
  );

  if (go != true || !context.mounted) return false;

  final created = await Navigator.push<bool>(
    context,
    MaterialPageRoute(builder: (_) => const CreateProfilePage(bookingGate: true)),
  );
  return created == true && ProfileStore.instance.hasProfile;
}
