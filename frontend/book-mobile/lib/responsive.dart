import 'package:flutter/material.dart';

/// Phone-first layout helpers — kept tight to avoid empty whitespace.
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

  double get pagePad => isCompact ? 10 : (isWidePhone ? 14 : 12);
  double get sectionGap => isCompact ? 6 : 8;
  double get cardRadius => isCompact ? 12 : 14;
  double get bannerHeight => isCompact ? 72 : (isWidePhone ? 88 : 80);
  double get titleSize => isCompact ? 17 : 18;
  double get bodySize => isCompact ? 12 : 13;
  double get navIconBox => isCompact ? 28.0 : 32.0;
  double get navLabelSize => isCompact ? 9.0 : 10.0;
  double get bottomBarHPad => isCompact ? 8 : 12;
  double get bottomBarVPad => isCompact ? 4 : 5;

  EdgeInsets get pageInsets => EdgeInsets.fromLTRB(pagePad, 6, pagePad, 12);
  EdgeInsets get listInsets => EdgeInsets.fromLTRB(pagePad, 6, pagePad, 14);

  static TextScaler clampedTextScaler(BuildContext context) {
    final scaler = MediaQuery.textScalerOf(context);
    return scaler.clamp(minScaleFactor: 0.9, maxScaleFactor: 1.12);
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
