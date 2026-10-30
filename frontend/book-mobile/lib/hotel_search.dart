import 'package:flutter/material.dart';

import 'data.dart';
import 'hotel_results.dart';
import 'theme.dart';
import 'widgets.dart';

class HotelSearchPage extends StatefulWidget {
  const HotelSearchPage({super.key});

  @override
  State<HotelSearchPage> createState() => _HotelSearchPageState();
}

class _HotelSearchPageState extends State<HotelSearchPage> {
  var city = 'Goa';
  var checkIn = '15 Dec 2026';
  var checkOut = '18 Dec 2026';
  var rooms = '1 Room, 2 Adults';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Hotels')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(14, 6, 14, 20),
        children: [
          SoftCard(
            child: Column(
              children: [
                FieldBox(label: 'Location / City', value: city, icon: Icons.search_rounded, onTap: () async {
                  final value = await pickList(context: context, title: 'City', items: hotelCities, labelOf: (item) => item, selected: city);
                  if (value != null) setState(() => city = value);
                }),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(child: FieldBox(label: 'Check-in Date', value: checkIn, icon: Icons.calendar_month_rounded, onTap: () {})),
                    const SizedBox(width: 8),
                    Expanded(child: FieldBox(label: 'Check-out Date', value: checkOut, icon: Icons.calendar_month_rounded, onTap: () {})),
                  ],
                ),
                const SizedBox(height: 8),
                FieldBox(label: 'Rooms & Guests', value: rooms, icon: Icons.meeting_room_outlined, onTap: () async {
                  final value = await pickList(
                    context: context,
                    title: 'Rooms & Guests',
                    items: const ['1 Room, 1 Adult', '1 Room, 2 Adults', '2 Rooms, 3 Adults', '2 Rooms, 4 Adults'],
                    labelOf: (item) => item,
                    selected: rooms,
                  );
                  if (value != null) setState(() => rooms = value);
                }),
              ],
            ),
          ),
          const SizedBox(height: 14),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: bookHotel),
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => HotelResultsPage(city: city, checkIn: checkIn, checkOut: checkOut))),
            child: const Text('Search Hotels'),
          ),
          const SizedBox(height: 16),
          const Text('Popular Destinations', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: bookNavy)),
          const SizedBox(height: 8),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 3,
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            childAspectRatio: 0.82,
            children: const [
              _Dest(title: 'Goa', price: 'From ₹2,499', color: Color(0xFF14B8A6)),
              _Dest(title: 'Manali', price: 'From ₹1,899', color: Color(0xFF0EA5E9)),
              _Dest(title: 'Dubai', price: 'From ₹6,499', color: Color(0xFFF59E0B)),
            ],
          ),
        ],
      ),
    );
  }
}

class _Dest extends StatelessWidget {
  const _Dest({required this.title, required this.price, required this.color});

  final String title;
  final String price;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: bookLine)),
      child: Column(
        children: [
          Expanded(child: Container(decoration: BoxDecoration(color: color.withValues(alpha: 0.18), borderRadius: const BorderRadius.vertical(top: Radius.circular(14))), child: Icon(Icons.location_city_rounded, color: color))),
          Padding(
            padding: const EdgeInsets.fromLTRB(6, 6, 6, 8),
            child: Column(
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: bookNavy)),
                Text(price, style: TextStyle(fontWeight: FontWeight.w700, fontSize: 10, color: color)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
