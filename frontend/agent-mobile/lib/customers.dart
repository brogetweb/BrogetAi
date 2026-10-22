import 'package:flutter/material.dart';

import 'add_customer.dart';
import 'loans.dart';
import 'store.dart';
import 'ui.dart';

export 'add_customer.dart';

enum _DeskFilter { all, checked, progress, missed }

enum _DeskSort { recent, name, score }

class CustomersScreen extends StatefulWidget {
  const CustomersScreen({super.key});

  @override
  State<CustomersScreen> createState() => _CustomersScreenState();
}

class _CustomersScreenState extends State<CustomersScreen> {
  final query = TextEditingController();
  var filter = _DeskFilter.all;
  var sort = _DeskSort.recent;

  @override
  void dispose() {
    query.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final store = AgentScope.of(context);
    final nav = DeskNav.of(context);
    final term = query.text.trim().toLowerCase();
    final checked = store.customers.where((customer) => customer.cibil == CibilState.ready).length;
    final progress = store.customers.where((customer) => customer.cibil == CibilState.checking).length;
    final missed = store.customers.where((customer) => customer.cibil == CibilState.pending).length;
    final visible = store.customers.where((customer) {
      final matches = switch (filter) {
        _DeskFilter.all => true,
        _DeskFilter.checked => customer.cibil == CibilState.ready,
        _DeskFilter.progress => customer.cibil == CibilState.checking,
        _DeskFilter.missed => customer.cibil == CibilState.pending,
      };
      if (!matches) return false;
      if (term.isEmpty) return true;
      return customer.name.toLowerCase().contains(term) || customer.city.toLowerCase().contains(term) || customer.phone.contains(term) || customer.pan.toLowerCase().contains(term);
    }).toList();
    visible.sort((a, b) {
      return switch (sort) {
        _DeskSort.name => a.name.compareTo(b.name),
        _DeskSort.score => (b.sampleScore ?? -1).compareTo(a.sampleScore ?? -1),
        _DeskSort.recent => 0,
      };
    });

    return ColoredBox(
      color: const Color(0xFFF4F7FB),
      child: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: [
            _ListBar(store: store, onMenu: nav.openMenu),
            const SizedBox(height: 14),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Customer List', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.4, color: dashNavy)),
                      SizedBox(height: 2),
                      Text('View and manage all your customers.', style: TextStyle(color: Color(0xFF8B95A7), fontSize: 12)),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                FilledButton.icon(
                  onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AddCustomerPage())),
                  style: FilledButton.styleFrom(
                    backgroundColor: dashBlue,
                    foregroundColor: Colors.white,
                    visualDensity: VisualDensity.compact,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                  ),
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('Add Customer'),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: query,
                    onChanged: (_) => setState(() {}),
                    style: const TextStyle(fontWeight: FontWeight.w700, color: dashNavy, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Search by name, phone or PAN...',
                      hintStyle: const TextStyle(color: Color(0xFFB0B8C6), fontWeight: FontWeight.w600, fontSize: 13),
                      prefixIcon: const Icon(Icons.search, color: Color(0xFF8B95A7), size: 20),
                      filled: true,
                      fillColor: Colors.white,
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFEEF1F6))),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFEEF1F6))),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: dashBlue, width: 1.4)),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                PopupMenuButton<_DeskSort>(
                  initialValue: sort,
                  onSelected: (value) => setState(() => sort = value),
                  color: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  itemBuilder: (context) => const [
                    PopupMenuItem(value: _DeskSort.recent, child: Text('Recent')),
                    PopupMenuItem(value: _DeskSort.name, child: Text('Name')),
                    PopupMenuItem(value: _DeskSort.score, child: Text('Highest score')),
                  ],
                  child: Container(
                    width: 44,
                    height: 44,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFEEF1F6))),
                    child: const Icon(Icons.tune, color: Color(0xFF5C677A), size: 20),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _CountCard(icon: Icons.people_alt_outlined, wash: const Color(0xFFEAF1FF), color: dashBlue, value: '${store.customers.length}', label: 'Total Customers'),
                const SizedBox(width: 8),
                _CountCard(icon: Icons.check_circle, wash: const Color(0xFFE8F8EE), color: const Color(0xFF16A34A), value: '$checked', label: 'CIBIL Checked'),
                const SizedBox(width: 8),
                _CountCard(icon: Icons.schedule, wash: const Color(0xFFFFF6E5), color: const Color(0xFFD97706), value: '$progress', label: 'In Progress'),
                const SizedBox(width: 8),
                _CountCard(icon: Icons.cancel, wash: const Color(0xFFFFF1F2), color: const Color(0xFFDC2626), value: '$missed', label: 'Not Checked'),
              ],
            ),
            const SizedBox(height: 12),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _FilterChip(label: 'All', count: store.customers.length, selected: filter == _DeskFilter.all, onTap: () => setState(() => filter = _DeskFilter.all)),
                  _FilterChip(label: 'Checked', count: checked, selected: filter == _DeskFilter.checked, onTap: () => setState(() => filter = _DeskFilter.checked)),
                  _FilterChip(label: 'In Progress', count: progress, selected: filter == _DeskFilter.progress, onTap: () => setState(() => filter = _DeskFilter.progress)),
                  _FilterChip(label: 'Not Checked', count: missed, selected: filter == _DeskFilter.missed, onTap: () => setState(() => filter = _DeskFilter.missed)),
                ],
              ),
            ),
            const SizedBox(height: 12),
            if (visible.isEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 28),
                child: Text(term.isEmpty ? 'No customers yet. Add one and it shows on the super admin list.' : 'No customer matches that search.', textAlign: TextAlign.center, style: const TextStyle(color: muted)),
              )
            else
              for (var i = 0; i < visible.length; i++)
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _PersonCard(customer: visible[i], tint: store.customers.indexOf(visible[i])),
                ),
          ],
        ),
      ),
    );
  }
}

