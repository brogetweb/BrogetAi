import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'ui.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  final email = TextEditingController();
  final password = TextEditingController();
  late final AnimationController motion;
  late final CurvedAnimation slide;
  late final Animation<Offset> rise;
  var hidden = true;
  var remember = true;
  var pending = false;
  var error = '';

  @override
  void initState() {
    super.initState();
    motion = AnimationController(vsync: this, duration: const Duration(milliseconds: 640));
    slide = CurvedAnimation(parent: motion, curve: Curves.easeOutCubic);
    rise = Tween<Offset>(begin: const Offset(0, 0.06), end: Offset.zero).animate(slide);
    motion.forward();
  }

  @override
  void dispose() {
    email.dispose();
    password.dispose();
    slide.dispose();
    motion.dispose();
    super.dispose();
  }

  Future<void> submit() async {
    if (pending) return;
    final store = AgentScope.of(context);
    final address = email.text.trim();
    if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(address)) {
      const message = 'Use the email on your agent account.';
      setState(() => error = message);
      store.showToast(false, 'Could not sign in', message);
      return;
    }
    if (password.text.length < 8) {
      const message = 'Password needs at least 8 characters.';
      setState(() => error = message);
      store.showToast(false, 'Could not sign in', message);
      return;
    }
    setState(() {
      pending = true;
      error = '';
    });
    final failure = await store.signIn(address, password.text);
    if (!mounted) return;
    setState(() {
      pending = false;
      error = failure ?? '';
    });
  }

  void forgot() {
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reset is not open yet'),
        content: const Text('Password reset stays with the agent API. It is not connected on this device.'),
        actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close'))],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final reduce = MediaQuery.disableAnimationsOf(context);
    return Scaffold(
      backgroundColor: dashWash,
      body: ListView(
        padding: EdgeInsets.zero,
        children: [
          const _Hero(),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
            child: Column(
              children: [
                FadeTransition(
                  opacity: reduce ? const AlwaysStoppedAnimation(1) : slide,
                  child: SlideTransition(
                    position: reduce ? const AlwaysStoppedAnimation(Offset.zero) : rise,
                    child: _LoginCard(
                      email: email,
                      password: password,
                      hidden: hidden,
                      remember: remember,
                      error: error,
                      pending: pending,
                      onToggleHidden: () => setState(() => hidden = !hidden),
                      onRemember: (value) => setState(() => remember = value ?? false),
                      onForgot: forgot,
                      onSubmit: submit,
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                const _FeatureRow(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Hero extends StatelessWidget {
  const _Hero();

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: const BorderRadius.vertical(bottom: Radius.circular(28)),
      child: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF1636B8), Color(0xFF2F6BFF), Color(0xFF6AA0FF)],
          ),
        ),
        child: Stack(
          children: [
            const Positioned(right: -36, top: -28, child: _Glow(size: 160)),
            const Positioned(left: -30, bottom: 20, child: _Glow(size: 120)),
            SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(18, 12, 18, 22),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const _Brand(),
                    const SizedBox(height: 22),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Expanded(child: _HeroCopy()),
                        const SizedBox(width: 10),
                        const _ScoreCard(),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Row(
                      children: [
                        _GlassChip(icon: Icons.people_alt_outlined, label: 'Customers'),
                        SizedBox(width: 8),
                        _GlassChip(icon: Icons.speed, label: 'CIBIL'),
                        SizedBox(width: 8),
                        _GlassChip(icon: Icons.badge_outlined, label: 'KYC'),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Glow extends StatelessWidget {
  const _Glow({required this.size});

  final double size;

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Container(
        width: size,
        height: size,
        decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0x22FFFFFF)),
      ),
    );
  }
}

class _Brand extends StatelessWidget {
  const _Brand();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          alignment: Alignment.center,
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
          child: const Icon(Icons.flight, color: dashBlue, size: 20),
        ),
        const SizedBox(width: 10),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('BerogetAI', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: -0.4)),
              Text('AGENT DESK', style: TextStyle(color: Color(0xFFD6E4FF), fontSize: 9, fontWeight: FontWeight.w700, letterSpacing: 0.9)),
            ],
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(color: const Color(0x33FFFFFF), borderRadius: BorderRadius.circular(999)),
          child: const Row(
            children: [
              Icon(Icons.verified, size: 14, color: Colors.white),
              SizedBox(width: 4),
              Text('Portal', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
            ],
          ),
        ),
      ],
    );
  }
}

class _HeroCopy extends StatelessWidget {
  const _HeroCopy();

  @override
  Widget build(BuildContext context) {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Grow more,\ntogether.', style: TextStyle(color: Colors.white, fontSize: 30, height: 1.05, fontWeight: FontWeight.w800, letterSpacing: -0.8)),
        SizedBox(height: 8),
        Text('Check a score, keep the customer file, and finish KYC from this desk.', style: TextStyle(color: Color(0xFFD6E4FF), fontSize: 13, height: 1.35)),
      ],
    );
  }
}

