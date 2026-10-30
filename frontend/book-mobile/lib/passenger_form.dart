import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import 'data.dart';
import 'passenger.dart';
import 'profile_store.dart';
import 'responsive.dart';
import 'review.dart';
import 'theme.dart';
import 'widgets.dart';

class PassengerFormPage extends StatefulWidget {
  const PassengerFormPage({
    required this.flight,
    required this.date,
    required this.cabin,
    required this.travellers,
    required this.base,
    required this.taxes,
    required this.total,
    super.key,
  });

  final FlightOffer flight;
  final String date;
  final String cabin;
  final int travellers;
  final int base;
  final int taxes;
  final int total;

  @override
  State<PassengerFormPage> createState() => _PassengerFormPageState();
}

class _PassengerFormPageState extends State<PassengerFormPage> {
  final formKey = GlobalKey<FormState>();
  late final List<Passenger> passengers;
  late final bool international;

  @override
  void initState() {
    super.initState();
    international = isInternationalRoute(widget.flight.fromCode, widget.flight.toCode);
    final profile = ProfileStore.instance.profile;
    final count = widget.travellers.clamp(1, 9);
    passengers = List.generate(count, (index) {
      if (index == 0 && profile != null) return Passenger.fromProfile(profile);
      return Passenger();
    });
  }

  Future<void> _pickDob(int index) async {
    final pax = passengers[index];
    final now = DateTime.now();
    DateTime first;
    DateTime last;
    DateTime initial;
    switch (pax.type) {
      case PassengerType.adult:
        first = DateTime(now.year - 100);
        last = DateTime(now.year - 12, now.month, now.day);
        initial = pax.dob ?? DateTime(now.year - 25);
        break;
      case PassengerType.child:
        first = DateTime(now.year - 12, now.month, now.day);
        last = DateTime(now.year - 2, now.month, now.day);
        initial = pax.dob ?? DateTime(now.year - 6);
        break;
      case PassengerType.infant:
        first = DateTime(now.year - 2, now.month, now.day);
        last = now;
        initial = pax.dob ?? DateTime(now.year - 1);
        break;
    }
    if (initial.isBefore(first)) initial = first;
    if (initial.isAfter(last)) initial = last;

    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: first,
      lastDate: last,
      helpText: 'Date of birth',
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(primary: bookBlueBright, onPrimary: Colors.white, surface: Colors.white, onSurface: bookNavy),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => passengers[index].dob = picked);
  }

  Future<void> _pickPassportExpiry(int index) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: passengers[index].passportExpiry ?? now.add(const Duration(days: 365)),
      firstDate: now,
      lastDate: DateTime(now.year + 20),
      helpText: 'Passport expiry',
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(primary: bookBlueBright, onPrimary: Colors.white, surface: Colors.white, onSurface: bookNavy),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => passengers[index].passportExpiry = picked);
  }

  void _continue() {
    if (!(formKey.currentState?.validate() ?? false)) return;

    for (var i = 0; i < passengers.length; i++) {
      final p = passengers[i];
      if (p.dob == null) {
        showBookToast(context, 'Add date of birth for passenger ${i + 1}', kind: BookToastKind.error);
        return;
      }
      if (international) {
        if (p.passportNumber.trim().length < 6) {
          showBookToast(context, 'Passport number required for passenger ${i + 1}', kind: BookToastKind.error);
          return;
        }
        if (p.passportExpiry == null) {
          showBookToast(context, 'Passport expiry required for passenger ${i + 1}', kind: BookToastKind.error);
          return;
        }
      }
    }

    // Contact must exist on first adult
    final lead = passengers.first;
    if (!lead.email.contains('@') || lead.phone.replaceAll(RegExp(r'\D'), '').length < 10) {
      showBookToast(context, 'Lead passenger needs valid email and 10-digit mobile', kind: BookToastKind.error);
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ReviewPage(
          flight: widget.flight,
          date: widget.date,
          cabin: widget.cabin,
          travellers: widget.travellers,
          base: widget.base,
          taxes: widget.taxes,
          total: widget.total,
          sector: international ? 'international' : 'domestic',
          passengers: List<Passenger>.from(passengers),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final layout = BookLayout.of(context);
    return Scaffold(
      backgroundColor: bookWash,
      appBar: AppBar(
        title: Column(
          children: [
            Text('Passenger details', style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: layout.isCompact ? 14 : 15, color: bookNavy)),
            Text(
              '${widget.flight.fromCode} → ${widget.flight.toCode} · ${passengers.length} traveller${passengers.length > 1 ? 's' : ''}',
              style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 11, color: bookMuted),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          if (international)
            Container(
              width: double.infinity,
              margin: EdgeInsets.fromLTRB(layout.pagePad, 8, layout.pagePad, 0),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF7ED),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFFFE0B8)),
              ),
              child: Text(
                'International route — passport details required (as on passport).',
                style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 11.5, color: bookOrange, height: 1.35),
              ),
            ),
          Expanded(
            child: Form(
              key: formKey,
              child: ListView.separated(
                physics: const BouncingScrollPhysics(),
                padding: layout.listInsets,
                itemCount: passengers.length,
                separatorBuilder: (_, _) => SizedBox(height: layout.sectionGap),
                itemBuilder: (context, index) => _PassengerCard(
                  index: index,
                  passenger: passengers[index],
                  international: international,
                  isLead: index == 0,
                  onChanged: () => setState(() {}),
                  onPickDob: () => _pickDob(index),
                  onPickPassportExpiry: () => _pickPassportExpiry(index),
                ),
              ),
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
              child: PrimaryCta(label: 'Continue to review', onPressed: _continue),
            ),
          ),
        ],
      ),
    );
  }
}

