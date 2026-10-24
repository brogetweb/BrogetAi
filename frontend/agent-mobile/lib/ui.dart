import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'store.dart';

const ink = Color(0xFF17191E);
const paper = Color(0xFFF6F5F2);
const line = Color(0xFFE6EAF0);
const muted = Color(0xFF64748B);
const indigo = Color(0xFF4F46E5);
const dashBlue = Color(0xFF2F6BFF);
const dashNavy = Color(0xFF12182B);
const dashWash = Color(0xFFF5F7FB);

class CibilBadge extends StatelessWidget {
  const CibilBadge({this.size = 40, super.key});

  final double size;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(size * 0.24),
      child: Image.asset(
        'assets/brand/mark.png',
        width: size,
        height: size,
        fit: BoxFit.cover,
        filterQuality: FilterQuality.high,
        gaplessPlayback: true,
      ),
    );
  }
}

class CibilGauge extends StatelessWidget {
  const CibilGauge({required this.width, super.key});

  final double width;

  @override
  Widget build(BuildContext context) {
    return RepaintBoundary(
      child: CustomPaint(
        size: Size(width, width * 0.62),
        painter: const CibilGaugePainter(),
      ),
    );
  }
}

class CibilGaugePainter extends CustomPainter {
  const CibilGaugePainter();

  static const colors = [
    Color(0xFFEF4444),
    Color(0xFFF97316),
    Color(0xFFEAB308),
    Color(0xFF22C55E),
    Color(0xFF15803D),
  ];

  @override
  void paint(Canvas canvas, Size size) {
    final stroke = size.width * 0.16;
    final diameter = size.width - stroke;
    final rect = Rect.fromLTWH(stroke / 2, size.height - (diameter / 2) - 1, diameter, diameter);
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.butt;
    final sweep = math.pi / colors.length;
    const gap = 0.05;
    for (var i = 0; i < colors.length; i++) {
      paint.color = colors[i];
      canvas.drawArc(rect, math.pi - sweep * i, -(sweep - gap), false, paint);
    }
    final theta = math.pi * 0.28;
    final cx = size.width / 2;
    final cy = rect.center.dy;
    final len = diameter * 0.34;
    final needle = Paint()
      ..color = dashNavy
      ..strokeWidth = math.max(1.4, size.width * 0.055)
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(Offset(cx, cy), Offset(cx + math.cos(theta) * len, cy - math.sin(theta) * len), needle);
    canvas.drawCircle(Offset(cx, cy), math.max(1.6, size.width * 0.07), Paint()..color = dashNavy);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class AgentScope extends InheritedNotifier<AgentStore> {
  const AgentScope({required AgentStore store, required super.child, super.key}) : super(notifier: store);

  static AgentStore of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AgentScope>();
    assert(scope != null, 'AgentScope is missing');
    return scope!.notifier!;
  }
}

class DeskNav extends InheritedWidget {
  const DeskNav({required this.openMenu, required this.go, required this.index, required super.child, super.key});

  final VoidCallback openMenu;
  final ValueChanged<int> go;
  final int index;

  static DeskNav of(BuildContext context) {
    final nav = context.dependOnInheritedWidgetOfExactType<DeskNav>();
    assert(nav != null, 'DeskNav is missing');
    return nav!;
  }

  @override
  bool updateShouldNotify(DeskNav oldWidget) => index != oldWidget.index;
}

class ScoreBand {
  const ScoreBand(this.label, this.color, this.wash, this.range);

  final String label;
  final Color color;
  final Color wash;
  final String range;
}

ScoreBand scoreBand(int score) {
  if (score >= 750) return const ScoreBand('Excellent', Color(0xFF16A34A), Color(0xFFE8F8EE), '750 – 900');
  if (score >= 700) return const ScoreBand('Good', Color(0xFF16A34A), Color(0xFFE8F8EE), '700 – 749');
  if (score >= 650) return const ScoreBand('Fair', Color(0xFFD97706), Color(0xFFFFF6D8), '650 – 699');
  return const ScoreBand('Poor', Color(0xFFDC2626), Color(0xFFFFF1F2), 'Under 650');
}

class BrandLockup extends StatelessWidget {
  const BrandLockup({this.light = false, super.key});

