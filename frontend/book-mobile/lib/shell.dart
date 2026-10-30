import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'bookings_page.dart';
import 'home.dart';
import 'login.dart';
import 'profile.dart';
import 'profile_store.dart';
import 'responsive.dart';
import 'theme.dart';
import 'widgets.dart';

class BookShell extends StatefulWidget {
  const BookShell({super.key});

  /// 0 Home · 1 Buses · 2 Hotels · 3 Profile
  static final ValueNotifier<int> tabRequest = ValueNotifier(0);
  static final ValueNotifier<int> bookingsRequest = ValueNotifier(0);

  static void openHome() => _setTab(0);
  static void openFlights() => openHome();
  static void openBuses() => _setTab(1);
  static void openHotels() => _setTab(2);
  static void openProfile() => _setTab(3);

  /// Opens My Bookings as a pushed screen (hamburger / post-pay).
  static void openBookings() => bookingsRequest.value++;

  static void _setTab(int index) {
    if (tabRequest.value == index) {
      tabRequest.value = -1;
    }
    tabRequest.value = index;
  }

  @override
  State<BookShell> createState() => _BookShellState();
}

class _BookShellState extends State<BookShell> {
  var tab = 0;

  @override
  void initState() {
    super.initState();
    BookShell.tabRequest.addListener(_onTabRequest);
    BookShell.bookingsRequest.addListener(_onBookingsRequest);
  }

  @override
  void dispose() {
    BookShell.tabRequest.removeListener(_onTabRequest);
    BookShell.bookingsRequest.removeListener(_onBookingsRequest);
    super.dispose();
  }

  void _onTabRequest() {
    final next = BookShell.tabRequest.value;
    if (next < 0 || next == tab || !mounted) return;
    setState(() => tab = next);
  }

  void _onBookingsRequest() {
    if (!mounted) return;
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const BookingsPage(showBack: true)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      const BookHomePage(),
      const _ComingSoonPage(
        title: 'Buses',
        icon: Icons.directions_bus_rounded,
        color: bookBus,
        wash: Color(0xFFFFF1E8),
        message: 'Bus booking is coming soon. Flights are live for now.',
      ),
      const _ComingSoonPage(
        title: 'Hotels',
        icon: Icons.hotel_rounded,
        color: bookHotel,
        wash: Color(0xFFFFE4E6),
        message: 'Hotel booking is coming soon. Flights are live for now.',
      ),
      const _ProfileTab(),
    ];

    return Scaffold(
      body: IndexedStack(index: tab, children: pages),
      bottomNavigationBar: _BottomBar(
        index: tab,
        onChanged: (value) => setState(() => tab = value),
      ),
    );
  }
}

class _BottomBar extends StatelessWidget {
  const _BottomBar({required this.index, required this.onChanged});

