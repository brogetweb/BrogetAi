import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'airline_logo.dart';
import 'api.dart';
import 'data.dart';
import 'flight_detail.dart';
import 'responsive.dart';
import 'theme.dart';

class FlightResultsPage extends StatefulWidget {
  const FlightResultsPage({required this.from, required this.to, required this.date, required this.travellers, required this.cabin, super.key});

  final String from;
  final String to;
  final String date;
  final int travellers;
  final String cabin;

  @override
  State<FlightResultsPage> createState() => _FlightResultsPageState();
}

class _FlightResultsPageState extends State<FlightResultsPage> {
  var nonStop = false;
  var loading = true;
  var live = false;
  String? error;
  List<FlightOffer> rows = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final data = await BookApi.instance.searchFlights(
        origin: widget.from,
        destination: widget.to,
        travelDateIso: toIsoDate(widget.date),
        adults: widget.travellers,
        cabin: cabinCode(widget.cabin),
        guest: true,
      );
      final list = (data['flights'] as List? ?? const [])
          .whereType<Map>()
          .map((row) => FlightOffer.fromApi(Map<String, dynamic>.from(row)))
          .toList();
      if (!mounted) return;
      setState(() {
        rows = list;
        live = true;
        loading = false;
        if (list.isEmpty) error = 'No flights found for this route/date.';
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        loading = false;
        live = false;
        error = e.toString();
        rows = mockFlights(from: codeOf(widget.from), to: codeOf(widget.to));
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final layout = BookLayout.of(context);
    final fromCode = codeOf(widget.from);
    final toCode = codeOf(widget.to);
    final visible = rows.where((flight) => !nonStop || flight.stops == 0).toList();

    return Scaffold(
      backgroundColor: bookWash,
      appBar: AppBar(
        title: Column(
          children: [
            Text('$fromCode → $toCode', style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: layout.isCompact ? 14 : 15, color: bookNavy)),
            Text(
              '${widget.date} · ${widget.travellers} traveller',
              style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 11, color: bookMuted),
            ),
          ],
        ),
        actions: [
          IconButton(onPressed: loading ? null : _load, icon: const Icon(Icons.refresh_rounded)),
        ],
      ),
      body: Column(
        children: [
          if (loading) const LinearProgressIndicator(minHeight: 2, color: bookBlueBright),
          Padding(
            padding: EdgeInsets.fromLTRB(layout.pagePad, 10, layout.pagePad, 4),
            child: Row(
              children: [
                Flexible(
                  child: Text(
                    '${visible.length} flights',
                    style: GoogleFonts.poppins(fontSize: layout.isCompact ? 12 : 12.5, fontWeight: FontWeight.w700, color: bookNavy),
                  ),
                ),
                const SizedBox(width: 8),
                _FilterPill(label: 'Non-stop', selected: nonStop, onTap: () => setState(() => nonStop = !nonStop)),
              ],
            ),
          ),
          Expanded(
            child: loading && rows.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : visible.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Text(
                            error ?? 'No flights found.',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.poppins(color: bookMuted, fontWeight: FontWeight.w600),
                          ),
                        ),
                      )
                    : ListView.separated(
                        physics: const BouncingScrollPhysics(),
                        padding: layout.listInsets,
                        itemCount: visible.length,
                        separatorBuilder: (_, _) => SizedBox(height: layout.sectionGap),
                        itemBuilder: (context, index) {
                          final flight = visible[index];
                          return _FlightRow(
                            flight: flight,
                            onSelect: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => FlightDetailPage(
                                  flight: flight,
                                  date: widget.date,
                                  cabin: widget.cabin,
                                  travellers: widget.travellers,
                                ),
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

class _FilterPill extends StatelessWidget {
  const _FilterPill({required this.label, required this.selected, required this.onTap});

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: selected ? bookSoftBlue : Colors.white,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: selected ? const Color(0xFFB7D0FF) : bookLine),
        ),
        child: Text(
          label,
          style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w700, color: selected ? bookBlueBright : bookNavy),
        ),
      ),
    );
  }
}

class _FlightRow extends StatelessWidget {
  const _FlightRow({required this.flight, required this.onSelect});

  final FlightOffer flight;
  final VoidCallback onSelect;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onSelect,
        borderRadius: BorderRadius.circular(16),
        child: Ink(
          padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: bookLine),
          ),
          child: Column(
            children: [
              Row(
                children: [
                  AirlineLogo(code: flight.logoCode, name: flight.airline, size: 40),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(flight.airline, style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13.5, color: bookNavy)),
                        Text(flight.code, style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 11, color: bookMuted)),
                      ],
                    ),
                  ),
                  Text(inr(flight.price), style: GoogleFonts.poppins(fontWeight: FontWeight.w800, color: bookBlueBright, fontSize: 16)),
                ],
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  _Time(time: flight.depart, code: flight.fromCode),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      child: Column(
                        children: [
                          Text(
                            flight.duration,
                            style: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.w600, color: bookMuted),
                          ),
                          const SizedBox(height: 4),
                          Stack(
                            alignment: Alignment.center,
                            children: [
                              Container(height: 1.2, color: const Color(0xFFD7E0EE)),
                              Container(
                                padding: const EdgeInsets.all(2),
                                color: Colors.white,
                                child: const Icon(Icons.flight_rounded, size: 14, color: bookBlueBright),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            flight.stops == 0 ? 'Non-stop' : '${flight.stops} stop',
                            style: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.w600, color: bookMuted),
                          ),
                        ],
                      ),
                    ),
                  ),
                  _Time(time: flight.arrive, code: flight.toCode, end: true),
                ],
              ),
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerRight,
                child: Text(
                  'Select  ›',
                  style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 12.5, color: bookBlueBright),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Time extends StatelessWidget {
  const _Time({required this.time, required this.code, this.end = false});

  final String time;
  final String code;
  final bool end;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: end ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        Text(time, style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 17, color: bookNavy)),
        Text(code, style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 11.5, color: bookMuted)),
      ],
    );
  }
}
