import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'bookings_page.dart';
import 'login.dart';
import 'profile.dart';
import 'profile_store.dart';
import 'theme.dart';
import 'widgets.dart';

class BookMenuDrawer extends StatelessWidget {
  const BookMenuDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: Colors.white,
      child: SafeArea(
        child: AnimatedBuilder(
          animation: ProfileStore.instance,
          builder: (context, _) {
            final profile = ProfileStore.instance.profile;
            return Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  margin: const EdgeInsets.all(14),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(18),
                    gradient: const LinearGradient(colors: [Color(0xFF0052CC), Color(0xFF0066FF)]),
                    boxShadow: bookShadowBlue,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      CircleAvatar(
                        radius: 24,
                        backgroundColor: Colors.white.withValues(alpha: 0.2),
                        child: Text(
                          profile == null ? '?' : profile.firstName[0].toUpperCase(),
                          style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 20, color: Colors.white),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        profile?.fullName ?? 'Welcome Traveller',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 16, color: Colors.white),
                      ),
                      Text(
                        profile?.email ?? 'Create profile to book tickets',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 11.5, color: Colors.white70),
                      ),
                    ],
                  ),
                ),
                _Item(
                  icon: profile == null ? Icons.person_add_alt_1_rounded : Icons.person_rounded,
                  label: profile == null ? 'Create Profile' : 'My Profile',
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfilePage()));
                  },
                ),
                if (profile == null)
                  _Item(
                    icon: Icons.login_rounded,
                    label: 'Sign In',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginPage()));
                    },
                  ),
                if (profile != null)
                  _Item(
                    icon: Icons.edit_outlined,
                    label: 'Edit Profile',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(context, MaterialPageRoute(builder: (_) => CreateProfilePage(existing: profile)));
                    },
                  ),
                _Item(
                  icon: Icons.confirmation_number_outlined,
                  label: 'My Bookings',
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const BookingsPage(showBack: true)));
                  },
                ),
                _Item(icon: Icons.support_agent_rounded, label: 'Support', onTap: () => Navigator.pop(context)),
                const Spacer(),
                if (profile != null)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(14, 0, 14, 16),
                    child: OutlinedButton(
                      onPressed: () async {
                        await ProfileStore.instance.clear();
                        if (!context.mounted) return;
                        Navigator.pop(context);
                        showLogoutSuccessToast(context);
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: bookHotel,
                        side: const BorderSide(color: Color(0xFFFFD0D7)),
                        minimumSize: const Size.fromHeight(44),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text('Log out', style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
                    ),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _Item extends StatelessWidget {
  const _Item({required this.icon, required this.label, required this.onTap});

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(color: bookSoftBlue, borderRadius: BorderRadius.circular(10)),
        child: Icon(icon, size: 18, color: bookBlueBright),
      ),
      title: Text(label, style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13.5, color: bookNavy)),
      trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
      onTap: onTap,
    );
  }
}
