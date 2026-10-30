import 'package:flutter/material.dart';

import 'bus_results.dart';
import 'data.dart';
import 'theme.dart';
import 'widgets.dart';

class BusSearchPage extends StatefulWidget {
  const BusSearchPage({super.key});

  @override
  State<BusSearchPage> createState() => _BusSearchPageState();
}

class _BusSearchPageState extends State<BusSearchPage> {
  var trip = 'one';
  var from = 'Delhi';
  var to = 'Jaipur';
  var date = '15 Dec 2026';
  var passengers = 1;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Buses')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(14, 6, 14, 20),
        children: [
          SoftCard(
            child: Column(
              children: [
                SegmentTabs(value: trip, onChanged: (value) => setState(() => trip = value), items: const [('one', 'One Way'), ('round', 'Round Trip')]),
                const SizedBox(height: 12),
                FieldBox(label: 'From', value: from, icon: Icons.trip_origin, onTap: () async {
                  final value = await pickList(context: context, title: 'From', items: busCities, labelOf: (item) => item, selected: from);
                  if (value != null) setState(() => from = value);
                }),
                const SizedBox(height: 8),
                FieldBox(label: 'To', value: to, icon: Icons.location_on_outlined, onTap: () async {
                  final value = await pickList(context: context, title: 'To', items: busCities, labelOf: (item) => item, selected: to);
                  if (value != null) setState(() => to = value);
                }),
                const SizedBox(height: 8),
                FieldBox(label: 'Journey Date', value: date, icon: Icons.calendar_month_rounded, onTap: () {}),
                const SizedBox(height: 8),
                FieldBox(
                  label: 'Passengers',
                  value: '$passengers Passenger${passengers > 1 ? 's' : ''}',
                  icon: Icons.person_outline_rounded,
                  onTap: () async {
                    final value = await pickList(context: context, title: 'Passengers', items: const [1, 2, 3, 4, 5, 6], labelOf: (item) => '$item', selected: passengers);
                    if (value != null) setState(() => passengers = value);
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          FilledButton(
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => BusResultsPage(from: from, to: to, date: date))),
            child: const Text('Search Buses'),
          ),
          const SizedBox(height: 16),
          const Text('Popular Routes', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: bookNavy)),
          const SizedBox(height: 8),
          SoftCard(
            padding: EdgeInsets.zero,
            child: Column(
              children: const [
                _Route(title: 'Delhi → Jaipur', price: 'From ₹499'),
                Divider(height: 1, color: bookLine),
                _Route(title: 'Delhi → Agra', price: 'From ₹399'),
                Divider(height: 1, color: bookLine),
                _Route(title: 'Delhi → Manali', price: 'From ₹899'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Route extends StatelessWidget {
  const _Route({required this.title, required this.price});

  final String title;
  final String price;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      dense: true,
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: bookNavy)),
      trailing: Text(price, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: bookBus)),
    );
  }
}
