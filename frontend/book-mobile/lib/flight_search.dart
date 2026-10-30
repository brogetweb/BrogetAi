import 'package:flutter/material.dart';

import 'data.dart';
import 'flight_results.dart';
import 'theme.dart';
import 'widgets.dart';

class FlightSearchPage extends StatefulWidget {
  const FlightSearchPage({super.key});

  @override
  State<FlightSearchPage> createState() => _FlightSearchPageState();
}

class _FlightSearchPageState extends State<FlightSearchPage> {
  var trip = 'one';
  var from = 'New Delhi (DEL)';
  var to = 'Mumbai (BOM)';
  var depart = 'Sun, 15 Dec 2026';
  var ret = '20 Dec 2026';
  var travellers = 1;
  var cabin = 'Economy';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Flights'), leading: IconButton(icon: const Icon(Icons.arrow_back_rounded), onPressed: () => Navigator.pop(context))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(14, 6, 14, 20),
        children: [
          SoftCard(
            child: Column(
              children: [
                SegmentTabs(
                  value: trip,
                  onChanged: (value) => setState(() => trip = value),
                  items: const [('one', 'One Way'), ('round', 'Round Trip'), ('multi', 'Multi City')],
                ),
                const SizedBox(height: 12),
                Stack(
                  alignment: Alignment.centerRight,
                  children: [
                    Column(
                      children: [
                        FieldBox(label: 'From', value: from, icon: Icons.flight_takeoff_rounded, onTap: () async {
                          final value = await pickList(context: context, title: 'From', items: cities, labelOf: (item) => item, selected: from);
                          if (value != null) setState(() => from = value);
                        }),
                        const SizedBox(height: 8),
                        FieldBox(label: 'To', value: to, icon: Icons.flight_land_rounded, onTap: () async {
                          final value = await pickList(context: context, title: 'To', items: cities, labelOf: (item) => item, selected: to);
                          if (value != null) setState(() => to = value);
                        }),
                      ],
                    ),
                    Positioned(
                      right: 8,
                      child: Material(
                        color: bookBlue,
                        shape: const CircleBorder(),
                        child: InkWell(
                          customBorder: const CircleBorder(),
                          onTap: () => setState(() {
                            final old = from;
                            from = to;
                            to = old;
                          }),
                          child: const SizedBox(width: 34, height: 34, child: Icon(Icons.swap_vert_rounded, color: Colors.white, size: 18)),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(child: FieldBox(label: 'Departure Date', value: depart, icon: Icons.calendar_month_rounded, onTap: () {})),
                    if (trip == 'round') ...[
                      const SizedBox(width: 8),
                      Expanded(child: FieldBox(label: 'Return Date', value: ret, icon: Icons.calendar_month_rounded, onTap: () {})),
                    ],
                  ],
                ),
                const SizedBox(height: 8),
                FieldBox(
                  label: 'Travellers & Class',
                  value: '$travellers Traveller · $cabin',
                  icon: Icons.airline_seat_recline_normal_rounded,
                  onTap: () async {
                    final nextCabin = await pickList(context: context, title: 'Class', items: const ['Economy', 'Premium economy', 'Business'], labelOf: (item) => item, selected: cabin);
                    if (nextCabin != null) setState(() => cabin = nextCabin);
                    if (!context.mounted) return;
                    final nextCount = await pickList(context: context, title: 'Travellers', items: const [1, 2, 3, 4, 5, 6], labelOf: (item) => '$item Traveller${item > 1 ? 's' : ''}', selected: travellers);
                    if (nextCount != null) setState(() => travellers = nextCount);
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          FilledButton(
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => FlightResultsPage(from: from, to: to, date: depart, travellers: travellers, cabin: cabin)),
            ),
            child: const Text('Search Flights'),
          ),
          const SizedBox(height: 16),
          const Text('Recent Searches', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: bookNavy)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _Recent('DEL → BOM'),
              _Recent('BLR → GOI'),
              _Recent('DEL → DXB'),
            ],
          ),
        ],
      ),
    );
  }
}

class _Recent extends StatelessWidget {
  const _Recent(this.label);

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(999), border: Border.all(color: bookLine)),
      child: Text(label, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 11, color: bookNavy)),
    );
  }
}
