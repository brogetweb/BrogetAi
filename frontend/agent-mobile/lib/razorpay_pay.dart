import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'api.dart';
import 'pay_launch.dart' if (dart.library.html) 'pay_launch_web.dart';
import 'ui.dart';

const _blue = Color(0xFF0B5CFF);
const _blueDeep = Color(0xFF072A87);
const _blueLight = Color(0xFF2B6BFF);

enum _Phase { ready, paying, verifying, paid, failed }

/// Razorpay checkout for a wallet top-up. Our hosted Razorpay page opens in the browser; when the agent comes
/// back to the app, and every few seconds while waiting, the server asks Razorpay whether the payment was captured.
class RazorpayPayPage extends StatefulWidget {
  const RazorpayPayPage({super.key, required this.amount, required this.requestId, required this.paymentUrl});

  final double amount;
  final String requestId;
  final String paymentUrl;

  @override
  State<RazorpayPayPage> createState() => _RazorpayPayPageState();
}

class _RazorpayPayPageState extends State<RazorpayPayPage> with WidgetsBindingObserver {
  var opened = false;
  var opening = false;
  var checking = false;
  var status = 'pending';
  String? error;
  Timer? poller;

  _Phase get phase {
    if (status == 'success') return _Phase.paid;
    if (status == 'failed') return _Phase.failed;
    if (checking) return _Phase.verifying;
    return opened ? _Phase.paying : _Phase.ready;
  }

