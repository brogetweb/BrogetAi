import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_nav.dart';
import 'theme.dart';

class SoftCard extends StatelessWidget {
  const SoftCard({required this.child, this.padding = const EdgeInsets.all(14), this.elevated = true, super.key});

  final Widget child;
  final EdgeInsets padding;
  final bool elevated;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: bookLine),
        boxShadow: elevated ? bookShadowCard : null,
      ),
      child: child,
    );
  }
}

class BrandMark extends StatelessWidget {
  const BrandMark({this.light = false, this.size = 22, this.showBookBy = true, this.hero = false, super.key});

  final bool light;
  final double size;
  final bool showBookBy;
  final bool hero;

  @override
  Widget build(BuildContext context) {
    final main = light ? Colors.white : bookNavy;
    final bookBySize = hero ? size * 0.34 : size * 0.38;
    final gap = hero ? size * 0.14 : size * 0.1;

    final mark = Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (showBookBy)
          Text(
            'BOOK BY',
            style: GoogleFonts.poppins(
              fontSize: bookBySize,
              fontWeight: FontWeight.w600,
              color: light ? Colors.white.withValues(alpha: 0.88) : bookMuted,
              height: 1,
              letterSpacing: hero ? 3.2 : 1.2,
            ),
          ),
        if (showBookBy) SizedBox(height: gap),
        Text.rich(
          TextSpan(
            children: [
              TextSpan(
                text: 'Broget',
                style: GoogleFonts.poppins(
                  fontSize: size,
                  fontWeight: FontWeight.w800,
                  color: main,
                  height: 1,
                  letterSpacing: hero ? -0.8 : -0.4,
                ),
              ),
              TextSpan(
                text: 'AI',
                style: GoogleFonts.poppins(
                  fontSize: size,
                  fontWeight: FontWeight.w800,
                  color: bookOrange,
                  height: 1,
                  letterSpacing: hero ? -0.8 : -0.4,
                ),
              ),
            ],
          ),
        ),
      ],
    );

    if (!hero) return mark;

    return Stack(
      alignment: Alignment.center,
      clipBehavior: Clip.none,
      children: [
        CustomPaint(size: Size(size * 5.2, size * 1.85), painter: _BrandSwooshPainter()),
        Padding(padding: EdgeInsets.only(top: size * 0.12), child: mark),
        Positioned(
          right: size * 0.15,
          top: size * 0.05,
          child: Icon(Icons.flight_rounded, color: bookOrange, size: size * 0.42),
        ),
      ],
    );
  }
}

class SplashBrandCard extends StatelessWidget {
  const SplashBrandCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(20, 22, 20, 20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: Colors.white.withValues(alpha: 0.12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.28)),
        boxShadow: const [BoxShadow(color: Color(0x44000000), blurRadius: 24, offset: Offset(0, 10))],
      ),
      child: Column(
        children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const LinearGradient(colors: [Color(0xFFFF8A3D), bookOrange]),
              boxShadow: const [BoxShadow(color: Color(0x66FF7A00), blurRadius: 16, offset: Offset(0, 6))],
            ),
            child: const Icon(Icons.flight_takeoff_rounded, color: Colors.white, size: 28),
          ),
          const SizedBox(height: 14),
          const BrandMark(light: true, size: 38, hero: true),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(99),
              border: Border.all(color: Colors.white30),
            ),
            child: Text(
              'BOOK SMART  ·  TRAVEL EASY',
              style: GoogleFonts.poppins(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 11,
                letterSpacing: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BrandSwooshPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = bookOrange.withValues(alpha: 0.95)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.6
      ..strokeCap = StrokeCap.round;
    final path = Path()
      ..moveTo(size.width * 0.04, size.height * 0.78)
      ..quadraticBezierTo(size.width * 0.36, size.height * 0.02, size.width * 0.96, size.height * 0.34);
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class FieldBox extends StatelessWidget {
  const FieldBox({required this.label, required this.value, required this.onTap, this.icon, super.key});

  final String label;
  final String value;
  final VoidCallback onTap;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: bookField,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: bookLine),
          ),
          child: Row(
            children: [
              if (icon != null) ...[
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(color: bookSoftBlue, borderRadius: BorderRadius.circular(10)),
                  child: Icon(icon, size: 17, color: bookBlueBright),
                ),
                const SizedBox(width: 10),
              ],
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label, style: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.w600, color: bookMuted)),
                    const SizedBox(height: 1),
                    Text(
                      value,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.poppins(fontSize: 13.5, fontWeight: FontWeight.w700, color: bookNavy),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.keyboard_arrow_down_rounded, size: 20, color: Color(0xFF94A3B8)),
            ],
          ),
        ),
      ),
    );
  }
}

