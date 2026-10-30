import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import 'api.dart';
import 'theme.dart';
import 'widgets.dart';

enum PayMethod { upi, card, netbanking, wallet }

/// Full-screen checkout — clear methods + amount + Broget Pay / demo confirm.
class FlightPaymentPage extends StatefulWidget {
  const FlightPaymentPage({
    required this.amount,
    required this.quote,
    required this.demo,
    required this.paymentUrl,
    required this.checkoutUrl,
    required this.requestId,
    required this.routeLabel,
    required this.airline,
    super.key,
  });

  final double amount;
  final Map<String, dynamic> quote;
  final bool demo;
  final String paymentUrl;
  final String checkoutUrl;
  final String requestId;
  final String routeLabel;
  final String airline;

  @override
  State<FlightPaymentPage> createState() => _FlightPaymentPageState();
}

class _FlightPaymentPageState extends State<FlightPaymentPage> {
  var method = PayMethod.upi;
  var busy = false;
  var waitingGateway = false;
  String? note;
  Timer? _poll;

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }

  String get _methodLabel => switch (method) {
        PayMethod.upi => 'UPI',
        PayMethod.card => 'Credit / Debit Card',
        PayMethod.netbanking => 'Net Banking',
        PayMethod.wallet => 'PhonePe / GPay / Paytm',
      };

  String get _ctaLabel {
    if (busy) return 'Please wait...';
    if (widget.demo) return 'Pay ${inr(widget.amount)} · Demo';
    if (waitingGateway) return 'I’ve paid · Verify';
    return 'Pay ${inr(widget.amount)} via $_methodLabel';
  }

  Future<void> _submit() async {
    if (busy) return;
    if (widget.demo) {
      await _demoPay();
      return;
    }
    if (waitingGateway) {
      await _checkPaid();
      return;
    }
    await _openGateway();
  }

  Future<void> _openGateway() async {
    final url = (widget.paymentUrl.isNotEmpty ? widget.paymentUrl : widget.checkoutUrl).trim();
    if (url.isEmpty) {
      setState(() => note = 'Payment link missing. Try again from review.');
      return;
    }
    setState(() {
      busy = true;
      note = null;
    });
    try {
      final ok = await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
      if (!mounted) return;
      if (!ok) {
        setState(() {
          busy = false;
          note = 'Could not open Broget Pay. Install a browser / UPI app.';
        });
        return;
      }
      setState(() {
        busy = false;
        waitingGateway = true;
        note = 'Finish $_methodLabel in Broget Pay, then tap “I’ve paid · Verify”.';
      });
      _startPoll();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        busy = false;
        note = '$e';
      });
    }
  }

  void _startPoll() {
    _poll?.cancel();
    _poll = Timer.periodic(const Duration(seconds: 4), (_) async {
      try {
        final order = await BookApi.instance.flightOrderStatus(widget.requestId);
        final status = '${order['status'] ?? ''}';
        if (status == 'paid' || status == 'ticketed') {
          _poll?.cancel();
          if (!mounted) return;
          Navigator.pop(context, true);
        }
      } catch (_) {}
    });
  }

  Future<void> _demoPay() async {
    setState(() {
      busy = true;
      note = null;
    });
    try {
      await BookApi.instance.confirmDemoFlightPay(widget.requestId);
      if (!mounted) return;
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        busy = false;
        note = '$e';
      });
    }
  }

  Future<void> _checkPaid() async {
    setState(() {
      busy = true;
      note = null;
    });
    try {
      final order = await BookApi.instance.flightOrderStatus(widget.requestId);
      final status = '${order['status'] ?? ''}';
      if (status == 'paid' || status == 'ticketed') {
        if (!mounted) return;
        Navigator.pop(context, true);
        return;
      }
      if (!mounted) return;
      setState(() {
        busy = false;
        note = 'Still pending. Complete payment in Broget Pay, then verify again.';
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        busy = false;
        note = '$e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final money = widget.quote['moneyTo'] as Map? ?? {};
    final top = MediaQuery.paddingOf(context).top;

    return Scaffold(
      backgroundColor: bookWash,
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: EdgeInsets.fromLTRB(14, top + 8, 14, 18),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF0B1F3A), Color(0xFF0052CC), Color(0xFF0066FF)],
              ),
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(26)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    IconButton(
                      onPressed: busy ? null : () => Navigator.pop(context, false),
                      style: IconButton.styleFrom(backgroundColor: Colors.white.withValues(alpha: 0.12), foregroundColor: Colors.white),
                      icon: const Icon(Icons.close_rounded),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.14),
                        borderRadius: BorderRadius.circular(99),
                      ),
                      child: Text(
                        widget.demo ? 'DEMO MODE' : 'SECURE · BROGET PAY',
                        style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 10, letterSpacing: 0.4),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text('Payment', style: GoogleFonts.poppins(color: Colors.white70, fontWeight: FontWeight.w600, fontSize: 12)),
                Text(inr(widget.amount), style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 32, height: 1.1)),
                const SizedBox(height: 4),
                Text(
                  '${widget.airline} · ${widget.routeLabel}',
                  style: GoogleFonts.poppins(color: Colors.white70, fontWeight: FontWeight.w500, fontSize: 12.5),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
              children: [
                SoftCard(
                  padding: const EdgeInsets.fromLTRB(12, 12, 12, 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Amount break-up', style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 13.5, color: bookNavy)),
                      const SizedBox(height: 8),
                      _MoneyLine('Airline net → AO Pay wallet', inr(money['aoPayWallet'] ?? widget.quote['netFare'] ?? 0)),
                      _MoneyLine('Broget fee (${widget.quote['markupPercent'] ?? ''}% )', inr(money['brogetFee'] ?? widget.quote['markup'] ?? 0)),
                      _MoneyLine('GST on Broget fee', inr(money['gst'] ?? widget.quote['gst'] ?? 0)),
                      const Padding(padding: EdgeInsets.symmetric(vertical: 8), child: Divider(height: 1, color: bookLine)),
                      _MoneyLine('Total payable', inr(widget.amount), strong: true),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Text('Choose payment option', style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 14, color: bookNavy)),
                const SizedBox(height: 4),
                Text(
                  'Select how you want to pay. Broget Pay opens with that checkout.',
                  style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 11.5, color: bookMuted),
                ),
                const SizedBox(height: 10),
                _PayTile(
                  selected: method == PayMethod.upi,
                  icon: Icons.qr_code_2_rounded,
                  title: 'UPI',
                  subtitle: 'GPay, PhonePe, Paytm, BHIM',
                  badge: 'Popular',
                  onTap: () => setState(() => method = PayMethod.upi),
                ),
                const SizedBox(height: 8),
                _PayTile(
                  selected: method == PayMethod.card,
                  icon: Icons.credit_card_rounded,
                  title: 'Credit / Debit Card',
                  subtitle: 'Visa, Mastercard, RuPay',
                  onTap: () => setState(() => method = PayMethod.card),
                ),
                const SizedBox(height: 8),
                _PayTile(
                  selected: method == PayMethod.netbanking,
                  icon: Icons.account_balance_rounded,
                  title: 'Net Banking',
                  subtitle: 'All major Indian banks',
                  onTap: () => setState(() => method = PayMethod.netbanking),
                ),
                const SizedBox(height: 8),
                _PayTile(
                  selected: method == PayMethod.wallet,
                  icon: Icons.account_balance_wallet_rounded,
                  title: 'Wallets',
                  subtitle: 'PhonePe, Amazon Pay, etc.',
                  onTap: () => setState(() => method = PayMethod.wallet),
                ),
                if (note != null) ...[
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF7ED),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFFED7AA)),
                    ),
                    child: Text(note!, style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 12, color: bookNavy, height: 1.35)),
                  ),
                ],
                const SizedBox(height: 10),
                Row(
                  children: [
                    const Icon(Icons.lock_outline_rounded, size: 14, color: bookMuted),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        'Encrypted checkout. Ticket issues only after payment success.',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 11, color: bookMuted),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 12),
            decoration: const BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Color(0x140F172A), blurRadius: 16, offset: Offset(0, -4))],
            ),
            child: SafeArea(
              top: false,
              child: Column(
                children: [
                  if (!widget.demo && waitingGateway)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size.fromHeight(44),
                          foregroundColor: bookNavy,
                          side: const BorderSide(color: bookLine),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: busy ? null : _openGateway,
                        child: Text('Open Broget Pay again', style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
                      ),
                    ),
                  PrimaryCta(label: _ctaLabel, onPressed: busy ? () {} : _submit),
                  if (widget.demo)
                    Padding(
                      padding: const EdgeInsets.only(top: 6),
                      child: Text(
                        'Server pe Broget Pay key nahi hai — demo pay testing ke liye.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 10.5, color: bookMuted),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PayTile extends StatelessWidget {
  const _PayTile({
    required this.selected,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.badge,
  });

  final bool selected;
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final String? badge;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? bookSoftBlue : Colors.white,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: selected ? const Color(0xFF93C5FD) : bookLine, width: selected ? 1.5 : 1),
          ),
          child: Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: selected ? Colors.white : bookField,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: bookLine),
                ),
                child: Icon(icon, color: bookBlueBright, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(title, style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 13.5, color: bookNavy)),
                        ),
                        if (badge != null) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(color: const Color(0xFFFFF4E8), borderRadius: BorderRadius.circular(99)),
                            child: Text(badge!, style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 9, color: bookOrange)),
                          ),
                        ],
                      ],
                    ),
                    Text(subtitle, style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 11, color: bookMuted)),
                  ],
                ),
              ),
              Icon(
                selected ? Icons.radio_button_checked_rounded : Icons.radio_button_off_rounded,
                color: selected ? bookBlueBright : const Color(0xFFB0B8C6),
                size: 22,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MoneyLine extends StatelessWidget {
  const _MoneyLine(this.label, this.value, {this.strong = false});

  final String label;
  final String value;
  final bool strong;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: GoogleFonts.poppins(fontWeight: strong ? FontWeight.w800 : FontWeight.w500, fontSize: 12, color: strong ? bookNavy : bookMuted),
            ),
          ),
          Text(
            value,
            style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 12.5, color: strong ? bookBlueBright : bookNavy),
          ),
        ],
      ),
    );
  }
}
