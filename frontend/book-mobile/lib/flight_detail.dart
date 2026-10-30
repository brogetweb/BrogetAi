import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'airline_logo.dart';
import 'data.dart';
import 'passenger_form.dart';
import 'profile.dart';
import 'theme.dart';
import 'widgets.dart';

class FlightDetailPage extends StatelessWidget {
  const FlightDetailPage({required this.flight, required this.date, required this.cabin, required this.travellers, super.key});

  final FlightOffer flight;
  final String date;
  final String cabin;
  final int travellers;

  @override
  Widget build(BuildContext context) {
    final taxes = flight.taxes > 0 ? flight.taxes : (flight.price * 0.12).round();
    final base = flight.baseFare > 0 ? flight.baseFare : flight.price - taxes;
    final total = flight.price > 0 ? flight.price : base + taxes;

    return Scaffold(
      backgroundColor: bookWash,
      appBar: AppBar(title: const Text('Flight details')),
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
                          AirlineLogo(code: flight.logoCode, name: flight.airline, size: 48),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(flight.airline, style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 16, color: bookNavy)),
                                Text(flight.code, style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 12, color: bookMuted)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '$date · $cabin · $travellers traveller',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 12, color: bookMuted),
                      ),
                      const SizedBox(height: 18),
                      Row(
                        children: [
                          _Leg(time: flight.depart, code: flight.fromCode),
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              child: Column(
                                children: [
                                  Text(flight.duration, style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w600, color: bookMuted)),
                                  const SizedBox(height: 6),
                                  Stack(
                                    alignment: Alignment.center,
                                    children: [
                                      Container(height: 1.2, color: const Color(0xFFD7E0EE)),
                                      Container(
                                        padding: const EdgeInsets.all(3),
                                        color: Colors.white,
                                        child: const Icon(Icons.flight_rounded, size: 16, color: bookBlueBright),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    flight.stops == 0 ? 'Non-stop' : '${flight.stops} stop',
                                    style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w600, color: bookMuted),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          _Leg(time: flight.arrive, code: flight.toCode, end: true),
                        ],
                      ),
                      const SizedBox(height: 18),
                      const Divider(height: 1, color: bookLine),
                      const SizedBox(height: 14),
                      Text('Baggage', style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13, color: bookNavy)),
                      const SizedBox(height: 10),
                      _Meta(Icons.work_outline_rounded, 'Cabin', flight.cabinBaggage),
                      const SizedBox(height: 8),
                      _Meta(Icons.luggage_outlined, 'Check-in', flight.checkInBaggage),
                      const SizedBox(height: 8),
                      _Meta(Icons.verified_outlined, 'Fare', flight.refundable ? 'Refundable' : 'Non-refundable'),
                      const SizedBox(height: 18),
                      const Divider(height: 1, color: bookLine),
                      const SizedBox(height: 14),
                      Text('Fare', style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13, color: bookNavy)),
                      const SizedBox(height: 10),
                      _FareLine('Base fare', inr(base)),
                      _FareLine('Taxes & fees', inr(taxes)),
                      const SizedBox(height: 6),
                      _FareLine('Total', inr(total), strong: true),
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
              child: Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Total', style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w600, color: bookMuted)),
                      Text(inr(total), style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w800, color: bookNavy)),
                    ],
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: PrimaryCta(
                      label: 'Continue',
                      onPressed: () async {
                        final ok = await ensureProfileForBooking(context);
                        if (!ok || !context.mounted) return;
                        await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => PassengerFormPage(
                              flight: flight,
                              date: date,
                              cabin: cabin,
                              travellers: travellers,
                              base: base,
                              taxes: taxes,
                              total: total,
                            ),
                          ),
                        );
                      },
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

class _Leg extends StatelessWidget {
  const _Leg({required this.time, required this.code, this.end = false});

  final String time;
  final String code;
  final bool end;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: end ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        Text(time, style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 20, color: bookNavy)),
        Text(code, style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 12, color: bookMuted)),
      ],
    );
  }
}

class _Meta extends StatelessWidget {
  const _Meta(this.icon, this.label, this.value);

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: bookBlueBright),
        const SizedBox(width: 10),
        Text(label, style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 12.5, color: bookMuted)),
        const Spacer(),
        Text(value, style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 12.5, color: bookNavy)),
      ],
    );
  }
}

class _FareLine extends StatelessWidget {
  const _FareLine(this.label, this.value, {this.strong = false});

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
              style: GoogleFonts.poppins(
                fontWeight: strong ? FontWeight.w800 : FontWeight.w500,
                fontSize: strong ? 13.5 : 12.5,
                color: strong ? bookNavy : bookMuted,
              ),
            ),
          ),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontWeight: FontWeight.w800,
              fontSize: strong ? 14 : 12.5,
              color: strong ? bookBlueBright : bookNavy,
            ),
          ),
        ],
      ),
    );
  }
}
