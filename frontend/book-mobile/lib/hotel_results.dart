import 'package:flutter/material.dart';

import 'checkout.dart';
import 'data.dart';
import 'theme.dart';
import 'widgets.dart';

class HotelResultsPage extends StatelessWidget {
  const HotelResultsPage({required this.city, required this.checkIn, required this.checkOut, super.key});

  final String city;
  final String checkIn;
  final String checkOut;

  Color _tone(ColorTone tone) {
    return switch (tone) {
      ColorTone.teal => const Color(0xFF14B8A6),
      ColorTone.sand => const Color(0xFFF59E0B),
      ColorTone.blue => const Color(0xFF0EA5E9),
      ColorTone.rose => const Color(0xFFF43F5E),
    };
  }

  @override
  Widget build(BuildContext context) {
    final rows = mockHotels();
    return Scaffold(
      appBar: AppBar(
        title: Column(
          children: [
            Text(city, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: bookNavy)),
            Text('$checkIn – $checkOut', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 11, color: bookMuted)),
          ],
        ),
      ),
      body: Column(
        children: [
          const Padding(
            padding: EdgeInsets.fromLTRB(14, 4, 14, 6),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(children: [ChipFilter(label: 'Filter'), ChipFilter(label: 'Sort'), ChipFilter(label: 'Price'), ChipFilter(label: 'Rating')]),
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 16),
              itemCount: rows.length,
              itemBuilder: (context, index) {
                final hotel = rows[index];
                final color = _tone(hotel.tone);
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: SoftCard(
                    padding: EdgeInsets.zero,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          height: 110,
                          width: double.infinity,
                          decoration: BoxDecoration(color: color.withValues(alpha: 0.18), borderRadius: const BorderRadius.vertical(top: Radius.circular(14))),
                          child: Icon(Icons.apartment_rounded, size: 42, color: color),
                        ),
                        Padding(
                          padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(child: Text(hotel.name, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: bookNavy))),
                                  Icon(Icons.star_rounded, size: 14, color: color),
                                  Text('${hotel.rating}', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: color)),
                                ],
                              ),
                              Text(hotel.place, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 11, color: bookMuted)),
                              const SizedBox(height: 6),
                              Wrap(
                                spacing: 6,
                                children: hotel.amenities
                                    .map((item) => Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                                          decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(999), border: Border.all(color: bookLine)),
                                          child: Text(item, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: bookMuted)),
                                        ))
                                    .toList(),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Text('${inr(hotel.price)} / night', style: TextStyle(fontWeight: FontWeight.w800, color: color, fontSize: 14)),
                                  const Spacer(),
                                  FilledButton(
                                    style: FilledButton.styleFrom(backgroundColor: bookHotel, minimumSize: const Size(96, 34), padding: const EdgeInsets.symmetric(horizontal: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                                    onPressed: () {
                                      final taxes = (hotel.price * 0.12).round();
                                      Navigator.push(context, MaterialPageRoute(builder: (_) => CheckoutPage(
                                            title: hotel.name,
                                            subtitle: '${hotel.place} · $checkIn – $checkOut',
                                            meta: hotel.amenities.join(' · '),
                                            base: hotel.price,
                                            taxes: taxes,
                                            total: hotel.price + taxes,
                                          )));
                                    },
                                    child: const Text('Select', style: TextStyle(fontSize: 12)),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
