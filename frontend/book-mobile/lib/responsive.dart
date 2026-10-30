import 'package:flutter/material.dart';

/// Phone-first layout helpers for small / normal / large handsets.
class BookLayout {
  BookLayout._(this.width, this.height, this.shortest);

  factory BookLayout.of(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    return BookLayout._(size.width, size.height, size.shortestSide);
  }

  final double width;
  final double height;
  final double shortest;

  bool get isCompact => width < 360;
  bool get isTall => height >= 780;
  bool get isWidePhone => width >= 400;

  double get pagePad => isCompact ? 12 : (isWidePhone ? 18 : 16);
  double get sectionGap => isCompact ? 8 : 12;
  double get cardRadius => isCompact ? 14 : 18;
  double get bannerHeight => isCompact ? 96 : (isWidePhone ? 120 : 108);
  double get titleSize => isCompact ? 18 : 20;
  double get bodySize => isCompact ? 12.5 : 13.5;
  double get navIconBox => isCompact ? 30.0 : 36.0;
  double get navLabelSize => isCompact ? 9.5 : 10.5;
  double get bottomBarHPad => isCompact ? 10 : 14;
  double get bottomBarVPad => isCompact ? 6 : 8;

  EdgeInsets get pageInsets => EdgeInsets.fromLTRB(pagePad, 8, pagePad, 18);
  EdgeInsets get listInsets => EdgeInsets.fromLTRB(pagePad, 10, pagePad, 20);

  /// Soften extreme system font scaling so layouts stay intact.
  static TextScaler clampedTextScaler(BuildContext context) {
    final scaler = MediaQuery.textScalerOf(context);
    return scaler.clamp(minScaleFactor: 0.9, maxScaleFactor: 1.15);
  }
}

class BookPage extends StatelessWidget {
  const BookPage({
    required this.child,
    this.padding,
    this.scroll = false,
    this.bottom,
    super.key,
  });

  final Widget child;
  final EdgeInsets? padding;
  final bool scroll;
  final Widget? bottom;

  @override
  Widget build(BuildContext context) {
    final layout = BookLayout.of(context);
    final pad = padding ?? layout.pageInsets;
    final body = scroll
        ? SingleChildScrollView(padding: pad, physics: const BouncingScrollPhysics(), child: child)
        : Padding(padding: pad, child: child);

    if (bottom == null) return body;

    return Column(
      children: [
        Expanded(child: body),
        bottom!,
      ],
    );
  }
}