class SegmentTabs extends StatelessWidget {
  const SegmentTabs({required this.items, required this.value, required this.onChanged, super.key});

  final List<(String, String)> items;
  final String value;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(color: const Color(0xFFEEF2F7), borderRadius: BorderRadius.circular(14)),
      child: Row(
        children: [
          for (final item in items)
            Expanded(
              child: GestureDetector(
                onTap: () => onChanged(item.$1),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  curve: Curves.easeOutCubic,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(
                    color: value == item.$1 ? bookBlueBright : Colors.transparent,
                    borderRadius: BorderRadius.circular(11),
                    boxShadow: value == item.$1 ? bookShadowBlue : null,
                  ),
                  child: Text(
                    item.$2,
                    textAlign: TextAlign.center,
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: value == item.$1 ? Colors.white : bookMuted,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class ChipFilter extends StatelessWidget {
  const ChipFilter({required this.label, this.selected = false, this.onTap, super.key});

  final String label;
  final bool selected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: selected ? bookSoftBlue : Colors.white,
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: selected ? const Color(0xFFB7D0FF) : bookLine),
            boxShadow: selected ? null : bookShadowSoft,
          ),
          child: Text(
            label,
            style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w700, color: selected ? bookBlue : bookNavy),
          ),
        ),
      ),
    );
  }
}

class PrimaryCta extends StatelessWidget {
  const PrimaryCta({required this.label, required this.onPressed, super.key});

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(14), boxShadow: bookShadowBlue),
      child: FilledButton(
        onPressed: onPressed,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(label),
            const SizedBox(width: 6),
            const Icon(Icons.arrow_forward_rounded, size: 18),
          ],
        ),
      ),
    );
  }
}

enum BookToastKind { success, error, info }

OverlayEntry? _bookToastEntry;

void showBookToast(
  BuildContext context,
  String message, {
  BookToastKind kind = BookToastKind.info,
  IconData? icon,
  Duration duration = const Duration(milliseconds: 2600),
}) {
  void present(BuildContext host) {
    final overlay = Overlay.maybeOf(host, rootOverlay: true) ?? Overlay.maybeOf(host);
    if (overlay == null) return;

    _bookToastEntry?.remove();
    _bookToastEntry = null;
    ScaffoldMessenger.maybeOf(host)?.hideCurrentSnackBar();

    late final OverlayEntry entry;
    entry = OverlayEntry(
      builder: (_) => _TopToastHost(
        message: message,
        kind: kind,
        icon: icon,
        duration: duration,
        onDone: () {
          entry.remove();
          if (_bookToastEntry == entry) _bookToastEntry = null;
        },
      ),
    );
    _bookToastEntry = entry;
    overlay.insert(entry);
  }

  final rootContext = bookNavigatorKey.currentContext;
  if (rootContext != null) {
    present(rootContext);
    return;
  }
  present(context);
}

void showLoginSuccessToast(BuildContext context, {String? name}) {
  final who = (name ?? '').trim();
  final text = who.isEmpty ? 'Logged in successfully' : 'Welcome back, $who';
  // Show after route pop so toast sits cleanly on the next screen.
  WidgetsBinding.instance.addPostFrameCallback((_) {
    final host = bookNavigatorKey.currentContext ?? context;
    showBookToast(host, text, kind: BookToastKind.success, icon: Icons.login_rounded);
  });
}

