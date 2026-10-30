import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'data.dart';
import 'flight_results.dart';
import 'menu_drawer.dart';
import 'profile_store.dart';
import 'responsive.dart';
import 'theme.dart';
import 'widgets.dart';

class BookHomePage extends StatefulWidget {
  const BookHomePage({super.key});

  @override
  State<BookHomePage> createState() => _BookHomePageState();
}

class _BookHomePageState extends State<BookHomePage> {
  var trip = 'one';
  var from = 'Mumbai (BOM)';
  var to = 'Chennai (MAA)';
  late DateTime departDate = DateTime.now().add(const Duration(days: 7));
  DateTime? returnDate;
  var travellers = 1;
  var cabin = 'Economy';
  final liked = <String>{};

  static const destinations = [
    ('Dubai', 'From ₹12,499', 'assets/images/dest_dubai.jpg'),
    ('Singapore', 'From ₹15,999', 'assets/images/dest_singapore.jpg'),
    ('Bangkok', 'From ₹9,899', 'assets/images/dest_bangkok.jpg'),
    ('London', 'From ₹42,499', 'assets/images/dest_london.jpg'),
  ];

  String get departLabel => _fmtDate(departDate);
  String get returnLabel => returnDate == null ? 'Select date' : _fmtDate(returnDate!);

  static String _fmtDate(DateTime d) {
    const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${names[d.weekday - 1]}, ${d.day} ${months[d.month - 1]} ${d.year}';
  }

