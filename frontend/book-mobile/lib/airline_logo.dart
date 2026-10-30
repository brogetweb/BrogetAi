import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'theme.dart';

/// Network airline mark (Kiwi CDN by IATA code) with letter fallback.
class AirlineLogo extends StatelessWidget {
  const AirlineLogo({required this.code, this.name = '', this.size = 40, super.key});

  final String code;
  final String name;
  final double size;

  String get _iata {
    final raw = code.trim().toUpperCase();
    if (raw.isEmpty) return '';
    final first = raw.split(RegExp(r'\s+')).first;
    return first.length <= 3 ? first : first.substring(0, 2);
  }

  @override
  Widget build(BuildContext context) {
    final iata = _iata;
    final letter = (name.isNotEmpty ? name : iata).trim();
    final fallback = letter.isEmpty ? '?' : letter[0].toUpperCase();

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(size * 0.28),
        border: Border.all(color: bookLine),
      ),
      clipBehavior: Clip.antiAlias,
      child: iata.isEmpty
          ? _Fallback(letter: fallback, size: size)
          : Image.network(
              'https://images.kiwi.com/airlines/64/$iata.png',
              fit: BoxFit.contain,
              errorBuilder: (_, _, _) => _Fallback(letter: fallback, size: size),
              loadingBuilder: (context, child, progress) {
                if (progress == null) return child;
                return _Fallback(letter: fallback, size: size, soft: true);
              },
            ),
    );
  }
}

class _Fallback extends StatelessWidget {
  const _Fallback({required this.letter, required this.size, this.soft = false});

  final String letter;
  final double size;
  final bool soft;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: soft ? const Color(0xFFF1F5F9) : bookSoftBlue,
      child: Center(
        child: Text(
          letter,
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.w800,
            fontSize: size * 0.38,
            color: bookBlueBright,
          ),
        ),
      ),
    );
  }
}
