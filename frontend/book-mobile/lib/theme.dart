import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

const bookBlue = Color(0xFF0052CC);
const bookBlueBright = Color(0xFF0066FF);
const bookNavy = Color(0xFF0B1F3A);
const bookWash = Color(0xFFF3F6FB);
const bookMuted = Color(0xFF6B7A90);
const bookLine = Color(0xFFE6ECF5);
const bookOrange = Color(0xFFFF7A00);
const bookBus = Color(0xFFEA580C);
const bookHotel = Color(0xFFE11D48);
const bookField = Color(0xFFF7F9FC);
const bookSoftBlue = Color(0xFFEAF1FF);

List<BoxShadow> get bookShadowSoft => const [
      BoxShadow(color: Color(0x0D0F172A), blurRadius: 16, offset: Offset(0, 6)),
    ];

List<BoxShadow> get bookShadowCard => const [
      BoxShadow(color: Color(0x0F0F172A), blurRadius: 20, offset: Offset(0, 8)),
    ];

List<BoxShadow> get bookShadowBlue => const [
      BoxShadow(color: Color(0x330066FF), blurRadius: 18, offset: Offset(0, 8)),
    ];

ThemeData bookTheme() {
  final poppins = GoogleFonts.poppins();
  return ThemeData(
    useMaterial3: true,
    fontFamily: poppins.fontFamily,
    scaffoldBackgroundColor: bookWash,
    visualDensity: VisualDensity.compact,
    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    colorScheme: ColorScheme.fromSeed(seedColor: bookBlue, brightness: Brightness.light).copyWith(
      primary: bookBlueBright,
      secondary: bookOrange,
      surface: Colors.white,
    ),
    pageTransitionsTheme: const PageTransitionsTheme(
      builders: {
        TargetPlatform.android: ZoomPageTransitionsBuilder(),
        TargetPlatform.iOS: ZoomPageTransitionsBuilder(),
      },
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: Colors.white,
      foregroundColor: bookNavy,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: true,
      titleTextStyle: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 16, color: bookNavy),
    ),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: bookNavy,
      contentTextStyle: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 13, color: Colors.white),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: bookBlueBright,
        foregroundColor: Colors.white,
        elevation: 0,
        shadowColor: const Color(0x440066FF),
        minimumSize: const Size.fromHeight(44),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 14),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: bookBlueBright,
        textStyle: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13),
      ),
    ),
  );
}

String inr(num value) {
  final n = value.round();
  final s = n.toString();
  if (s.length <= 3) return '₹$s';
  final last3 = s.substring(s.length - 3);
  var rest = s.substring(0, s.length - 3);
  final parts = <String>[];
  while (rest.length > 2) {
    parts.insert(0, rest.substring(rest.length - 2));
    rest = rest.substring(0, rest.length - 2);
  }
  if (rest.isNotEmpty) parts.insert(0, rest);
  return '₹${parts.join(',')},$last3';
}