  Future<void> _pickDepart() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: departDate.isBefore(now) ? now : departDate,
      firstDate: DateTime(now.year, now.month, now.day),
      lastDate: now.add(const Duration(days: 365)),
      helpText: 'Select departure date',
      confirmText: 'Done',
      cancelText: 'Cancel',
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: bookBlueBright,
              onPrimary: Colors.white,
              surface: Colors.white,
              onSurface: bookNavy,
            ),
            datePickerTheme: DatePickerThemeData(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              headerBackgroundColor: bookBlueBright,
              headerForegroundColor: Colors.white,
              dayStyle: GoogleFonts.poppins(fontWeight: FontWeight.w600),
              weekdayStyle: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 12),
              yearStyle: GoogleFonts.poppins(fontWeight: FontWeight.w600),
            ),
            textButtonTheme: TextButtonThemeData(
              style: TextButton.styleFrom(foregroundColor: bookBlueBright, textStyle: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked == null) return;
    setState(() {
      departDate = picked;
      if (returnDate != null && returnDate!.isBefore(picked)) {
        returnDate = picked.add(const Duration(days: 3));
      }
    });
  }

  Future<void> _pickReturn() async {
    final first = departDate;
    final initial = returnDate ?? departDate.add(const Duration(days: 3));
    final picked = await showDatePicker(
      context: context,
      initialDate: initial.isBefore(first) ? first : initial,
      firstDate: first,
      lastDate: DateTime.now().add(const Duration(days: 365)),
      helpText: 'Select return date',
      confirmText: 'Done',
      cancelText: 'Cancel',
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: bookBlueBright,
              onPrimary: Colors.white,
              surface: Colors.white,
              onSurface: bookNavy,
            ),
            datePickerTheme: DatePickerThemeData(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              headerBackgroundColor: bookBlueBright,
              headerForegroundColor: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) setState(() => returnDate = picked);
  }

  @override
  Widget build(BuildContext context) {
    final layout = BookLayout.of(context);
    return Scaffold(
      backgroundColor: bookWash,
      drawer: const BookMenuDrawer(),
      body: SafeArea(
        child: AnimatedBuilder(
          animation: ProfileStore.instance,
          builder: (context, _) {
            final name = ProfileStore.instance.profile?.firstName;
            return ListView(
              physics: const BouncingScrollPhysics(),
              padding: EdgeInsets.fromLTRB(layout.pagePad, 6, layout.pagePad, 18),
              children: [
                Row(
                  children: [
                    Builder(
                      builder: (context) => _CircleBtn(
                        icon: Icons.menu_rounded,
                        onTap: () => Scaffold.of(context).openDrawer(),
                      ),
                    ),
                    Expanded(child: Center(child: BrandMark(size: layout.isCompact ? 16 : 18))),
                    Stack(
                      children: [
                        _CircleBtn(icon: Icons.notifications_none_rounded, onTap: () {}),
                        Positioned(
                          right: 7,
                          top: 7,
                          child: Container(width: 7, height: 7, decoration: const BoxDecoration(color: bookHotel, shape: BoxShape.circle)),
                        ),
                      ],
                    ),
                  ],
                ),
                SizedBox(height: layout.sectionGap),
                Text(
                  name == null ? 'Where next?' : 'Hi $name',
                  style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: layout.titleSize, color: bookNavy, letterSpacing: -0.3, height: 1.1),
                ),
                Text(
                  'Best flight deals in minutes',
                  style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: layout.isCompact ? 11 : 12, color: bookMuted),
                ),
                SizedBox(height: layout.sectionGap),
                Container(
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(layout.cardRadius), boxShadow: bookShadowBlue),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(layout.cardRadius),
                    child: SizedBox(
                      height: layout.bannerHeight,
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          Image.asset('assets/images/banner_plane.jpg', fit: BoxFit.cover),
                          const DecoratedBox(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.centerLeft,
                                end: Alignment.centerRight,
                                colors: [Color(0xF5003EB3), Color(0x550052CC)],
                              ),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.18),
                                    borderRadius: BorderRadius.circular(99),
                                  ),
                                  child: Text('UP TO 25% OFF', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 9, letterSpacing: 0.5)),
                                ),
                                const Spacer(),
                                Text('Fly More Explore More', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 17, height: 1.1)),
                                Text('Great deals around the world', style: GoogleFonts.poppins(color: Colors.white70, fontWeight: FontWeight.w500, fontSize: 11)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  height: 34,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: const [
                      _OfferChip(label: 'BOM → MAA deals', color: bookBlueBright),
                      _OfferChip(label: 'Zero convenience fee', color: bookOrange),
                      _OfferChip(label: 'Easy cancel', color: bookHotel),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                SoftCard(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text('Search Flights', style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 14, color: bookNavy)),
                          const Spacer(),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(color: const Color(0xFFFFF4E8), borderRadius: BorderRadius.circular(99)),
                            child: Text('Best price', style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 9.5, color: bookOrange)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      SegmentTabs(
                        value: trip,
                        onChanged: (value) => setState(() {
                          trip = value;
                          if (value == 'round' && returnDate == null) {
                            returnDate = departDate.add(const Duration(days: 3));
                          }
                        }),
                        items: const [('one', 'One Way'), ('round', 'Round Trip'), ('multi', 'Multi City')],
                      ),
                      const SizedBox(height: 10),
                      Stack(
                        alignment: Alignment.centerRight,
                        children: [
                          Column(
                            children: [
                              FieldBox(
                                label: 'From',
                                value: from,
                                icon: Icons.flight_takeoff_rounded,
                                onTap: () async {
                                  final value = await pickList(context: context, title: 'From', items: cities, labelOf: (item) => item, selected: from);
                                  if (value != null) setState(() => from = value);
                                },
                              ),
                              const SizedBox(height: 7),
                              FieldBox(
                                label: 'To',
                                value: to,
                                icon: Icons.flight_land_rounded,
                                onTap: () async {
                                  final value = await pickList(context: context, title: 'To', items: cities, labelOf: (item) => item, selected: to);
                                  if (value != null) setState(() => to = value);
                                },
                              ),
                            ],
                          ),
                          Positioned(
                            right: 8,
                            child: Material(
                              elevation: 2,
                              color: bookBlueBright,
                              shape: const CircleBorder(),
                              child: InkWell(
                                customBorder: const CircleBorder(),
                                onTap: () => setState(() {
                                  final old = from;
                                  from = to;
                                  to = old;
                                }),
                                child: const SizedBox(width: 34, height: 34, child: Icon(Icons.swap_vert_rounded, color: Colors.white, size: 17)),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 7),
                      if (trip == 'round')
                        Row(
                          children: [
                            Expanded(
                              child: FieldBox(
                                label: 'Departure',
                                value: departLabel,
                                icon: Icons.calendar_month_rounded,
                                onTap: _pickDepart,
                              ),
                            ),
                            const SizedBox(width: 7),
                            Expanded(
                              child: FieldBox(
                                label: 'Return',
                                value: returnLabel,
                                icon: Icons.event_rounded,
                                onTap: _pickReturn,
                              ),
                            ),
                          ],
                        )
                      else
                        FieldBox(
                          label: 'Departure Date',
                          value: departLabel,
                          icon: Icons.calendar_month_rounded,
                          onTap: _pickDepart,
                        ),
                      const SizedBox(height: 7),
                      FieldBox(
                        label: 'Travellers & Class',
                        value: '$travellers Traveller · $cabin',
                        icon: Icons.airline_seat_recline_normal_rounded,
                        onTap: () async {
                          final nextCabin = await pickList(context: context, title: 'Class', items: const ['Economy', 'Premium economy', 'Business'], labelOf: (item) => item, selected: cabin);
                          if (nextCabin != null) setState(() => cabin = nextCabin);
                          if (!context.mounted) return;
                          final nextCount = await pickList(context: context, title: 'Travellers', items: const [1, 2, 3, 4, 5, 6], labelOf: (item) => '$item Traveller${item > 1 ? 's' : ''}', selected: travellers);
                          if (nextCount != null) setState(() => travellers = nextCount);
                        },
                      ),
                      const SizedBox(height: 12),
                      PrimaryCta(
                        label: 'Search Flights',
                        onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => FlightResultsPage(
                              from: from,
                              to: to,
                              date: departLabel,
                              travellers: travellers,
                              cabin: cabin,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                SoftCard(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
                  child: Row(
                    children: const [
                      Expanded(child: _TrustItem(icon: Icons.lock_outline_rounded, label: 'Secure')),
                      Expanded(child: _TrustItem(icon: Icons.support_agent_rounded, label: '24/7')),
                      Expanded(child: _TrustItem(icon: Icons.bolt_rounded, label: 'Instant')),
                      Expanded(child: _TrustItem(icon: Icons.verified_rounded, label: 'Trusted')),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(child: Text('Popular Destinations', style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 14.5, color: bookNavy))),
                    Text('View All', style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 11.5, color: bookBlueBright)),
                  ],
                ),
                const SizedBox(height: 8),
                SizedBox(
                  height: 138,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: destinations.length,
                    separatorBuilder: (_, _) => const SizedBox(width: 10),
                    itemBuilder: (context, index) {
                      final item = destinations[index];
                      final on = liked.contains(item.$1);
                      return Container(
                        width: 118,
                        decoration: BoxDecoration(borderRadius: BorderRadius.circular(14), boxShadow: bookShadowSoft),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.asset(item.$3, fit: BoxFit.cover),
                              const DecoratedBox(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                    colors: [Color(0x14000000), Color(0xE0081A3A)],
                                  ),
                                ),
                              ),
                              Positioned(
                                top: 8,
                                right: 8,
                                child: InkWell(
                                  onTap: () => setState(() {
                                    if (on) {
                                      liked.remove(item.$1);
                                    } else {
                                      liked.add(item.$1);
                                    }
                                  }),
                                  child: CircleAvatar(
                                    radius: 12,
                                    backgroundColor: Colors.white.withValues(alpha: 0.95),
                                    child: Icon(on ? Icons.favorite_rounded : Icons.favorite_border_rounded, size: 12, color: on ? bookHotel : bookNavy),
                                  ),
                                ),
                              ),
                              Positioned(
                                left: 10,
                                right: 10,
                                bottom: 10,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(item.$1, style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12.5)),
                                    Text(item.$2, style: GoogleFonts.poppins(color: Colors.white70, fontWeight: FontWeight.w600, fontSize: 9.5)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(14),
                    gradient: const LinearGradient(colors: [Color(0xFFFFF4E8), Color(0xFFFFE8D6)]),
                    border: Border.all(color: const Color(0xFFFFD8B5)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                        child: const Icon(Icons.local_offer_rounded, color: bookOrange, size: 20),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Use code BROGET25', style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 12.5, color: bookNavy)),
                            Text('Extra savings on first booking', style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 10.5, color: bookMuted)),
                          ],
                        ),
                      ),
                    ],
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

class _OfferChip extends StatelessWidget {
  const _OfferChip({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(right: 7),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: bookLine),
      ),
      child: Row(
        children: [
          Icon(Icons.local_fire_department_rounded, size: 13, color: color),
          const SizedBox(width: 5),
          Text(label, style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 10.5, color: bookNavy)),
        ],
      ),
    );
  }
}

class _TrustItem extends StatelessWidget {
  const _TrustItem({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, size: 18, color: bookBlueBright),
        const SizedBox(height: 4),
        Text(label, textAlign: TextAlign.center, style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 10, color: bookMuted)),
      ],
    );
  }
}

class _CircleBtn extends StatelessWidget {
  const _CircleBtn({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white, border: Border.all(color: bookLine)),
          child: Icon(icon, size: 18, color: bookBlue),
        ),
      ),
    );
  }
}