class _GlassChip extends StatelessWidget {
  const _GlassChip({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0x24FFFFFF),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0x33FFFFFF)),
        ),
        child: Row(
          children: [
            Icon(icon, color: Colors.white, size: 15),
            const SizedBox(width: 6),
            Flexible(child: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700))),
          ],
        ),
      ),
    );
  }
}

class _ScoreCard extends StatelessWidget {
  const _ScoreCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 112,
      padding: const EdgeInsets.fromLTRB(8, 8, 8, 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [BoxShadow(color: Color(0x332F6BFF), blurRadius: 16, offset: Offset(0, 8))],
      ),
      child: const Column(
        children: [
          Text('Sample', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: Color(0xFF8B95A7), letterSpacing: 0.4)),
          SizedBox(
            width: 88,
            height: 50,
            child: CustomPaint(
              painter: _GaugePainter(),
              child: Align(
                alignment: Alignment(0, 0.85),
                child: Text('782', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: dashNavy, letterSpacing: -0.4)),
              ),
            ),
          ),
          _GoodPill(),
        ],
      ),
    );
  }
}

class _GoodPill extends StatelessWidget {
  const _GoodPill();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(color: const Color(0xFFE8F8EE), borderRadius: BorderRadius.circular(999)),
      child: const Text('Good', style: TextStyle(color: Color(0xFF16A34A), fontSize: 10, fontWeight: FontWeight.w800)),
    );
  }
}

class _GaugePainter extends CustomPainter {
  const _GaugePainter();

