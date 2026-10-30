import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'airline_logo.dart';
import 'api.dart';
import 'booking_store.dart';
import 'data.dart';
import 'passenger.dart';
import 'profile.dart';
import 'profile_store.dart';
import 'shell.dart';
import 'theme.dart';
import 'widgets.dart';

class ReviewPage extends StatefulWidget {
  const ReviewPage({
    required this.flight,
    required this.date,
    required this.cabin,
    required this.travellers,
    required this.base,
    required this.taxes,
    required this.total,
    required this.passengers,
    super.key,
  });

  final FlightOffer flight;
  final String date;
  final String cabin;
  final int travellers;
  final int base;
  final int taxes;
  final int total;
  final List<Passenger> passengers;

  @override
  State<ReviewPage> createState() => _ReviewPageState();
}

class _ReviewPageState extends State<ReviewPage> {
  var pay = 'upi';
  var paying = false;

  Future<void> _pay() async {
    final ok = await ensureProfileForBooking(context);
    if (!ok || !mounted) return;

    setState(() => paying = true);
    final profile = ProfileStore.instance.profile!;
    final flight = widget.flight;
    final lead = widget.passengers.isNotEmpty ? widget.passengers.first : null;
    final bookingId = 'BK${DateTime.now().millisecondsSinceEpoch}';
    final digits = bookingId.replaceAll(RegExp(r'\D'), '');
    final pnr = 'BG${digits.length <= 6 ? digits : digits.substring(digits.length - 6)}';
    final booking = BookBooking(
      id: bookingId,
      pnr: pnr,
      airline: flight.airline,
      airlineCode: flight.logoCode,
      flightCode: flight.code,
      fromCode: flight.fromCode,
      toCode: flight.toCode,
      date: widget.date,
      depart: flight.depart,
      arrive: flight.arrive,
      duration: flight.duration,
      total: widget.total,
      travellerName: lead?.fullName.isNotEmpty == true ? '${lead!.title} ${lead.fullName}'.trim() : profile.fullName,
      email: lead?.email.isNotEmpty == true ? lead!.email : profile.email,
      phone: lead?.phone.isNotEmpty == true ? lead!.phone : profile.phone,
      cabin: widget.cabin,
      createdAt: DateTime.now(),
    );

    await BookingStore.instance.add(booking);

    String? pdfError;
    try {
      await BookApi.instance.saveAndOpenTicketPdf(booking);
    } catch (e) {
      pdfError = '$e';
    }

    if (!mounted) return;
    setState(() => paying = false);

    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Text('Booking confirmed', style: GoogleFonts.poppins(fontWeight: FontWeight.w800, color: bookNavy)),
        content: Text(
          'Hi ${profile.firstName}, PNR $pnr\n${flight.fromCode} → ${flight.toCode}\n${inr(widget.total)}\n\n'
          '${pdfError == null ? 'E-ticket PDF opened.' : 'PDF later from My Bookings.\n$pdfError'}\n\n'
          'Note: AO Pay does not auto-send email/SMS to customer from API — ticket PDF is from Broget.',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 13, color: bookMuted, height: 1.45),
        ),
        actions: [
          TextButton(
            onPressed: () async {
              try {
                await BookApi.instance.saveAndOpenTicketPdf(booking);
              } catch (_) {}
            },
            child: const Text('Open ticket PDF'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(minimumSize: const Size(0, 42), padding: const EdgeInsets.symmetric(horizontal: 18)),
            onPressed: () {
              Navigator.pop(context);
              Navigator.of(context).popUntil((route) => route.isFirst);
              BookShell.openBookings();
            },
            child: const Text('My Bookings'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final profile = ProfileStore.instance.profile;
    final flight = widget.flight;

    return Scaffold(
      backgroundColor: bookWash,
      appBar: AppBar(title: const Text('Review & pay')),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
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
                      Row(
                        children: [
                          AirlineLogo(code: flight.logoCode, name: flight.airline, size: 42),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(flight.airline, style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 15, color: bookNavy)),
                                Text(
                                  '${flight.fromCode} → ${flight.toCode} · ${widget.date}',
                                  style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 12, color: bookMuted),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Text(
                        '${flight.depart} – ${flight.arrive} · ${flight.duration}',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13, color: bookNavy),
                      ),
                      const SizedBox(height: 16),
                      const Divider(height: 1, color: bookLine),
                      const SizedBox(height: 14),
                      Text(
                        'Passengers (${widget.passengers.length})',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13, color: bookNavy),
                      ),
                      const SizedBox(height: 8),
                      for (var i = 0; i < widget.passengers.length; i++) ...[
                        if (i > 0) const SizedBox(height: 8),
                        Text(
                          '${widget.passengers[i].title} ${widget.passengers[i].fullName}',
                          style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13.5, color: bookNavy),
                        ),
                        Text(
                          '${widget.passengers[i].typeLabel} · DOB ${formatDob(widget.passengers[i].dob)}'
                          '${i == 0 && widget.passengers[i].phone.isNotEmpty ? ' · ${widget.passengers[i].phone}' : ''}',
                          style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 11.5, color: bookMuted),
                        ),
                      ],
                      if (widget.passengers.isEmpty && profile != null) ...[
                        Text(profile.fullName, style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 14, color: bookNavy)),
                        Text(profile.phone, style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 12, color: bookMuted)),
                      ],
                      const SizedBox(height: 16),
                      const Divider(height: 1, color: bookLine),
                      const SizedBox(height: 14),
                      Text('Fare', style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13, color: bookNavy)),
                      const SizedBox(height: 8),
                      _Line('Base fare', inr(widget.base)),
                      _Line('Taxes & fees', inr(widget.taxes)),
                      _Line('Total', inr(widget.total), strong: true),
                      const SizedBox(height: 16),
                      const Divider(height: 1, color: bookLine),
                      const SizedBox(height: 14),
                      Text('Payment', style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13, color: bookNavy)),
                      const SizedBox(height: 4),
                      _PayOption(label: 'UPI', value: 'upi', group: pay, onChanged: (v) => setState(() => pay = v)),
                      _PayOption(label: 'Card', value: 'card', group: pay, onChanged: (v) => setState(() => pay = v)),
                      _PayOption(label: 'Net banking', value: 'net', group: pay, onChanged: (v) => setState(() => pay = v)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            decoration: const BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Color(0x100F172A), blurRadius: 16, offset: Offset(0, -4))],
            ),
            child: SafeArea(
              top: false,
              child: Column(
                children: [
                  PrimaryCta(label: paying ? 'Please wait...' : 'Pay ${inr(widget.total)}', onPressed: paying ? () {} : _pay),
                  const SizedBox(height: 8),
                  Text(
                    'Secured checkout · Razorpay soon',
                    style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 11, color: bookMuted),
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

class _PayOption extends StatelessWidget {
  const _PayOption({required this.label, required this.value, required this.group, required this.onChanged});

  final String label;
  final String value;
  final String group;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    final on = group == value;
    return InkWell(
      onTap: () => onChanged(value),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            Icon(on ? Icons.radio_button_checked : Icons.radio_button_off, color: on ? bookBlueBright : const Color(0xFFB0B8C6), size: 20),
            const SizedBox(width: 10),
            Text(label, style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 13.5, color: bookNavy)),
          ],
        ),
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
          Expanded(
            child: Text(
              label,
              style: GoogleFonts.poppins(fontWeight: strong ? FontWeight.w800 : FontWeight.w500, fontSize: 12.5, color: strong ? bookNavy : bookMuted),
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