  bool get done => status == 'success' || status == 'failed';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) => openCheckout());
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    poller?.cancel();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Agent returns from the Razorpay browser page: check right away.
    if (state == AppLifecycleState.resumed && opened && !done) check();
  }

  Future<void> openCheckout() async {
    final uri = Uri.tryParse(widget.paymentUrl);
    if (uri == null) {
      setState(() => error = 'The payment link is not valid. Start the top-up again.');
      return;
    }
    setState(() {
      opening = true;
      error = null;
    });
    final ok = await launchPayment(uri);
    if (!mounted) return;
    setState(() {
      opening = false;
      if (ok) {
        opened = true;
      } else {
        error = 'Could not open the payment page. Install a browser and try again.';
      }
    });
    if (ok) {
      poller?.cancel();
      poller = Timer.periodic(const Duration(seconds: 6), (_) {
        if (!done) check();
      });
    }
  }

  Future<void> check({bool manual = false}) async {
    if (checking || widget.requestId.isEmpty) return;
    setState(() => checking = true);
    final store = AgentScope.of(context);
    try {
      final next = await checkWalletTopup(accessToken: store.accessToken, requestId: widget.requestId);
      if (!mounted) return;
      final wasDone = done;
      setState(() => status = next);
      if (!wasDone && done) {
        poller?.cancel();
        HapticFeedback.mediumImpact();
        await store.loadWallet();
      }
    } on ApiException catch (caught) {
      if (manual && mounted) store.showToast(false, 'Check status', caught.message);
    } finally {
      if (mounted) setState(() => checking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = phase;
    return Scaffold(
      backgroundColor: const Color(0xFFF7F4FC),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(child: _header(context)),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                _stepper(p),
                const SizedBox(height: 16),
                if (p == _Phase.paid)
                  _result(ok: true)
                else if (p == _Phase.failed)
                  _result(ok: false)
                else
                  ..._waiting(p),
                if (error != null) ...[
                  const SizedBox(height: 12),
                  Text(error!, style: const TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w700)),
                ],
                const SizedBox(height: 18),
                if (done)
                  FilledButton(
                    style: FilledButton.styleFrom(backgroundColor: p == _Phase.paid ? const Color(0xFF059669) : dashNavy, minimumSize: const Size.fromHeight(52), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
                    onPressed: () => Navigator.of(context).pop(),
                    child: Text(p == _Phase.paid ? 'Back to wallet' : 'Try again', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                  )
                else if (opened)
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(foregroundColor: _blue, side: const BorderSide(color: Color(0xFFD9C8F2)), minimumSize: const Size.fromHeight(50), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
                    onPressed: checking ? null : () => check(manual: true),
                    icon: checking ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: _blue)) : const Icon(Icons.refresh_rounded, size: 18),
                    label: Text(checking ? 'Checking payment…' : 'Check status', style: const TextStyle(fontWeight: FontWeight.w800)),
                  ),
                const SizedBox(height: 14),
                if (!done)
                  const Text('Going back does not cancel the payment. A pending top-up stays in the wallet ledger until Razorpay confirms it.', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFF8B95A7), fontSize: 12, height: 1.4)),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _header(BuildContext context) {
    final top = MediaQuery.of(context).padding.top;
    return Container(
      padding: EdgeInsets.fromLTRB(8, top + 4, 20, 26),
      decoration: const BoxDecoration(
        gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [_blueLight, _blue, _blueDeep]),
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              IconButton(onPressed: () => Navigator.of(context).pop(), icon: const Icon(Icons.arrow_back_rounded, color: Colors.white)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(99)),
                child: const Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.verified_user_rounded, color: Colors.white, size: 14),
                  SizedBox(width: 6),
                  Text('Secured by Razorpay', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 11.5)),
                ]),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.only(left: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),
                Text('ADDING TO BROGET WALLET', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontWeight: FontWeight.w700, fontSize: 11, letterSpacing: 1.2)),
                const SizedBox(height: 4),
                Text(inr(widget.amount), style: const TextStyle(color: Colors.white, fontSize: 40, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: () {
                    Clipboard.setData(ClipboardData(text: widget.requestId));
                    AgentScope.of(context).showToast(true, 'Copied', 'Order id copied.');
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)),
                    child: Text('Order ${widget.requestId}', style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 11, fontFamily: 'monospace')),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _stepper(_Phase p) {
    final pay = p == _Phase.ready || p == _Phase.paying ? 1 : 2; // 1 active, 2 done
    final credit = p == _Phase.paid ? 2 : p == _Phase.failed ? 3 : p == _Phase.verifying ? 1 : 0; // 0 todo, 1 active, 2 done, 3 error
    Widget dot(int state, String n) {
      final bg = state == 2 ? const Color(0xFF10B981) : state == 3 ? const Color(0xFFEF4444) : state == 1 ? _blue : const Color(0xFFEDEFF4);
      return Container(
        width: 28,
        height: 28,
        alignment: Alignment.center,
        decoration: BoxDecoration(color: bg, shape: BoxShape.circle, boxShadow: state == 1 ? [BoxShadow(color: _blue.withValues(alpha: 0.25), blurRadius: 0, spreadRadius: 4)] : null),
        child: state == 2
            ? const Icon(Icons.check_rounded, color: Colors.white, size: 16)
            : state == 3
                ? const Icon(Icons.close_rounded, color: Colors.white, size: 16)
                : Text(n, style: TextStyle(color: state == 1 ? Colors.white : const Color(0xFF8B95A7), fontWeight: FontWeight.w800, fontSize: 12)),
      );
    }

    Widget line(bool on) => Expanded(child: Container(height: 2, color: on ? const Color(0xFF10B981) : const Color(0xFFE6EAF0)));
    Widget label(String text, bool on) => Expanded(child: Text(text, textAlign: TextAlign.center, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: on ? dashNavy : const Color(0xFF8B95A7))));

    return Container(
      padding: const EdgeInsets.fromLTRB(12, 14, 12, 12),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: const Color(0xFFEDE6F7))),
      child: Column(
        children: [
          Row(children: [
            const Spacer(),
            dot(2, '1'),
            line(true),
            dot(pay, '2'),
            line(pay == 2 && credit != 0),
            dot(credit, '3'),
            const Spacer(),
          ]),
          const SizedBox(height: 8),
          Row(children: [
            label('Order created', true),
            label('Pay securely', true),
            label(p == _Phase.failed ? 'Failed' : 'Wallet credited', credit != 0),
          ]),
        ],
      ),
    );
  }

  List<Widget> _waiting(_Phase p) {
    return [
      Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: const Color(0xFFEDE6F7))),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Pay using', style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            Row(children: const [
              _Method(icon: Icons.qr_code_2_rounded, label: 'UPI'),
              SizedBox(width: 8),
              _Method(icon: Icons.credit_card_rounded, label: 'Cards'),
              SizedBox(width: 8),
              _Method(icon: Icons.account_balance_rounded, label: 'Net banking'),
              SizedBox(width: 8),
              _Method(icon: Icons.account_balance_wallet_rounded, label: 'Wallets'),
            ]),
          ],
        ),
      ),
      const SizedBox(height: 16),
        DecoratedBox(
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: _blue.withValues(alpha: 0.35), blurRadius: 22, offset: const Offset(0, 10), spreadRadius: -8)]),
          child: FilledButton(
            style: FilledButton.styleFrom(backgroundColor: _blue, minimumSize: const Size.fromHeight(56), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
            onPressed: opening ? null : openCheckout,
            child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              Text(opening ? 'Opening payment…' : opened ? 'Open payment page again' : 'Pay ${inr(widget.amount)}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15.5)),
              const SizedBox(width: 8),
              const Icon(Icons.arrow_forward_rounded, size: 20),
            ]),
          ),
        ),
      const SizedBox(height: 14),
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(color: const Color(0xFFF1F3F7), borderRadius: BorderRadius.circular(14)),
        child: Row(children: [
          if (p == _Phase.paying || p == _Phase.verifying)
            const _LiveDot()
          else
            const Icon(Icons.shield_outlined, size: 16, color: Color(0xFF64748B)),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              p == _Phase.verifying
                  ? 'Checking payment…'
                  : p == _Phase.paying
                      ? 'Finish the payment in the browser, then come back. This screen updates by itself.'
                      : 'Razorpay opens securely in your browser. Your wallet updates only after Razorpay confirms.',
              style: const TextStyle(color: Color(0xFF475569), fontSize: 13, height: 1.35),
            ),
          ),
        ]),
      ),
    ];
  }

  Widget _result({required bool ok}) {
    final store = AgentScope.of(context);
    final accent = ok ? const Color(0xFF059669) : const Color(0xFFDC2626);
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 26, 20, 22),
      decoration: BoxDecoration(color: ok ? const Color(0xFFECFDF5) : const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(20), border: Border.all(color: ok ? const Color(0xFFA7F3D0) : const Color(0xFFFECACA))),
      child: Column(children: [
        TweenAnimationBuilder<double>(
          tween: Tween(begin: 0.6, end: 1),
          duration: const Duration(milliseconds: 420),
          curve: Curves.easeOutBack,
          builder: (_, scale, child) => Transform.scale(scale: scale, child: child),
          child: Container(
            width: 68,
            height: 68,
            decoration: BoxDecoration(color: accent, shape: BoxShape.circle, boxShadow: [BoxShadow(color: accent.withValues(alpha: 0.4), blurRadius: 20, offset: const Offset(0, 8), spreadRadius: -6)]),
            child: Icon(ok ? Icons.check_rounded : Icons.close_rounded, color: Colors.white, size: 36),
          ),
        ),
        const SizedBox(height: 14),
        Text(ok ? 'Payment successful' : 'Payment failed', style: TextStyle(color: accent, fontWeight: FontWeight.w800, fontSize: 19)),
        const SizedBox(height: 6),
        Text(
          ok ? '${inr(widget.amount)} added. New balance ${inr(store.walletBalance)}.' : 'No money was added. If your bank debited you, it is refunded automatically.',
          textAlign: TextAlign.center,
          style: TextStyle(color: ok ? const Color(0xFF047857) : const Color(0xFFB91C1C), height: 1.4),
        ),
      ]),
    );
  }
}

class _Method extends StatelessWidget {
  const _Method({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(color: const Color(0xFFFAF7FF), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE9DEFA))),
        child: Column(children: [
          Icon(icon, color: _blue, size: 20),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 11.5, color: dashNavy)),
        ]),
      ),
    );
  }
}

class _LiveDot extends StatefulWidget {
  const _LiveDot();

  @override
  State<_LiveDot> createState() => _LiveDotState();
}

class _LiveDotState extends State<_LiveDot> with SingleTickerProviderStateMixin {
  late final AnimationController c = AnimationController(vsync: this, duration: const Duration(milliseconds: 1100))..repeat(reverse: true);

  @override
  void dispose() {
    c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: Tween(begin: 0.35, end: 1.0).animate(c),
      child: Container(width: 9, height: 9, decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle)),
    );
  }
}