  final int index;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    final layout = BookLayout.of(context);
    return Container(
      color: bookWash,
      padding: EdgeInsets.fromLTRB(layout.bottomBarHPad, 0, layout.bottomBarHPad, layout.isCompact ? 8 : 10),
      child: SafeArea(
        top: false,
        child: Container(
          padding: EdgeInsets.fromLTRB(4, layout.bottomBarVPad, 4, layout.bottomBarVPad),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(layout.isCompact ? 18 : 22),
            border: Border.all(color: const Color(0xFFE8EEF7)),
            boxShadow: const [
              BoxShadow(color: Color(0x140F172A), blurRadius: 24, offset: Offset(0, 10)),
              BoxShadow(color: Color(0x080066FF), blurRadius: 18, offset: Offset(0, 4)),
            ],
          ),
          child: Row(
            children: [
              _NavItem(
                icon: Icons.home_rounded,
                activeIcon: Icons.home_rounded,
                label: 'Home',
                active: index == 0,
                color: bookBlueBright,
                compact: layout.isCompact,
                iconBox: layout.navIconBox,
                labelSize: layout.navLabelSize,
                onTap: () => onChanged(0),
              ),
              _NavItem(
                icon: Icons.directions_bus_outlined,
                activeIcon: Icons.directions_bus_rounded,
                label: 'Buses',
                active: index == 1,
                color: bookBus,
                compact: layout.isCompact,
                iconBox: layout.navIconBox,
                labelSize: layout.navLabelSize,
                onTap: () => onChanged(1),
              ),
              _NavItem(
                icon: Icons.hotel_outlined,
                activeIcon: Icons.hotel_rounded,
                label: 'Hotels',
                active: index == 2,
                color: bookHotel,
                compact: layout.isCompact,
                iconBox: layout.navIconBox,
                labelSize: layout.navLabelSize,
                onTap: () => onChanged(2),
              ),
              _NavItem(
                icon: Icons.person_outline_rounded,
                activeIcon: Icons.person_rounded,
                label: 'Profile',
                active: index == 3,
                color: bookBlueBright,
                compact: layout.isCompact,
                iconBox: layout.navIconBox,
                labelSize: layout.navLabelSize,
                onTap: () => onChanged(3),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.active,
    required this.color,
    required this.onTap,
    required this.compact,
    required this.iconBox,
    required this.labelSize,
  });

  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool active;
  final Color color;
  final VoidCallback onTap;
  final bool compact;
  final double iconBox;
  final double labelSize;

  @override
  Widget build(BuildContext context) {
    final activeBox = iconBox + (compact ? 4 : 6);
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeOutCubic,
          padding: EdgeInsets.symmetric(vertical: compact ? 6 : 8),
          decoration: BoxDecoration(
            color: active ? color.withValues(alpha: 0.1) : Colors.transparent,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 220),
                curve: Curves.easeOutCubic,
                width: active ? activeBox : iconBox,
                height: active ? activeBox : iconBox,
                decoration: BoxDecoration(
                  color: active ? color : const Color(0xFFF3F6FB),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: active
                      ? [BoxShadow(color: color.withValues(alpha: 0.28), blurRadius: 12, offset: const Offset(0, 4))]
                      : null,
                ),
                child: Icon(
                  active ? activeIcon : icon,
                  size: active ? (compact ? 17 : 19) : (compact ? 16 : 18),
                  color: active ? Colors.white : const Color(0xFF94A3B8),
                ),
              ),
              SizedBox(height: compact ? 4 : 5),
              Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.poppins(
                  fontSize: labelSize,
                  fontWeight: active ? FontWeight.w700 : FontWeight.w600,
                  color: active ? color : const Color(0xFF94A3B8),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ComingSoonPage extends StatelessWidget {
  const _ComingSoonPage({
    required this.title,
    required this.icon,
    required this.color,
    required this.wash,
    required this.message,
  });

  final String title;
  final IconData icon;
  final Color color;
  final Color wash;
  final String message;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bookWash,
      appBar: AppBar(title: Text(title)),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 84,
                height: 84,
                decoration: BoxDecoration(color: wash, borderRadius: BorderRadius.circular(26)),
                child: Icon(icon, color: color, size: 40),
              ),
              const SizedBox(height: 20),
              Text(
                'Coming Soon',
                style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 22, color: bookNavy),
              ),
              const SizedBox(height: 8),
              Text(
                message,
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 13.5, color: bookMuted, height: 1.45),
              ),
              const SizedBox(height: 22),
              OutlinedButton(
                style: OutlinedButton.styleFrom(
                  foregroundColor: bookBlueBright,
                  side: const BorderSide(color: Color(0xFFB7D0FF)),
                  minimumSize: const Size(180, 46),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: BookShell.openHome,
                child: Text('Back to Home', style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProfileTab extends StatelessWidget {
  const _ProfileTab();

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: ProfileStore.instance,
      builder: (context, _) {
        final profile = ProfileStore.instance.profile;
        if (profile != null) {
          return ProfilePage(key: ValueKey(profile.email), showBack: true);
        }
        return Scaffold(
          backgroundColor: bookWash,
          appBar: AppBar(
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded),
              onPressed: BookShell.openHome,
            ),
            title: const Text('Profile'),
          ),
          body: Padding(
            padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Spacer(),
                Center(
                  child: Container(
                    width: 88,
                    height: 88,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFFEAF1FF), Color(0xFFD6E4FF)]),
                      borderRadius: BorderRadius.circular(28),
                    ),
                    child: const Icon(Icons.person_outline_rounded, color: bookBlueBright, size: 42),
                  ),
                ),
                const SizedBox(height: 22),
                Text(
                  'Welcome traveller',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 20, color: bookNavy),
                ),
                const SizedBox(height: 8),
                Text(
                  'Login or create a profile to book tickets. Find My Bookings in the menu.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.poppins(color: bookMuted, fontWeight: FontWeight.w500, height: 1.45, fontSize: 13.5),
                ),
                const Spacer(),
                PrimaryCta(
                  label: 'Sign In',
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginPage())),
                ),
                const SizedBox(height: 10),
                OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size.fromHeight(50),
                    foregroundColor: bookNavy,
                    side: const BorderSide(color: bookLine),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateProfilePage())),
                  child: Text('Create Profile', style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 14)),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