  final bool light;

  @override
  Widget build(BuildContext context) {
    final title = light ? Colors.white : ink;
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            gradient: const LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFF4F46E5), Color(0xFF8B5CF6), Color(0xFFD946EF)]),
          ),
          child: Container(
            width: 22,
            height: 22,
            alignment: Alignment.center,
            decoration: BoxDecoration(borderRadius: BorderRadius.circular(7), border: Border.all(color: Colors.white)),
            child: const Text('B', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13)),
          ),
        ),
        const SizedBox(width: 10),
        Text.rich(
          TextSpan(children: [
            TextSpan(text: 'Broget', style: TextStyle(color: title, fontWeight: FontWeight.w800, fontSize: 20, letterSpacing: -0.6)),
            TextSpan(text: 'AI', style: TextStyle(color: light ? const Color(0xFFC7D2FE) : indigo, fontWeight: FontWeight.w800, fontSize: 20, letterSpacing: -0.6)),
          ]),
        ),
      ],
    );
  }
}

class SoftCard extends StatelessWidget {
  const SoftCard({required this.child, this.padding = const EdgeInsets.all(16), this.onTap, super.key});

  final Widget child;
  final EdgeInsets padding;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(20);
    return SizedBox(
      width: double.infinity,
      child: Material(
      color: Colors.white,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(borderRadius: radius, side: const BorderSide(color: line)),
      child: InkWell(
        onTap: onTap,
        borderRadius: radius,
        child: Padding(padding: padding, child: child),
      ),
    ),
    );
  }
}

class StatusChip extends StatelessWidget {
  const StatusChip({required this.label, required this.color, super.key});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(999)),
      child: Text(label, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w700)),
    );
  }
}

Color kycColor(KycStatus status) => switch (status) {
      KycStatus.pending => const Color(0xFFB45309),
      KycStatus.review => indigo,
      KycStatus.verified => const Color(0xFF047857),
    };

Color loanColor(LoanStatus status) => switch (status) {
      LoanStatus.draft => muted,
      LoanStatus.submitted => indigo,
      LoanStatus.review => const Color(0xFF6D28D9),
      LoanStatus.needsDocs => const Color(0xFFB45309),
    };

InputDecoration deskField(String label, String hint) {
  const border = OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(16)), borderSide: BorderSide(color: line));
  return InputDecoration(
    labelText: label,
    hintText: hint,
    filled: true,
    fillColor: const Color(0xFFF4F6F8),
    labelStyle: const TextStyle(color: muted, fontWeight: FontWeight.w600),
    hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
    border: border,
    enabledBorder: border,
    focusedBorder: const OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(16)), borderSide: BorderSide(color: indigo, width: 1.4)),
  );
}

class DeskButton extends StatelessWidget {
  const DeskButton({required this.label, required this.onPressed, super.key});

  final String label;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: FilledButton(
        onPressed: onPressed,
        style: FilledButton.styleFrom(
          backgroundColor: ink,
          disabledBackgroundColor: const Color(0xFFD6D3D1),
          foregroundColor: Colors.white,
          shape: const StadiumBorder(),
          textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
        ),
        child: Text(label),
      ),
    );
  }
}

String inr(num value) {
  final negative = value < 0;
  final fixed = value.abs().toStringAsFixed(2);
  final whole = fixed.split('.').first;
  final frac = fixed.substring(fixed.indexOf('.'));
  if (whole.length <= 3) return '${negative ? '-' : ''}₹$whole$frac';
  final tail = whole.substring(whole.length - 3);
  var head = whole.substring(0, whole.length - 3);
  final groups = <String>[];
  while (head.length > 2) {
    groups.insert(0, head.substring(head.length - 2));
    head = head.substring(0, head.length - 2);
  }
  if (head.isNotEmpty) groups.insert(0, head);
  return '${negative ? '-' : ''}₹${groups.join(',')},$tail$frac';
}

