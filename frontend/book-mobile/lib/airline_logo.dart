import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'theme.dart';

/// Airline mark: tries CDN logos, then a coloured favicon-style badge.
class AirlineLogo extends StatelessWidget {
  const AirlineLogo({required this.code, this.name = '', this.size = 36, super.key});

  final String code;
  final String name;
  final double size;

  String get _iata {
    final raw = code.trim().toUpperCase();
    if (raw.isEmpty) return '';
    final first = raw.split(RegExp(r'[\s/]+')).first;
    if (first.length <= 3) return first;
    return first.substring(0, 2);
  }

  static Color brandColor(String iata) {
    switch (iata) {
      case '6E':
        return const Color(0xFFEF5B25);
      case 'AI':
        return const Color(0xFFDA0E29);
      case 'UK':
        return const Color(0xFF5C2D91);
      case 'QP':
        return const Color(0xFFFF6A00);
      case 'SG':
        return const Color(0xFFEE2E24);
      case 'IX':
        return const Color(0xFF0033A0);
      case 'I5':
        return const Color(0xFFEC1C24);
      case 'G8':
        return const Color(0xFFFFCC00);
      default:
        return bookBlueBright;
    }
  }

  List<String> get _urls {
    final iata = _iata;
    if (iata.isEmpty) return const [];
    return [
      'https://pics.avs.io/${size.round()}/${size.round()}/$iata.png',
      'https://images.kiwi.com/airlines/64/$iata.png',
      'https://content.airhex.com/content/logos/airlines_${iata}_50_50_s.png',
    ];
  }

  @override
  Widget build(BuildContext context) {
    final iata = _iata;
    final letter = (name.isNotEmpty ? name : iata).trim();
    final fallbackLetter = letter.isEmpty ? '?' : letter[0].toUpperCase();
    final urls = _urls;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(size * 0.26),
        border: Border.all(color: bookLine),
        boxShadow: const [BoxShadow(color: Color(0x0A0F172A), blurRadius: 4, offset: Offset(0, 1))],
      ),
      clipBehavior: Clip.antiAlias,
      child: urls.isEmpty
          ? _FaviconBadge(letter: fallbackLetter, iata: iata, size: size)
          : _NetworkLogoChain(urls: urls, letter: fallbackLetter, iata: iata, size: size),
    );
  }
}

class _NetworkLogoChain extends StatelessWidget {
  const _NetworkLogoChain({
    required this.urls,
    required this.letter,
    required this.iata,
    required this.size,
  });

  final List<String> urls;
  final String letter;
  final String iata;
  final double size;

  @override
  Widget build(BuildContext context) {
    Widget leaf(int index) {
      if (index >= urls.length) {
        return _FaviconBadge(letter: letter, iata: iata, size: size);
      }
      return Image.network(
        urls[index],
        fit: BoxFit.contain,
        gaplessPlayback: true,
        filterQuality: FilterQuality.medium,
        errorBuilder: (_, _, _) => leaf(index + 1),
        loadingBuilder: (context, child, progress) {
          if (progress == null) return Padding(padding: EdgeInsets.all(size * 0.12), child: child);
          return _FaviconBadge(letter: letter, iata: iata, size: size, soft: true);
        },
      );
    }

    return leaf(0);
  }
}

class _FaviconBadge extends StatelessWidget {
  const _FaviconBadge({required this.letter, required this.iata, required this.size, this.soft = false});

  final String letter;
  final String iata;
  final double size;
  final bool soft;

  @override
  Widget build(BuildContext context) {
    final color = AirlineLogo.brandColor(iata);
    return ColoredBox(
      color: soft ? color.withValues(alpha: 0.12) : color,
      child: Center(
        child: Text(
          (iata.isNotEmpty ? iata : letter).substring(0, iata.length >= 2 ? 2 : 1),
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.w800,
            fontSize: size * (iata.length >= 2 ? 0.28 : 0.38),
            color: soft ? color : Colors.white,
            height: 1,
            letterSpacing: -0.4,
          ),
        ),
      ),
    );
  }
}
