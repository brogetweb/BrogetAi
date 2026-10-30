import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'shell.dart';
import 'theme.dart';
import 'widgets.dart';

class OnboardingPage extends StatelessWidget {
  const OnboardingPage({super.key});

  void _goHome(BuildContext context) {
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (_, _, _) => const BookShell(),
        transitionsBuilder: (_, animation, _, child) => FadeTransition(opacity: animation, child: child),
        transitionDuration: const Duration(milliseconds: 380),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            SizedBox(
              height: 44,
              child: Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => _goHome(context),
                  child: Text('Skip', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, color: bookMuted)),
                ),
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 4, 20, 18),
                children: [
                  Text.rich(
                    TextSpan(
                      style: GoogleFonts.poppins(fontSize: 26, fontWeight: FontWeight.w800, color: bookNavy, height: 1.25, letterSpacing: -0.3),
                      children: [
                        const TextSpan(text: 'Explore the World with '),
                        TextSpan(text: 'Broget', style: GoogleFonts.poppins(color: bookBlue, fontWeight: FontWeight.w800)),
                        TextSpan(text: 'AI', style: GoogleFonts.poppins(color: bookOrange, fontWeight: FontWeight.w800)),
                      ],
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Flights, Buses and Hotels at the best prices.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.poppins(color: bookMuted, fontWeight: FontWeight.w500, height: 1.4, fontSize: 13),
                  ),
                  const SizedBox(height: 18),
                  const IntrinsicHeight(
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Expanded(
                          child: _ServiceIntro(
                            icon: Icons.flight_rounded,
                            color: bookBlueBright,
                            wash: Color(0xFFEAF1FF),
                            title: 'Flights',
                            body: 'Fly to your dream destination.',
                          ),
                        ),
                        SizedBox(width: 10),
                        Expanded(
                          child: _ServiceIntro(
                            icon: Icons.directions_bus_rounded,
                            color: bookBus,
                            wash: Color(0xFFFFF1E8),
                            title: 'Buses',
                            body: 'Travel comfortably anywhere.',
                            soon: true,
                          ),
                        ),
                        SizedBox(width: 10),
                        Expanded(
                          child: _ServiceIntro(
                            icon: Icons.hotel_rounded,
                            color: bookHotel,
                            wash: Color(0xFFFFE4E6),
                            title: 'Hotels',
                            body: 'Stay at the best hotels.',
                            soon: true,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    decoration: BoxDecoration(borderRadius: BorderRadius.circular(18), boxShadow: bookShadowCard),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(18),
                      child: AspectRatio(
                        aspectRatio: 16 / 9,
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            Image.asset('assets/images/onboarding_santorini.jpg', fit: BoxFit.cover),
                            const DecoratedBox(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                  colors: [Colors.transparent, Color(0x55081A3A)],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  PrimaryCta(label: 'Get Started', onPressed: () => _goHome(context)),
                  const SizedBox(height: 12),
                  Center(
                    child: Text.rich(
                      TextSpan(
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w500, color: bookMuted, fontSize: 13),
                        children: [
                          const TextSpan(text: 'Already have an account? '),
                          TextSpan(text: 'Sign In', style: GoogleFonts.poppins(color: bookBlueBright, fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ServiceIntro extends StatelessWidget {
  const _ServiceIntro({
    required this.icon,
    required this.color,
    required this.wash,
    required this.title,
    required this.body,
    this.soon = false,
  });

  final IconData icon;
  final Color color;
  final Color wash;
  final String title;
  final String body;
  final bool soon;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(8, 12, 8, 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: bookLine),
        boxShadow: bookShadowSoft,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: 42,
            height: 42,
            alignment: Alignment.center,
            decoration: BoxDecoration(color: wash, borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: color, size: 21),
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 18,
            child: Center(
              child: Text(
                title,
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 12.5, color: bookNavy, height: 1),
              ),
            ),
          ),
          const SizedBox(height: 4),
          SizedBox(
            height: 18,
            child: soon
                ? Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: wash, borderRadius: BorderRadius.circular(99)),
                      child: Text(
                        'Coming Soon',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 8, color: color, height: 1),
                      ),
                    ),
                  )
                : const SizedBox.shrink(),
          ),
          const SizedBox(height: 6),
          Expanded(
            child: Align(
              alignment: Alignment.topCenter,
              child: Text(
                body,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 10, color: bookMuted, height: 1.3),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