String stamp(DateTime value) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  final hour = value.hour.toString().padLeft(2, '0');
  final minute = value.minute.toString().padLeft(2, '0');
  return '${value.day} ${months[value.month - 1]} · $hour:$minute';
}

String phoneLabel(String phone) {
  final digits = phone.replaceAll(RegExp(r'\D'), '');
  if (digits.length != 10) return phone;
  return '${digits.substring(0, 5)} ${digits.substring(5)}';
}

String prettyDate(DateTime value) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return '${value.day} ${months[value.month - 1]} ${value.year}';
}

String groupedAadhaar(String value) {
  final digits = value.replaceAll(RegExp(r'\D'), '');
  if (digits.isEmpty) return '';
  final buf = StringBuffer();
  for (var i = 0; i < digits.length && i < 12; i++) {
    if (i > 0 && i % 4 == 0) buf.write(' ');
    buf.write(digits[i]);
  }
  return buf.toString();
}

String maskPan(String pan) {
  final code = pan.trim().toUpperCase();
  if (code.length < 6) return code;
  return '${code.substring(0, 5)}••••${code.substring(code.length - 1)}';
}

String maskAadhaar(String value) {
  final digits = value.replaceAll(RegExp(r'\D'), '');
  if (digits.length < 4) return digits;
  return 'XXXX XXXX ${digits.substring(digits.length - 4)}';
}

class AlertsPage extends StatefulWidget {
  const AlertsPage({super.key});

  @override
  State<AlertsPage> createState() => _AlertsPageState();
}

class _AlertsPageState extends State<AlertsPage> {
  var unreadOnly = false;

  @override
  Widget build(BuildContext context) {
    final store = AgentScope.of(context);
    final notices = store.notices.where((notice) => !unreadOnly || !notice.read).toList();
    final unread = store.unread;

    return Scaffold(
      backgroundColor: dashWash,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 16, 0),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.arrow_back_rounded, color: dashNavy),
                  ),
                  const Expanded(
                    child: Text('Notifications', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: dashNavy, letterSpacing: -0.4)),
                  ),
                  TextButton(
                    onPressed: unread == 0 ? null : store.markAllRead,
                    style: TextButton.styleFrom(foregroundColor: dashBlue, disabledForegroundColor: const Color(0xFFB0B8C6), visualDensity: VisualDensity.compact),
                    child: const Text('Mark all read', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
              child: Text(
                unread == 0 ? 'You are caught up.' : '$unread unread on this desk',
                style: const TextStyle(color: Color(0xFF8B95A7), fontWeight: FontWeight.w600),
              ),
            ),
            const SizedBox(height: 14),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  _AlertChip(label: 'All', count: store.notices.length, selected: !unreadOnly, onTap: () => setState(() => unreadOnly = false)),
                  const SizedBox(width: 8),
                  _AlertChip(label: 'Unread', count: unread, selected: unreadOnly, onTap: () => setState(() => unreadOnly = true)),
                ],
              ),
            ),
            if (!store.alertsOn)
              const Padding(
                padding: EdgeInsets.fromLTRB(16, 12, 16, 0),
                child: _PausedNote(),
              ),
            const SizedBox(height: 12),
            Expanded(
              child: notices.isEmpty
                  ? const _EmptyAlerts()
                  : ListView.separated(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 28),
                      itemCount: notices.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 10),
                      itemBuilder: (context, index) => _NoticeCard(notice: notices[index], onOpen: () => store.markRead(notices[index])),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AlertChip extends StatelessWidget {
  const _AlertChip({required this.label, required this.count, required this.selected, required this.onTap});

  final String label;
  final int count;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? dashBlue : Colors.white,
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: selected ? dashBlue : const Color(0xFFEEF1F6)),
          ),
          child: Text('$label ($count)', style: TextStyle(color: selected ? Colors.white : const Color(0xFF5C677A), fontWeight: FontWeight.w800, fontSize: 13)),
        ),
      ),
    );
  }
}