class _ListBar extends StatelessWidget {
  const _ListBar({required this.store, required this.onMenu});

  final AgentStore store;
  final VoidCallback onMenu;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        IconButton(
          visualDensity: VisualDensity.compact,
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          onPressed: onMenu,
          icon: const Icon(Icons.menu_rounded, color: dashNavy, size: 24),
        ),
        const CibilBadge(size: 34),
        const SizedBox(width: 8),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('BerogetAI', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: dashNavy, height: 1.05)),
              Text('CREDIT INSIGHTS', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w700, letterSpacing: 0.7, color: Color(0xFF8B95A7))),
            ],
          ),
        ),
        IconButton(
          visualDensity: VisualDensity.compact,
          onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AlertsPage())),
          icon: Badge(
            isLabelVisible: store.unread > 0,
            label: Text('${store.unread}'),
            child: const Icon(Icons.notifications_none, color: dashNavy),
          ),
        ),
        InkWell(
          onTap: onMenu,
          borderRadius: BorderRadius.circular(20),
          child: Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: const Color(0xFFE8F0FF),
                child: Text(store.agentName.isEmpty ? 'A' : store.agentName.substring(0, 1).toUpperCase(), style: const TextStyle(color: dashBlue, fontWeight: FontWeight.w800, fontSize: 13)),
              ),
              const Icon(Icons.keyboard_arrow_down, size: 18, color: Color(0xFF8B95A7)),
            ],
          ),
        ),
      ],
    );
  }
}

class _CountCard extends StatelessWidget {
  const _CountCard({required this.icon, required this.wash, required this.color, required this.value, required this.label});

  final IconData icon;
  final Color wash;
  final Color color;
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.fromLTRB(6, 8, 6, 8),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFEEF1F6))),
        child: Column(
          children: [
            Container(
              width: 26,
              height: 26,
              alignment: Alignment.center,
              decoration: BoxDecoration(color: wash, shape: BoxShape.circle),
              child: Icon(icon, color: color, size: 15),
            ),
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: dashNavy, height: 1)),
            const SizedBox(height: 2),
            Text(label, textAlign: TextAlign.center, maxLines: 2, style: const TextStyle(fontSize: 9, height: 1.15, fontWeight: FontWeight.w600, color: Color(0xFF8B95A7))),
          ],
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({required this.label, required this.count, required this.selected, required this.onTap});

  final String label;
  final int count;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: Material(
        color: selected ? const Color(0xFFEAF1FF) : Colors.white,
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(10),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: selected ? const Color(0xFFD6E4FF) : const Color(0xFFEEF1F6)),
            ),
            child: Text('$label ($count)', style: TextStyle(color: selected ? dashBlue : const Color(0xFF5C677A), fontWeight: FontWeight.w800, fontSize: 12)),
          ),
        ),
      ),
    );
  }
}

