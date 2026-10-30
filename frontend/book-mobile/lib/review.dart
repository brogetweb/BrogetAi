import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'airline_logo.dart';
import 'api.dart';
import 'booking_store.dart';
import 'data.dart';
import 'passenger.dart';
import 'payment_page.dart';
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
    this.sector = 'domestic',
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
  final String sector;

  @override
  State<ReviewPage> createState() => _ReviewPageState();
}

class _ReviewPageState extends State<ReviewPage> {
  var paying = false;
  Map<String, dynamic>? quote;
  String? quoteError;

  @override
  void initState() {
    super.initState();
    _loadQuote();
  }

  Future<void> _loadQuote() async {
    try {
      final data = await BookApi.instance.quoteFlight(netFare: widget.total.toDouble(), sector: widget.sector);
      if (!mounted) return;
      setState(() {
        quote = data;
        quoteError = null;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => quoteError = '$e');
    }
  }

  double get payTotal {
    final raw = quote?['total'];
    if (raw is num) return raw.toDouble();
    return widget.total.toDouble();
  }

  Future<void> _pay() async {
    final ok = await ensureProfileForBooking(context);
    if (!ok || !mounted) return;
    if (quote == null) {
      showBookToast(context, quoteError ?? 'Price not ready. Pull to refresh.', kind: BookToastKind.error);
      await _loadQuote();
      return;
    }

    setState(() => paying = true);
    final profile = ProfileStore.instance.profile!;
    final flight = widget.flight;
    final lead = widget.passengers.isNotEmpty ? widget.passengers.first : null;

    try {
      final checkout = await BookApi.instance.createFlightCheckout(
        netFare: widget.total.toDouble(),
        sector: widget.sector,
        flight: {
          'id': flight.id,
          'airline': flight.airline,
          'airlineCode': flight.logoCode,
          'flightCode': flight.code,
          'fromCode': flight.fromCode,
          'toCode': flight.toCode,
          'date': widget.date,
          'depart': flight.depart,
          'arrive': flight.arrive,
          'duration': flight.duration,
          'cabin': widget.cabin,
        },
        passengers: [
          for (final p in widget.passengers)
            {
              'fullName': p.fullName,
              'title': p.title,
              if (p.email.isNotEmpty) 'email': p.email,
              if (p.phone.isNotEmpty) 'phone': digitsPhone(p.phone),
            },
        ],
        payMobile: lead?.phone.isNotEmpty == true ? lead!.phone : profile.phone,
      );

      if (!mounted) return;
      final requestId = '${checkout['requestId'] ?? ''}';
      final demo = checkout['demo'] == true;
      final paymentUrl = '${checkout['paymentUrl'] ?? ''}';
      final checkoutUrl = '${checkout['checkoutUrl'] ?? ''}';

      final paid = await Navigator.of(context).push<bool>(
        MaterialPageRoute(
          fullscreenDialog: true,
          builder: (_) => FlightPaymentPage(
            amount: payTotal,
            quote: quote!,
            demo: demo,
            paymentUrl: paymentUrl,
            checkoutUrl: checkoutUrl,
            requestId: requestId,
            routeLabel: '${flight.fromCode} → ${flight.toCode}',
            airline: flight.airline,
          ),
        ),
      );

      if (paid != true || !mounted) {
        if (mounted) setState(() => paying = false);
        if (paid == false && mounted) {
          showBookToast(context, 'Payment cancelled', kind: BookToastKind.info);
        }
        return;
      }

      final order = await BookApi.instance.flightOrderStatus(requestId);
      final pnr = '${order['pnr'] ?? ''}'.isNotEmpty
          ? '${order['pnr']}'
          : 'BG${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
      final booking = BookBooking(
        id: requestId,
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
        total: payTotal.round(),
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
      showBookToast(context, 'Ticket confirmed · PNR $pnr', kind: BookToastKind.success);

      await showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          title: Text('Booking confirmed', style: GoogleFonts.poppins(fontWeight: FontWeight.w800, color: bookNavy)),
          content: Text(
            'Hi ${profile.firstName}, PNR $pnr\n${flight.fromCode} → ${flight.toCode}\n${inr(payTotal)}\n\n'
            '${pdfError == null ? 'E-ticket PDF opened.' : 'PDF later from My Bookings.'}\n\n'
            'Ticket stays in the app. Email/SMS from Broget will follow (AO Pay does not auto-mail customers).',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 13, color: bookMuted, height: 1.45),
          ),
          actions: [
            FilledButton(
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
    } catch (e) {
      if (!mounted) return;
      setState(() => paying = false);
      showBookToast(context, '$e', kind: BookToastKind.error);
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = ProfileStore.instance.profile;
    final flight = widget.flight;
    final markupPct = quote?['markupPercent'] ?? (widget.sector == 'international' ? 7 : 4);
    final net = (quote?['netFare'] as num?)?.toDouble() ?? widget.total.toDouble();
    final markup = (quote?['markup'] as num?)?.toDouble() ?? 0;
    final gst = (quote?['gst'] as num?)?.toDouble() ?? 0;

    return Scaffold(
      backgroundColor: bookWash,
      appBar: AppBar(title: const Text('Review & pay')),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(14, 8, 14, 14),
              children: [
                SoftCard(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          AirlineLogo(code: flight.logoCode, name: flight.airline, size: 40),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(flight.airline, style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 14.5, color: bookNavy)),
                                Text(
                                  '${flight.fromCode} → ${flight.toCode} · ${widget.date}',
                                  style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 11.5, color: bookMuted),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(color: bookSoftBlue, borderRadius: BorderRadius.circular(99)),
                            child: Text(
                              widget.sector == 'international' ? 'INTL' : 'DOM',
                              style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 10, color: bookBlueBright),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        '${flight.depart} – ${flight.arrive} · ${flight.duration}',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 12.5, color: bookNavy),
                      ),
                      const SizedBox(height: 12),
                      const Divider(height: 1, color: bookLine),
                      const SizedBox(height: 10),
                      Text('Passengers (${widget.passengers.length})', style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 12.5, color: bookNavy)),
                      const SizedBox(height: 6),
                      for (var i = 0; i < widget.passengers.length; i++) ...[
                        if (i > 0) const SizedBox(height: 6),
                        Text(
                          '${widget.passengers[i].title} ${widget.passengers[i].fullName}',
                          style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13, color: bookNavy),
                        ),
                        Text(
                          widget.passengers[i].typeLabel,
                          style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 11, color: bookMuted),
                        ),
                      ],
                      if (widget.passengers.isEmpty && profile != null)
                        Text(profile.fullName, style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13, color: bookNavy)),
                      const SizedBox(height: 12),
                      const Divider(height: 1, color: bookLine),
                      const SizedBox(height: 10),
                      Text('Price break-up', style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 12.5, color: bookNavy)),
                      const SizedBox(height: 6),
                      _Line('Airline net (AO Pay wallet)', inr(net)),
                      _Line('Broget fee ($markupPct%)', inr(markup)),
                      _Line('GST on Broget fee (18%)', inr(gst)),
                      _Line('You pay', inr(payTotal), strong: true),
                      if (quoteError != null) ...[
                        const SizedBox(height: 8),
                        Text(quoteError!, style: GoogleFonts.poppins(fontSize: 11, color: const Color(0xFFDC2626), fontWeight: FontWeight.w600)),
                      ],
                      const SizedBox(height: 8),
                      Text(
                        'After pay: net fare → AO Pay wallet · Broget fee+GST → Broget.',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 10.5, color: bookMuted, height: 1.35),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                SoftCard(
                  padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(color: bookSoftBlue, borderRadius: BorderRadius.circular(12)),
                        child: const Icon(Icons.payments_rounded, color: bookBlueBright, size: 22),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Next: choose payment', style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 13, color: bookNavy)),
                            Text(
                              'UPI · Card · Net banking · Wallets',
                              style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 11, color: bookMuted),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 12),
            decoration: const BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Color(0x100F172A), blurRadius: 16, offset: Offset(0, -4))],
            ),
            child: SafeArea(
              top: false,
              child: Column(
                children: [
                  PrimaryCta(
                    label: paying ? 'Opening payment...' : 'Continue to payment · ${inr(payTotal)}',
                    onPressed: paying ? () {} : _pay,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Pick UPI / Card / NetBanking on next screen',
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
              style: GoogleFonts.poppins(fontWeight: strong ? FontWeight.w800 : FontWeight.w500, fontSize: 12, color: strong ? bookNavy : bookMuted),
            ),
          ),
          Text(
            value,
            style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 12, color: strong ? bookBlueBright : bookNavy),
          ),
        ],
      ),
    );
  }
}