class _PassengerCard extends StatelessWidget {
  const _PassengerCard({
    required this.index,
    required this.passenger,
    required this.international,
    required this.isLead,
    required this.onChanged,
    required this.onPickDob,
    required this.onPickPassportExpiry,
  });

  final int index;
  final Passenger passenger;
  final bool international;
  final bool isLead;
  final VoidCallback onChanged;
  final VoidCallback onPickDob;
  final VoidCallback onPickPassportExpiry;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 16),
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
              Container(
                width: 34,
                height: 34,
                alignment: Alignment.center,
                decoration: BoxDecoration(color: bookSoftBlue, borderRadius: BorderRadius.circular(10)),
                child: Text(
                  '${index + 1}',
                  style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 14, color: bookBlueBright),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isLead ? 'Passenger ${index + 1} · Lead' : 'Passenger ${index + 1}',
                      style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 14, color: bookNavy),
                    ),
                    Text(
                      'Name as on government ID / passport',
                      style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 11, color: bookMuted),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text('Type', style: _labelStyle),
          const SizedBox(height: 6),
          SegmentTabs(
            value: passenger.type.name,
            onChanged: (value) {
              passenger.type = PassengerType.values.firstWhere((e) => e.name == value);
              passenger.dob = null;
              onChanged();
            },
            items: const [
              ('adult', 'Adult'),
              ('child', 'Child'),
              ('infant', 'Infant'),
            ],
          ),
          const SizedBox(height: 12),
          Text('Title', style: _labelStyle),
          const SizedBox(height: 6),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: ['Mr', 'Mrs', 'Ms', 'Mstr']
                .map(
                  (t) => _Chip(
                    label: t,
                    selected: passenger.title == t,
                    onTap: () {
                      passenger.title = t;
                      if (t == 'Mrs' || t == 'Ms') passenger.gender = 'Female';
                      if (t == 'Mr' || t == 'Mstr') passenger.gender = 'Male';
                      onChanged();
                    },
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _Input(
                  label: 'First name',
                  initial: passenger.firstName,
                  textCapitalization: TextCapitalization.words,
                  validator: (v) => (v == null || v.trim().length < 2) ? 'Required' : null,
                  onChanged: (v) => passenger.firstName = v.trim(),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _Input(
                  label: 'Last name',
                  initial: passenger.lastName,
                  textCapitalization: TextCapitalization.words,
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                  onChanged: (v) => passenger.lastName = v.trim(),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _TapField(
            label: 'Date of birth',
            value: passenger.dob == null ? 'Select DOB' : formatDob(passenger.dob),
            icon: Icons.cake_outlined,
            onTap: onPickDob,
          ),
          const SizedBox(height: 10),
          Text('Gender', style: _labelStyle),
          const SizedBox(height: 6),
          SegmentTabs(
            value: passenger.gender,
            onChanged: (value) {
              passenger.gender = value;
              onChanged();
            },
            items: const [('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')],
          ),
          if (isLead) ...[
            const SizedBox(height: 12),
            const Divider(height: 1, color: bookLine),
            const SizedBox(height: 12),
            Text('Contact (for ticket & alerts)', style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 12.5, color: bookNavy)),
            const SizedBox(height: 10),
            _Input(
              label: 'Email',
              initial: passenger.email,
              keyboard: TextInputType.emailAddress,
              validator: (v) {
                final value = v?.trim() ?? '';
                if (!value.contains('@') || !value.contains('.')) return 'Valid email required';
                return null;
              },
              onChanged: (v) => passenger.email = v.trim(),
            ),
            const SizedBox(height: 10),
            _Input(
              label: 'Mobile',
              initial: passenger.phone,
              keyboard: TextInputType.phone,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(10)],
              validator: (v) {
                final digits = (v ?? '').replaceAll(RegExp(r'\D'), '');
                if (digits.length < 10) return '10-digit mobile required';
                return null;
              },
              onChanged: (v) => passenger.phone = v.trim(),
            ),
          ],
          if (international) ...[
            const SizedBox(height: 12),
            const Divider(height: 1, color: bookLine),
            const SizedBox(height: 12),
            Text('Passport', style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 12.5, color: bookNavy)),
            const SizedBox(height: 10),
            _Input(
              label: 'Nationality (ISO)',
              initial: passenger.nationality,
              textCapitalization: TextCapitalization.characters,
              validator: (v) => (v == null || v.trim().length < 2) ? 'Required' : null,
              onChanged: (v) => passenger.nationality = v.trim().toUpperCase(),
            ),
            const SizedBox(height: 10),
            _Input(
              label: 'Passport number',
              initial: passenger.passportNumber,
              textCapitalization: TextCapitalization.characters,
              validator: (v) => (v == null || v.trim().length < 6) ? 'Min 6 characters' : null,
              onChanged: (v) => passenger.passportNumber = v.trim().toUpperCase(),
            ),
            const SizedBox(height: 10),
            _TapField(
              label: 'Passport expiry',
              value: passenger.passportExpiry == null ? 'Select expiry' : formatDob(passenger.passportExpiry),
              icon: Icons.event_available_outlined,
              onTap: onPickPassportExpiry,
            ),
          ],
        ],
      ),
    );
  }
}