  @override
  void paint(Canvas canvas, Size size) {
    final diameter = size.width - 4;
    final rect = Rect.fromLTWH((size.width - diameter) / 2, size.height - (diameter / 2) - 2, diameter, diameter);
    final base = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.round
      ..color = const Color(0xFFE8EEF6);
    canvas.drawArc(rect, math.pi, math.pi, false, base);
    const colors = [Color(0xFFEF4444), Color(0xFFF59E0B), Color(0xFFFACC15), Color(0xFF22C55E)];
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.butt;
    for (var i = 0; i < colors.length; i++) {
      paint.color = colors[i];
      canvas.drawArc(rect, math.pi + (math.pi / 4) * i, math.pi / 4 - 0.03, false, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _LoginCard extends StatelessWidget {
  const _LoginCard({
    required this.email,
    required this.password,
    required this.hidden,
    required this.remember,
    required this.error,
    required this.pending,
    required this.onToggleHidden,
    required this.onRemember,
    required this.onForgot,
    required this.onSubmit,
  });

  final TextEditingController email;
  final TextEditingController password;
  final bool hidden;
  final bool remember;
  final String error;
  final bool pending;
  final VoidCallback onToggleHidden;
  final ValueChanged<bool?> onRemember;
  final VoidCallback onForgot;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFEEF1F6)),
        boxShadow: const [BoxShadow(color: Color(0x142F6BFF), blurRadius: 28, offset: Offset(0, 12))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Welcome Back', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: -0.5, color: dashNavy)),
          const SizedBox(height: 4),
          const Text('Sign in with the email your branch gave you.', style: TextStyle(color: Color(0xFF8B95A7), fontSize: 13, height: 1.3)),
          const SizedBox(height: 16),
          const Text('Email Address', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF3D4658))),
          const SizedBox(height: 6),
          _Field(
            controller: email,
            hint: 'name@beroget.ai',
            icon: Icons.mail_outline,
            keyboard: TextInputType.emailAddress,
          ),
          const SizedBox(height: 12),
          const Text('Password', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF3D4658))),
          const SizedBox(height: 6),
          _Field(
            controller: password,
            hint: 'At least 8 characters',
            icon: Icons.lock_outline,
            hidden: hidden,
            onToggle: onToggleHidden,
            onSubmit: onSubmit,
          ),
          if (error.isNotEmpty) ...[
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(color: const Color(0xFFFFF6E5), borderRadius: BorderRadius.circular(10)),
              child: Text(error, style: const TextStyle(color: Color(0xFFB45309), fontSize: 12, fontWeight: FontWeight.w700)),
            ),
          ],
          const SizedBox(height: 8),
          Row(
            children: [
              SizedBox(
                width: 22,
                height: 22,
                child: Checkbox(value: remember, activeColor: dashBlue, side: const BorderSide(color: Color(0xFFD5DDEA)), onChanged: onRemember),
              ),
              const SizedBox(width: 6),
              const Text('Remember me', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF3D4658))),
              const Spacer(),
              TextButton(
                onPressed: onForgot,
                style: TextButton.styleFrom(
                  foregroundColor: dashBlue,
                  padding: EdgeInsets.zero,
                  minimumSize: const Size(0, 32),
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: const Text('Forgot Password?', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          DecoratedBox(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              gradient: const LinearGradient(colors: [Color(0xFF4C8DFF), Color(0xFF2F6BFF)]),
              boxShadow: const [BoxShadow(color: Color(0x552F6BFF), blurRadius: 16, offset: Offset(0, 8))],
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: pending ? null : onSubmit,
                borderRadius: BorderRadius.circular(14),
                child: SizedBox(
                  height: 50,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(pending ? 'Signing in' : 'Login', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15)),
                      const SizedBox(width: 8),
                      Icon(pending ? Icons.hourglass_top : Icons.arrow_forward, color: Colors.white, size: 18),
                    ],
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

class _Field extends StatelessWidget {
  const _Field({
    required this.controller,
    required this.hint,
    required this.icon,
    this.keyboard,
    this.hidden = false,
    this.onToggle,
    this.onSubmit,
  });

  final TextEditingController controller;
  final String hint;
  final IconData icon;
  final TextInputType? keyboard;
  final bool hidden;
  final VoidCallback? onToggle;
  final VoidCallback? onSubmit;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboard,
      obscureText: hidden,
      onSubmitted: onSubmit == null ? null : (_) => onSubmit!(),
      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: dashNavy),
      decoration: InputDecoration(
        isDense: true,
        hintText: hint,
        hintStyle: const TextStyle(color: Color(0xFFB0B8C6), fontWeight: FontWeight.w500, fontSize: 13),
        prefixIcon: Icon(icon, size: 18, color: const Color(0xFF9AA3B2)),
        suffixIcon: onToggle == null
            ? null
            : IconButton(
                onPressed: onToggle,
                icon: Icon(hidden ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 18, color: const Color(0xFF9AA3B2)),
              ),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        contentPadding: const EdgeInsets.symmetric(vertical: 14),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE6EBF3))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE6EBF3))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: dashBlue, width: 1.3)),
      ),
    );
  }
}

class _FeatureRow extends StatelessWidget {
  const _FeatureRow();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFEEF1F6)),
      ),
      child: const Row(
        children: [
          _Feature(icon: Icons.groups_outlined, color: dashBlue, tint: Color(0xFFE8F0FF), label: 'Customer\nfiles'),
          _Feature(icon: Icons.speed, color: Color(0xFF16A34A), tint: Color(0xFFE8F8EE), label: 'CIBIL\nchecks'),
          _Feature(icon: Icons.badge_outlined, color: Color(0xFFD97706), tint: Color(0xFFFFF6E8), label: 'KYC\ndocuments'),
        ],
      ),
    );
  }
}

class _Feature extends StatelessWidget {
  const _Feature({required this.icon, required this.color, required this.tint, required this.label});

  final IconData icon;
  final Color color;
  final Color tint;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(color: tint, borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 8),
          Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 12, height: 1.2, fontWeight: FontWeight.w700, color: Color(0xFF5C677A))),
        ],
      ),
    );
  }
}
