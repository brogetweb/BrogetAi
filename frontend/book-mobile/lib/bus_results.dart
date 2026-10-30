import 'package:flutter/material.dart';

import 'checkout.dart';
import 'data.dart';
import 'theme.dart';
import 'widgets.dart';

class BusResultsPage extends StatefulWidget {
  const BusResultsPage({required this.from, required this.to, required this.date, super.key});

  final String from;
  final String to;
  final String date;

  @override
  State<BusResultsPage> createState() => _BusResultsPageState();
}

class _BusResultsPageState extends State<BusResultsPage> {
  var acOnly = false;
  var sleeperOnly = false;

  @override
  Widget build(BuildContext context) {
    final rows = mockBuses().where((bus) {
      if (acOnly && !bus.type.toLowerCase().contains('ac')) return false;
      if (sleeperOnly && !bus.type.toLowerCase().contains('sleeper')) return false;
      return true;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: Column(
          children: [
            Text('${widget.from} → ${widget.to}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: bookNavy)),
            Text(widget.date, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 11, color: bookMuted)),
          ],
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 4, 14, 6),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  const ChipFilter(label: 'Filter'),
                  const ChipFilter(label: 'Sort'),
                  ChipFilter(label: 'AC', selected: acOnly, onTap: () => setState(() => acOnly = !acOnly)),
                  ChipFilter(label: 'Sleeper', selected: sleeperOnly, onTap: () => setState(() => sleeperOnly = !sleeperOnly)),
                ],
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 16),
              itemCount: rows.length,
              itemBuilder: (context, index) {
                final bus = rows[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: SoftCard(
                    child: Column(
                      children: [
                        Row(
                          children: [
                            CircleAvatar(radius: 15, backgroundColor: const Color(0xFFFFF1E8), child: Text(bus.operatorName[0], style: const TextStyle(fontWeight: FontWeight.w800, color: bookBus, fontSize: 12))),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(bus.operatorName, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: bookNavy)),
                                  Text(bus.type, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 11, color: bookMuted)),
                                ],
                              ),
                            ),
                            Text(inr(bus.price), style: const TextStyle(fontWeight: FontWeight.w800, color: bookBus, fontSize: 15)),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Text(bus.depart, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: bookNavy)),
                            Expanded(child: Center(child: Text(bus.duration, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: bookMuted)))),
                            Text(bus.arrive, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: bookNavy)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Text('${bus.seats} seats left', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: bookMuted)),
                            const Spacer(),
                            FilledButton(
                              style: FilledButton.styleFrom(backgroundColor: bookBus, minimumSize: const Size(96, 34), padding: const EdgeInsets.symmetric(horizontal: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                              onPressed: () {
                                final taxes = (bus.price * 0.05).round();
                                Navigator.push(context, MaterialPageRoute(builder: (_) => CheckoutPage(
                                      title: '${bus.operatorName} · ${bus.type}',
                                      subtitle: '${widget.from} → ${widget.to} · ${widget.date}',
                                      meta: '${bus.depart} – ${bus.arrive} · ${bus.duration}',
                                      base: bus.price,
                                      taxes: taxes,
                                      total: bus.price + taxes,
                                    )));
                              },
                              child: const Text('Select', style: TextStyle(fontSize: 12)),
                            ),
                          ],
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