class _PersonCard extends StatelessWidget {
  const _PersonCard({required this.customer, required this.tint});

  final Customer customer;
  final int tint;

  @override
  Widget build(BuildContext context) {
    final parts = customer.name.split(' ').where((part) => part.isNotEmpty).toList();
    final initials = parts.length > 1 ? '${parts.first[0]}${parts.last[0]}' : customer.name.substring(0, 1);
    const washes = [Color(0xFFE8F1FF), Color(0xFFFDE8F3), Color(0xFFE7F8EE), Color(0xFFF3E8FF), Color(0xFFFFF1E6)];
    const inks = [Color(0xFF3B82F6), Color(0xFFDB2777), Color(0xFF16A34A), Color(0xFF7C3AED), Color(0xFFEA580C)];
    final slot = tint < 0 ? 0 : tint % washes.length;
    final score = customer.sampleScore;
    final band = score == null ? null : scoreBand(score);

    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => CustomerPage(id: customer.id))),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.fromLTRB(12, 12, 4, 12),
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFEEF1F6))),
          child: Row(
            children: [
              CircleAvatar(radius: 20, backgroundColor: washes[slot], child: Text(initials.toUpperCase(), style: TextStyle(color: inks[slot], fontWeight: FontWeight.w800, fontSize: 12))),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(customer.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy, fontSize: 14)),
                    const SizedBox(height: 2),
                    Text('+91 ${phoneLabel(customer.phone)}', style: const TextStyle(color: Color(0xFF8B95A7), fontSize: 11)),
                    if (customer.pan.isNotEmpty) Text('PAN: ${customer.pan}', style: const TextStyle(color: Color(0xFF8B95A7), fontSize: 11)),
                    if (customer.dob != null) ...[
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          const Icon(Icons.calendar_today_outlined, size: 11, color: Color(0xFF8B95A7)),
                          const SizedBox(width: 4),
                          Flexible(child: Text(_listDate(customer.dob!), maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Color(0xFF8B95A7), fontSize: 11))),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              if (customer.cibil == CibilState.ready && band != null && score != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                  decoration: BoxDecoration(color: band.wash, borderRadius: BorderRadius.circular(10)),
                  child: Column(
                    children: [
                      Text('$score', style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy, fontSize: 14, height: 1)),
                      Text(band.label, style: TextStyle(color: band.color, fontWeight: FontWeight.w800, fontSize: 10)),
                    ],
                  ),
                )
              else if (customer.cibil == CibilState.checking)
                const _StatusMark(icon: Icons.schedule, color: Color(0xFF2563EB), wash: Color(0xFFEAF1FF), title: 'In Progress', subtitle: 'Checking...')
              else if (customer.cibil == CibilState.ready)
                const _StatusMark(icon: Icons.check_circle, color: Color(0xFF16A34A), wash: Color(0xFFE8F8EE), title: 'Checked', subtitle: 'Score saved')
              else
                const _StatusMark(icon: Icons.cancel, color: Color(0xFFDC2626), wash: Color(0xFFFFF1F2), title: 'Not Checked', subtitle: 'Not started'),
              PopupMenuButton<String>(
                padding: EdgeInsets.zero,
                color: Colors.white,
                onSelected: (value) {
                  if (value == 'open') Navigator.of(context).push(MaterialPageRoute(builder: (_) => CustomerPage(id: customer.id)));
                },
                itemBuilder: (context) => const [PopupMenuItem(value: 'open', child: Text('View profile'))],
                icon: const Icon(Icons.more_vert, color: Color(0xFF8B95A7), size: 18),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusMark extends StatelessWidget {
  const _StatusMark({required this.icon, required this.color, required this.wash, required this.title, required this.subtitle});

  final IconData icon;
  final Color color;
  final Color wash;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 22,
          height: 22,
          alignment: Alignment.center,
          decoration: BoxDecoration(color: wash, shape: BoxShape.circle),
          child: Icon(icon, size: 14, color: color),
        ),
        const SizedBox(width: 6),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 10)),
            Text(subtitle, style: const TextStyle(color: Color(0xFF8B95A7), fontSize: 9)),
          ],
        ),
      ],
    );
  }
}

String _listDate(DateTime value) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  final day = value.day.toString().padLeft(2, '0');
  return '$day ${months[value.month - 1]} ${value.year}';
}

class CustomerPage extends StatelessWidget {
  const CustomerPage({required this.id, super.key});

