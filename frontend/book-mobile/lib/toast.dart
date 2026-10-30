import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'theme.dart';

enum BookToastKind { success, error, info }

class ToastPayload {
  const ToastPayload({
    required this.id,
    required this.message,
    required this.kind,
    required this.icon,
    required this.duration,
  });

  final int id;
  final String message;
  final BookToastKind kind;
  final IconData? icon;
  final Duration duration;
}

/// App-wide toast bus — always visible above routes (fixes missing overlay toasts).
class BookToasts {
  BookToasts._();

  static final ValueNotifier<ToastPayload?> current = ValueNotifier(null);
  static int _seq = 0;

  static void show(
    String message, {
    BookToastKind kind = BookToastKind.info,
    IconData? icon,
    Duration duration = const Duration(milliseconds: 2800),
  }) {
    final text = message.trim();
    if (text.isEmpty) return;
    current.value = ToastPayload(
      id: ++_seq,
      message: text,
      kind: kind,
      icon: icon,
      duration: duration,
    );
  }

  static void success(String message, {IconData? icon}) =>
      show(message, kind: BookToastKind.success, icon: icon ?? Icons.check_circle_rounded);

  static void error(String message, {IconData? icon}) =>
      show(message, kind: BookToastKind.error, icon: icon ?? Icons.error_outline_rounded);

  static void info(String message, {IconData? icon}) =>
      show(message, kind: BookToastKind.info, icon: icon ?? Icons.info_outline_rounded);
}

void showBookToast(
  BuildContext context,
  String message, {
  BookToastKind kind = BookToastKind.info,
  IconData? icon,
  Duration duration = const Duration(milliseconds: 2800),
}) {
  BookToasts.show(message, kind: kind, icon: icon, duration: duration);
}

void showLoginSuccessToast(BuildContext context, {String? name}) {
  final who = (name ?? '').trim();
  final text = who.isEmpty ? 'Logged in successfully' : 'Welcome back, $who';
  WidgetsBinding.instance.addPostFrameCallback((_) {
    BookToasts.success(text, icon: Icons.login_rounded);
  });
}

void showLogoutSuccessToast(BuildContext context) {
  WidgetsBinding.instance.addPostFrameCallback((_) {
    BookToasts.success('Logged out successfully', icon: Icons.logout_rounded);
  });
}

/// Place inside MaterialApp.builder so toasts survive navigation.
class BookToastLayer extends StatelessWidget {
  const BookToastLayer({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ToastPayload?>(
      valueListenable: BookToasts.current,
      builder: (context, payload, _) {
        if (payload == null) return const SizedBox.shrink();
        return _ToastBanner(key: ValueKey(payload.id), payload: payload);
      },
    );
  }
}

class _ToastBanner extends StatefulWidget {
  const _ToastBanner({required this.payload, super.key});

  final ToastPayload payload;

  @override
  State<_ToastBanner> createState() => _ToastBannerState();
}

class _ToastBannerState extends State<_ToastBanner> with SingleTickerProviderStateMixin {
  late final AnimationController motion = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 280),
    reverseDuration: const Duration(milliseconds: 200),
  );
  late final Animation<Offset> slide = Tween<Offset>(
    begin: const Offset(0, -1.15),
    end: Offset.zero,
  ).animate(CurvedAnimation(parent: motion, curve: Curves.easeOutCubic, reverseCurve: Curves.easeInCubic));
  late final Animation<double> fade = CurvedAnimation(parent: motion, curve: Curves.easeOut, reverseCurve: Curves.easeIn);
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    motion.forward();
    _timer = Timer(widget.payload.duration, _dismiss);
  }

  Future<void> _dismiss() async {
    if (!mounted) return;
    await motion.reverse();
    if (!mounted) return;
    if (BookToasts.current.value?.id == widget.payload.id) {
      BookToasts.current.value = null;
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    motion.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final Color bg;
    final IconData mark;
    switch (widget.payload.kind) {
      case BookToastKind.success:
        bg = const Color(0xFF059669);
        mark = widget.payload.icon ?? Icons.check_circle_rounded;
      case BookToastKind.error:
        bg = const Color(0xFFDC2626);
        mark = widget.payload.icon ?? Icons.error_outline_rounded;
      case BookToastKind.info:
        bg = bookNavy;
        mark = widget.payload.icon ?? Icons.info_outline_rounded;
    }

    final top = MediaQuery.paddingOf(context).top + 8;

    return Positioned(
      top: top,
      left: 12,
      right: 12,
      child: SlideTransition(
        position: slide,
        child: FadeTransition(
          opacity: fade,
          child: Material(
            color: Colors.transparent,
            elevation: 0,
            child: GestureDetector(
              onTap: _dismiss,
              child: Container(
                padding: const EdgeInsets.fromLTRB(12, 11, 12, 11),
                decoration: BoxDecoration(
                  color: bg,
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(color: bg.withValues(alpha: 0.38), blurRadius: 16, offset: const Offset(0, 8)),
                    const BoxShadow(color: Color(0x28000000), blurRadius: 10, offset: Offset(0, 3)),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 30,
                      height: 30,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(9),
                      ),
                      child: Icon(mark, color: Colors.white, size: 17),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        widget.payload.message,
                        style: GoogleFonts.poppins(
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                          color: Colors.white,
                          height: 1.25,
                        ),
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
