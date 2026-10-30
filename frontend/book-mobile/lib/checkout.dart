import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'profile.dart';
import 'profile_store.dart';
import 'shell.dart';
import 'theme.dart';
import 'widgets.dart';

/// Simple checkout for buses/hotels (coming soon verticals).
class CheckoutPage extends StatefulWidget {
  const CheckoutPage({
    required this.title,
    required this.subtitle,
    required this.meta,
    required this.base,
    required this.taxes,
    required this.total,
    super.key,
  });

  final String title;
  final String subtitle;
  final String meta;
  final int base;
  final int taxes;
  final int total;

  @override
  State<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends State<CheckoutPage> {
  Future<void> _pay() async {
    final ok = await ensureProfileForBooking(context);
    if (!ok || !mounted) return;
    final profile = ProfileStore.instance.profile!;
    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Text('Request saved', style: GoogleFonts.poppins(fontWeight: FontWeight.w800, color: bookNavy)),
        content: Text(
          'Hi ${profile.firstName}, ${widget.title}\n${inr(widget.total)}\n\nFull booking for this category is coming soon.',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 13.5, color: bookMuted, height: 1.45),
        ),
        actions: [
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.of(context).popUntil((route) => route.isFirst);
              BookShell.openHome();
            },
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bookWash,
      appBar: AppBar(title: const Text('Review')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: bookLine),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(widget.title, style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 15, color: bookNavy)),
                const SizedBox(height: 4),
                Text(widget.subtitle, style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 12, color: bookMuted)),
                const SizedBox(height: 8),
                Text(widget.meta, style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 12.5, color: bookNavy)),
                const SizedBox(height: 16),
                const Divider(height: 1, color: bookLine),
                const SizedBox(height: 12),
                _Line('Base', inr(widget.base)),
                _Line('Taxes', inr(widget.taxes)),
                _Line('Total', inr(widget.total), strong: true),
              ],
            ),
          ),
          const SizedBox(height: 16),
          PrimaryCta(label: 'Pay ${inr(widget.total)}', onPressed: _pay),
        ],
      ),
    );
  }
}

class _Line extends StatelessWidget {
  const _Line(this.label, this.value, {this.strong = false});

  final String label;
  final String value;
  final bool strong;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Expanded(child: Text(label, style: GoogleFonts.poppins(fontWeight: strong ? FontWeight.w800 : FontWeight.w500, fontSize: 12.5, color: strong ? bookNavy : bookMuted))),
          Text(value, style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 12.5, color: strong ? bookBlueBright : bookNavy)),
        ],
      ),
    );
  }
}