  final String id;

  @override
  Widget build(BuildContext context) {
    final store = AgentScope.of(context);
    final customer = store.customerById(id);
    if (customer == null) {
      return const Scaffold(body: Center(child: Text('That customer is not on this desk.')));
    }
    final files = store.loansFor(customer.id);
    return Scaffold(
      backgroundColor: paper,
      appBar: AppBar(backgroundColor: paper, elevation: 0, foregroundColor: ink, title: Text(customer.name, style: const TextStyle(fontWeight: FontWeight.w800))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: [
          SoftCard(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(customer.city, style: const TextStyle(color: muted)),
              const SizedBox(height: 4),
              Text(phoneLabel(customer.phone), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: ink)),
              const SizedBox(height: 12),
              StatusChip(label: 'KYC ${customer.kyc.label}', color: kycColor(customer.kyc)),
              if (customer.sampleScore != null) ...[
                const SizedBox(height: 12),
                Text('CIBIL ${customer.sampleScore}', style: const TextStyle(fontWeight: FontWeight.w800, color: ink)),
              ],
              if (customer.kyc == KycStatus.pending) ...[
                const SizedBox(height: 12),
                Text(
                  customer.documents.isEmpty ? 'Add a document copy before you send KYC for review.' : 'The copy is on this device. Sending it marks the file in review. It does not verify the customer.',
                  style: const TextStyle(color: muted, height: 1.4),
                ),
                const SizedBox(height: 12),
                DeskButton(label: 'Send KYC for review', onPressed: customer.documents.isEmpty ? null : () => store.sendKycForReview(customer)),
              ],
            ]),
          ),
          if (customer.pan.isNotEmpty || customer.email.isNotEmpty || customer.address.isNotEmpty) ...[
            const SizedBox(height: 18),
            sectionTitle('Profile'),
            SoftCard(
              child: Column(
                children: [
                  if (customer.gender.isNotEmpty) profileLine('Gender', customer.gender),
                  if (customer.dob != null) profileLine('DOB', prettyDate(customer.dob!)),
                  if (customer.fatherName.isNotEmpty) profileLine('Father', customer.fatherName),
                  if (customer.motherName.isNotEmpty) profileLine('Mother', customer.motherName),
                  if (customer.pan.isNotEmpty) profileLine('PAN', maskPan(customer.pan)),
                  if (customer.aadhaar.isNotEmpty) profileLine('Aadhaar', maskAadhaar(customer.aadhaar)),
                  if (customer.email.isNotEmpty) profileLine('Email', customer.email),
                  if (customer.address.isNotEmpty) profileLine('Address', customer.address),
                  if (customer.state.isNotEmpty) profileLine('State', customer.state),
                  if (customer.pin.isNotEmpty) profileLine('PIN', customer.pin),
                ],
              ),
            ),
          ],
          const SizedBox(height: 18),
          sectionTitle('Consent'),
          if (customer.consents.isEmpty)
            const Text('No consent yet.', style: TextStyle(color: muted))
          else
            for (final consent in customer.consents)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: SoftCard(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(consent.purpose, style: const TextStyle(fontWeight: FontWeight.w800, color: ink)),
                    const SizedBox(height: 4),
                    Text(stamp(consent.at), style: const TextStyle(color: muted, fontSize: 12)),
                  ]),
                ),
              ),
          const SizedBox(height: 8),
          OutlinedButton(onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ConsentPage(id: customer.id))), child: const Text('Record consent')),
          const SizedBox(height: 18),
          sectionTitle('Documents'),
          const Text('Copies stay on this device. They are not uploaded.', style: TextStyle(color: muted, height: 1.4)),
          const SizedBox(height: 8),
          if (customer.documents.isEmpty)
            const Text('No copies saved.', style: TextStyle(color: muted))
          else
            for (final document in customer.documents)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: SoftCard(child: Row(children: [
                  Expanded(child: Text(document.name, style: const TextStyle(fontWeight: FontWeight.w700, color: ink))),
                  Text(document.kind, style: const TextStyle(color: muted)),
                ])),
              ),
          const SizedBox(height: 8),
          OutlinedButton(onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => DocumentPage(id: customer.id))), child: const Text('Save a copy')),
          const SizedBox(height: 18),
          sectionTitle('Loan files'),
          if (files.isEmpty)
            const Text('No loan file yet.', style: TextStyle(color: muted))
          else
            for (final loan in files)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: SoftCard(
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => LoanPage(id: loan.id))),
                  child: LoanRow(loan: loan, customerName: customer.name),
                ),
              ),
        ],
      ),
    );
  }
}

