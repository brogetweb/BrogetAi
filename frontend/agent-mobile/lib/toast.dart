import 'package:flutter/material.dart';

import 'store.dart';
import 'ui.dart';

class AgentToastHost extends StatelessWidget {
  const AgentToastHost({super.key});

  @override
  Widget build(BuildContext context) {
    final store = AgentScope.of(context);
    final toast = store.toast;
    if (toast == null) return const SizedBox.shrink();
    final top = MediaQuery.paddingOf(context).top + 12;
    return Padding(
      padding: EdgeInsets.only(top: top, right: 12),
      child: Align(
        alignment: Alignment.topRight,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 320),
          child: _ToastCard(
            key: ValueKey(toast.id),
            toast: toast,
            onClose: store.dismissToast,
          ),
        ),
      ),
    );
  }
}

class _ToastCard extends StatefulWidget {
  const _ToastCard({required this.toast, required this.onClose, super.key});

  final DeskToast toast;
  final VoidCallback onClose;

  @override
  State<_ToastCard> createState() => _ToastCardState();
}

class _ToastCardState extends State<_ToastCard> with SingleTickerProviderStateMixin {
  late final AnimationController bar;

  @override
  void initState() {
    super.initState();
    bar = AnimationController(vsync: this, duration: const Duration(milliseconds: 4500))..forward();
  }

  @override
  void dispose() {
    bar.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ok = widget.toast.ok;
    final tone = ok ? const Color(0xFF16A34A) : const Color(0xFFDC2626);
    final wash = ok ? const Color(0xFFE8F8EE) : const Color(0xFFFFF1F2);
    return Material(
      color: Colors.white,
      elevation: 8,
      shadowColor: const Color(0x2912182B),
      borderRadius: BorderRadius.circular(16),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 12, 8, 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(color: wash, borderRadius: BorderRadius.circular(10)),
                    child: Icon(ok ? Icons.check : Icons.priority_high, size: 18, color: tone),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(top: 1),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(widget.toast.title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: dashNavy)),
                          if (widget.toast.detail != null) ...[
                            const SizedBox(height: 2),
                            Text(widget.toast.detail!, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12, height: 1.3, color: Color(0xFF5C677A))),
                          ],
                        ],
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: widget.onClose,
                    visualDensity: VisualDensity.compact,
                    icon: const Icon(Icons.close, size: 16, color: Color(0xFF8B95A7)),
                  ),
                ],
              ),
            ),
            AnimatedBuilder(
              animation: bar,
              builder: (context, _) {
                return Align(
                  alignment: Alignment.centerLeft,
                  child: FractionallySizedBox(
                    widthFactor: 1 - bar.value,
                    child: Container(height: 3, color: tone),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
