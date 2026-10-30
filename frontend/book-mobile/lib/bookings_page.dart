import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'airline_logo.dart';
import 'api.dart';
import 'booking_store.dart';
import 'theme.dart';

class BookingsPage extends StatelessWidget {
  const BookingsPage({this.showBack = false, super.key});

  final bool showBack;

  @override
  Widget build(BuildContext context) {
    final canPop = Navigator.of(context).canPop();
    return Scaffold(
      backgroundColor: bookWash,
      appBar: AppBar(
        leading: (showBack || canPop)
            ? IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                onPressed: () {
                  if (canPop) {
                    Navigator.pop(context);
                  }
                },
              )
            : null,
        automaticallyImplyLeading: false,
        title: const Text('My Bookings'),
      ),
      body: AnimatedBuilder(
        animation: BookingStore.instance,
        builder: (context, _) {
          final items = BookingStore.instance.items;
          if (items.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(color: bookSoftBlue, borderRadius: BorderRadius.circular(22)),
                      child: const Icon(Icons.confirmation_number_outlined, color: bookBlueBright, size: 34),
                    ),
                    const SizedBox(height: 18),
                    Text(
                      'No trips yet',
                      style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 18, color: bookNavy),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Book a flight and it will show up here.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(color: bookMuted, fontWeight: FontWeight.w500, height: 1.45, fontSize: 13.5),
                    ),
                  ],
                ),
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            itemCount: items.length,
            separatorBuilder: (_, _) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final b = items[index];
              return Container(
                padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: bookLine),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        AirlineLogo(code: b.airlineCode, name: b.airline, size: 38),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(b.airline, style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 14, color: bookNavy)),
                              Text(b.flightCode, style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 11, color: bookMuted)),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            'Confirmed',
                            style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 10, color: const Color(0xFF059669)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        _City(code: b.fromCode, time: b.depart),
                        Expanded(
                          child: Column(
                            children: [
                              Text(b.duration, style: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.w600, color: bookMuted)),
                              const SizedBox(height: 4),
                              Stack(
                                alignment: Alignment.center,
                                children: [
                                  Container(height: 1, color: bookLine),
                                  const Icon(Icons.flight_rounded, size: 14, color: bookBlueBright),
                                ],
                              ),
                            ],
                          ),
                        ),
                        _City(code: b.toCode, time: b.arrive, end: true),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Text(
                          b.pnr.isEmpty ? b.date : 'PNR ${b.pnr} · ${b.date}',
                          style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 11.5, color: bookMuted),
                        ),
                        const Spacer(),
                        Text(inr(b.total), style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 14, color: bookBlueBright)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton.icon(
                        onPressed: () async {
                          try {
                            await BookApi.instance.saveAndOpenTicketPdf(b);
                          } catch (e) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
                            }
                          }
                        },
                        icon: const Icon(Icons.picture_as_pdf_outlined, size: 18),
                        label: Text('Ticket PDF', style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 12.5)),
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class _City extends StatelessWidget {
  const _City({required this.code, required this.time, this.end = false});

  final String code;
  final String time;
  final bool end;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: end ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        Text(time, style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 16, color: bookNavy)),
        Text(code, style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 12, color: bookMuted)),
      ],
    );
  }
}