class ConsentPage extends StatefulWidget {
  const ConsentPage({required this.id, super.key});

  final String id;

  @override
  State<ConsentPage> createState() => _ConsentPageState();
}

class _ConsentPageState extends State<ConsentPage> {
  static const purposes = ['Travel booking', 'Loan application', 'Keeping identity documents'];
  var purpose = purposes.first;
  var agreed = false;

  @override
  Widget build(BuildContext context) {
    final store = AgentScope.of(context);
    final customer = store.customerById(widget.id);
    return Scaffold(
      backgroundColor: paper,
      appBar: AppBar(backgroundColor: paper, elevation: 0, foregroundColor: ink, title: const Text('Consent', style: TextStyle(fontWeight: FontWeight.w800))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
        children: [
          Text(customer?.name ?? 'Customer', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, letterSpacing: -0.8, color: ink)),
          const SizedBox(height: 8),
          const Text('Record a yes you already heard from the customer, on a call or in person.', style: TextStyle(color: muted, height: 1.4)),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            initialValue: purpose,
            decoration: deskField('Purpose', ''),
            items: [for (final item in purposes) DropdownMenuItem(value: item, child: Text(item))],
            onChanged: (value) => setState(() => purpose = value ?? purpose),
          ),
          const SizedBox(height: 8),
          CheckboxListTile(
            contentPadding: EdgeInsets.zero,
            value: agreed,
            activeColor: indigo,
            onChanged: (value) => setState(() => agreed = value ?? false),
            title: const Text('The customer agreed to this purpose.'),
            controlAffinity: ListTileControlAffinity.leading,
          ),
          const SizedBox(height: 12),
          DeskButton(
            label: 'Save consent',
            onPressed: !agreed || customer == null
                ? null
                : () {
                    store.addConsent(customer, purpose);
                    Navigator.of(context).pop();
                  },
          ),
          const SizedBox(height: 12),
          const Text('Saved on this device. It is not sent to a bureau.', style: TextStyle(color: muted, height: 1.4)),
        ],
      ),
    );
  }
}

class DocumentPage extends StatefulWidget {
  const DocumentPage({required this.id, super.key});

  final String id;

  @override
  State<DocumentPage> createState() => _DocumentPageState();
}

class _DocumentPageState extends State<DocumentPage> {
  static const kinds = ['Identity', 'Address', 'Income'];
  final name = TextEditingController();
  var kind = kinds.first;
  var error = '';

  @override
  void dispose() {
    name.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final store = AgentScope.of(context);
    final customer = store.customerById(widget.id);
    return Scaffold(
      backgroundColor: paper,
      appBar: AppBar(backgroundColor: paper, elevation: 0, foregroundColor: ink, title: const Text('Document copy', style: TextStyle(fontWeight: FontWeight.w800))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
        children: [
          TextField(controller: name, decoration: deskField('Label', 'Identity copy')),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: kind,
            decoration: deskField('Kind', ''),
            items: [for (final item in kinds) DropdownMenuItem(value: item, child: Text(item))],
            onChanged: (value) => setState(() => kind = value ?? kind),
          ),
          if (error.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(error, style: const TextStyle(color: Color(0xFFB45309), fontWeight: FontWeight.w600)),
          ],
          const SizedBox(height: 20),
          DeskButton(
            label: 'Save on this device',
            onPressed: customer == null
                ? null
                : () {
                    if (name.text.trim().length < 2) {
                      setState(() => error = 'Add a short label. Do not type the full ID number.');
                      return;
                    }
                    store.addDocument(customer, name.text, kind);
                    Navigator.of(context).pop();
                  },
          ),
          const SizedBox(height: 12),
          const Text('The file itself is not uploaded. Keep the ID number out of the label.', style: TextStyle(color: muted, height: 1.4)),
        ],
      ),
    );
  }
}

Widget profileLine(String label, String value) {
  return Padding(
    padding: const EdgeInsets.symmetric(vertical: 4),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(width: 78, child: Text(label, style: const TextStyle(color: muted, fontSize: 13))),
        Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w700, color: ink))),
      ],
    ),
  );
}

Widget sectionTitle(String text) {
  return Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Text(text, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: ink)),
  );
}