class _PausedNote extends StatelessWidget {
  const _PausedNote();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(color: const Color(0xFFFFF6E5), borderRadius: BorderRadius.circular(14)),
      child: const Row(
        children: [
          Icon(Icons.notifications_off_outlined, color: Color(0xFFD97706), size: 18),
          SizedBox(width: 8),
          Expanded(child: Text('Alerts are paused in Profile. Older notices stay here.', style: TextStyle(color: Color(0xFF8A6A2F), fontSize: 12, fontWeight: FontWeight.w700))),
        ],
      ),
    );
  }
}

class _EmptyAlerts extends StatelessWidget {
  const _EmptyAlerts();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _ToneIcon(icon: Icons.notifications_none_rounded, color: dashBlue, wash: Color(0xFFEAF1FF), size: 56),
            SizedBox(height: 14),
            Text('Nothing new', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: dashNavy)),
            SizedBox(height: 4),
            Text('New desk notices will show up here.', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFF8B95A7), fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}

class _NoticeCard extends StatelessWidget {
  const _NoticeCard({required this.notice, required this.onOpen});

  final DeskNotice notice;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    final tone = _toneFor(notice.title);
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        onTap: onOpen,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: notice.read ? const Color(0xFFEEF1F6) : const Color(0xFFD6E4FF)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _ToneIcon(icon: tone.icon, color: tone.color, wash: tone.wash),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(notice.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy, fontSize: 14)),
                        ),
                        if (!notice.read)
                          Container(
                            width: 8,
                            height: 8,
                            margin: const EdgeInsets.only(left: 8, top: 2),
                            decoration: const BoxDecoration(color: dashBlue, shape: BoxShape.circle),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(notice.body, style: const TextStyle(color: Color(0xFF5C677A), fontSize: 13, height: 1.35)),
                    const SizedBox(height: 8),
                    Text(_ago(notice.at), style: const TextStyle(color: Color(0xFF8B95A7), fontSize: 11, fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ToneIcon extends StatelessWidget {
  const _ToneIcon({required this.icon, required this.color, required this.wash, this.size = 42});

  final IconData icon;
  final Color color;
  final Color wash;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(color: wash, borderRadius: BorderRadius.circular(size > 48 ? 16 : 12)),
      child: Icon(icon, color: color, size: size > 48 ? 26 : 20),
    );
  }
}

({IconData icon, Color color, Color wash}) _toneFor(String title) {
  final text = title.toLowerCase();
  if (text.contains('cibil') || text.contains('score')) {
    return (icon: Icons.speed, color: const Color(0xFF16A34A), wash: const Color(0xFFE8F8EE));
  }
  if (text.contains('consent')) {
    return (icon: Icons.verified_user_outlined, color: dashBlue, wash: const Color(0xFFEAF1FF));
  }
  if (text.contains('kyc') || text.contains('document') || text.contains('income')) {
    return (icon: Icons.badge_outlined, color: const Color(0xFFD97706), wash: const Color(0xFFFFF6E5));
  }
  if (text.contains('customer')) {
    return (icon: Icons.person_add_alt_1, color: dashBlue, wash: const Color(0xFFEAF1FF));
  }
  if (text.contains('review') || text.contains('submitted')) {
    return (icon: Icons.description_outlined, color: const Color(0xFF7C3AED), wash: const Color(0xFFF3E8FF));
  }
  return (icon: Icons.notifications_none_rounded, color: dashBlue, wash: const Color(0xFFEAF1FF));
}

String _ago(DateTime value) {
  final delta = DateTime.now().difference(value);
  if (delta.inMinutes < 1) return 'Just now';
  if (delta.inMinutes < 60) return '${delta.inMinutes}m ago';
  if (delta.inHours < 24) return '${delta.inHours}h ago';
  if (delta.inDays == 1) return 'Yesterday';
  if (delta.inDays < 7) return '${delta.inDays}d ago';
  return prettyDate(value);
}