TextStyle get _labelStyle => GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w600, color: bookMuted);

class _Chip extends StatelessWidget {
  const _Chip({required this.label, required this.selected, required this.onTap});

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? bookBlueBright : bookField,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: selected ? bookBlueBright : bookLine),
        ),
        child: Text(
          label,
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.w700,
            fontSize: 12,
            color: selected ? Colors.white : bookNavy,
          ),
        ),
      ),
    );
  }
}

class _TapField extends StatelessWidget {
  const _TapField({required this.label, required this.value, required this.icon, required this.onTap});

  final String label;
  final String value;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: bookField,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: bookLine),
          ),
          child: Row(
            children: [
              Icon(icon, size: 18, color: bookBlueBright),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label, style: _labelStyle),
                    Text(value, style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13.5, color: bookNavy)),
                  ],
                ),
              ),
              const Icon(Icons.calendar_today_outlined, size: 16, color: Color(0xFF94A3B8)),
            ],
          ),
        ),
      ),
    );
  }
}

class _Input extends StatefulWidget {
  const _Input({
    required this.label,
    required this.initial,
    required this.onChanged,
    this.validator,
    this.keyboard,
    this.textCapitalization = TextCapitalization.none,
    this.inputFormatters,
  });

  final String label;
  final String initial;
  final ValueChanged<String> onChanged;
  final String? Function(String?)? validator;
  final TextInputType? keyboard;
  final TextCapitalization textCapitalization;
  final List<TextInputFormatter>? inputFormatters;

  @override
  State<_Input> createState() => _InputState();
}

class _InputState extends State<_Input> {
  late final TextEditingController controller;

  @override
  void initState() {
    super.initState();
    controller = TextEditingController(text: widget.initial);
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: widget.keyboard,
      textCapitalization: widget.textCapitalization,
      inputFormatters: widget.inputFormatters,
      validator: widget.validator,
      onChanged: widget.onChanged,
      style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14, color: bookNavy),
      decoration: InputDecoration(
        labelText: widget.label,
        filled: true,
        fillColor: bookField,
        labelStyle: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 12, color: bookMuted),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: bookLine)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: bookLine)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: bookBlueBright, width: 1.4)),
        errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: bookHotel)),
      ),
    );
  }
}