void showLogoutSuccessToast(BuildContext context) {
  WidgetsBinding.instance.addPostFrameCallback((_) {
    final host = bookNavigatorKey.currentContext ?? context;
    showBookToast(host, 'Logged out successfully', kind: BookToastKind.success, icon: Icons.logout_rounded);
  });
}

class _TopToastHost extends StatefulWidget {
  const _TopToastHost({
    required this.message,
    required this.kind,
    required this.duration,
    required this.onDone,
    this.icon,
  });

  final String message;
  final BookToastKind kind;
  final IconData? icon;
  final Duration duration;
  final VoidCallback onDone;

  @override
  State<_TopToastHost> createState() => _TopToastHostState();
}

class _TopToastHostState extends State<_TopToastHost> with SingleTickerProviderStateMixin {
  late final AnimationController motion = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 320),
    reverseDuration: const Duration(milliseconds: 220),
  );
  late final Animation<Offset> slide = Tween<Offset>(
    begin: const Offset(0, -1.2),
    end: Offset.zero,
  ).animate(CurvedAnimation(parent: motion, curve: Curves.easeOutCubic, reverseCurve: Curves.easeInCubic));
  late final Animation<double> fade = CurvedAnimation(parent: motion, curve: Curves.easeOut, reverseCurve: Curves.easeIn);

  @override
  void initState() {
    super.initState();
    motion.forward();
    Future<void>.delayed(widget.duration, _dismiss);
  }

  Future<void> _dismiss() async {
    if (!mounted) return;
    await motion.reverse();
    if (mounted) widget.onDone();
  }

  @override
  void dispose() {
    motion.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final Color bg;
    final IconData mark;
    switch (widget.kind) {
      case BookToastKind.success:
        bg = const Color(0xFF059669);
        mark = widget.icon ?? Icons.check_circle_rounded;
        break;
      case BookToastKind.error:
        bg = const Color(0xFFDC2626);
        mark = widget.icon ?? Icons.error_outline_rounded;
        break;
      case BookToastKind.info:
        bg = bookNavy;
        mark = widget.icon ?? Icons.info_outline_rounded;
        break;
    }

    final top = MediaQuery.paddingOf(context).top + 10;

    return Positioned(
      top: top,
      left: 16,
      right: 16,
      child: SlideTransition(
        position: slide,
        child: FadeTransition(
          opacity: fade,
          child: Material(
            color: Colors.transparent,
            child: GestureDetector(
              onTap: _dismiss,
              child: Container(
                padding: const EdgeInsets.fromLTRB(14, 13, 14, 13),
                decoration: BoxDecoration(
                  color: bg,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(color: bg.withValues(alpha: 0.35), blurRadius: 18, offset: const Offset(0, 8)),
                    const BoxShadow(color: Color(0x22000000), blurRadius: 12, offset: Offset(0, 4)),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(mark, color: Colors.white, size: 18),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        widget.message,
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 13.5, color: Colors.white, height: 1.3),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

Future<T?> pickList<T>({
  required BuildContext context,
  required String title,
  required List<T> items,
  required String Function(T) labelOf,
  T? selected,
}) {
  return showModalBottomSheet<T>(
    context: context,
    backgroundColor: Colors.white,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(22))),
    builder: (context) => SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 10),
          Container(width: 40, height: 4, decoration: BoxDecoration(color: bookLine, borderRadius: BorderRadius.circular(99))),
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 14, 18, 6),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(title, style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 16, color: bookNavy)),
            ),
          ),
          Flexible(
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: items.length,
              itemBuilder: (context, index) {
                final item = items[index];
                final on = selected == item;
                return ListTile(
                  dense: true,
                  title: Text(
                    labelOf(item),
                    style: GoogleFonts.poppins(fontWeight: FontWeight.w600, color: on ? bookBlueBright : bookNavy),
                  ),
                  trailing: on ? const Icon(Icons.check_circle_rounded, color: bookBlueBright, size: 18) : null,
                  onTap: () => Navigator.pop(context, item),
                );
              },
            ),
          ),
        ],
      ),
    ),
  );
}
