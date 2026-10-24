import 'package:flutter/material.dart';

import 'add_customer.dart';
import 'cibil_fetch.dart';
import 'store.dart';
import 'ui.dart';
import 'wallet.dart';

enum _Panel { none, customer }

class CibilScreen extends StatefulWidget {
  const CibilScreen({super.key});

  @override
  State<CibilScreen> createState() => _CibilScreenState();
}

class _CibilScreenState extends State<CibilScreen> {
  final search = TextEditingController();
  var panel = _Panel.none;
  var error = '';
  String? customerId;

  @override
  void dispose() {
    search.dispose();
    super.dispose();
  }

  void toggle(_Panel next) {
    setState(() {
      panel = panel == next ? _Panel.none : next;
      error = '';
    });
  }

  void check() {
    final id = customerId;
    final person = id == null ? null : AgentScope.of(context).customerById(id);
    if (person == null) {
      setState(() {
        customerId = null;
        error = 'Select a customer.';
      });
      return;
    }
    final store = AgentScope.of(context);
    if (store.lowBalance) {
      setState(() => error = 'Low balance. Add ${inr(store.chargeRupees)} before this credit check.');
      return;
    }
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => CibilFetchPage(id: person.id)));
  }

  @override
  Widget build(BuildContext context) {
    final store = AgentScope.of(context);
    final nav = DeskNav.of(context);
    final selected = customerId == null ? null : store.customerById(customerId!);
    final term = search.text.trim().toLowerCase();
    final people = store.customers.where((customer) {
      if (term.isEmpty) return true;
      return customer.name.toLowerCase().contains(term) || customer.phone.contains(term) || customer.pan.toLowerCase().contains(term);
    }).toList();

    return ColoredBox(
      color: const Color(0xFFF4F7FB),
      child: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: [
            _Bar(store: store, onBack: () => nav.go(0), onMenu: nav.openMenu),
            const SizedBox(height: 16),
            const Text('Check CIBIL Report', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, letterSpacing: -0.5, color: dashNavy)),
            const SizedBox(height: 4),
            const Text('The credit report uses the customer’s name, mobile, date of birth, email, and PAN. Consent and the OTP are required. The ₹61.36 fee is taken from the Broget Pay wallet.', style: TextStyle(color: Color(0xFF8B95A7), fontSize: 13, height: 1.35)),
            if (store.lowBalance) ...[
              const SizedBox(height: 12),
              const LowBalanceBanner(),
            ],
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFEEF1F6)),
                boxShadow: const [BoxShadow(color: Color(0x0F2F6BFF), blurRadius: 18, offset: Offset(0, 8))],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _Drop(
                    label: 'Select Customer',
                    icon: const Icon(Icons.person_outline, size: 18, color: Color(0xFF8B95A7)),
                    value: selected?.name ?? 'Select Customer',
                    placeholder: selected == null,
                    open: panel == _Panel.customer,
                    onTap: () => toggle(_Panel.customer),
                    child: panel == _Panel.customer
                        ? Column(
                            children: [
                              Padding(
                                padding: const EdgeInsets.fromLTRB(10, 0, 10, 8),
                                child: TextField(
                                  controller: search,
                                  onChanged: (_) => setState(() {}),
                                  style: const TextStyle(fontWeight: FontWeight.w700, color: dashNavy, fontSize: 13),
                                  decoration: InputDecoration(
                                    hintText: 'Search by name, phone or PAN...',
                                    hintStyle: const TextStyle(color: Color(0xFFB0B8C6), fontWeight: FontWeight.w600, fontSize: 12),
                                    prefixIcon: const Icon(Icons.search, size: 18, color: Color(0xFF8B95A7)),
                                    isDense: true,
                                    filled: true,
                                    fillColor: const Color(0xFFF7F9FC),
                                    contentPadding: const EdgeInsets.symmetric(vertical: 10),
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFEEF1F6))),
                                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFEEF1F6))),
                                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: dashBlue)),
                                  ),
                                ),
                              ),
                              if (people.isEmpty)
                                const Padding(padding: EdgeInsets.all(12), child: Text('No customer matches that search.', style: TextStyle(color: muted, fontSize: 12)))
                              else
                                ConstrainedBox(
                                  constraints: const BoxConstraints(maxHeight: 280),
                                  child: ListView.separated(
                                    shrinkWrap: true,
                                    itemCount: people.length,
                                    separatorBuilder: (context, index) => const Divider(height: 1, color: Color(0xFFF1F5F9)),
                                    itemBuilder: (context, index) {
                                      final customer = people[index];
                                      return _PersonRow(
                                        customer: customer,
                                        tint: store.customers.indexOf(customer),
                                        selected: customer.id == customerId,
                                        onTap: () => setState(() {
                                          customerId = customer.id;
                                          panel = _Panel.none;
                                          error = '';
                                        }),
                                      );
                                    },
                                  ),
                                ),
                              const Divider(height: 1, color: Color(0xFFF1F5F9)),
                              InkWell(
                                onTap: () {
                                  setState(() => panel = _Panel.none);
                                  Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AddCustomerPage()));
                                },
                                child: const Padding(
                                  padding: EdgeInsets.symmetric(vertical: 12),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.add, size: 16, color: dashBlue),
                                      SizedBox(width: 6),
                                      Text('Add New Customer', style: TextStyle(color: dashBlue, fontWeight: FontWeight.w800)),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          )
                        : null,
                  ),
                  if (error.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(error, style: const TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w700, fontSize: 12)),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: check,
              style: FilledButton.styleFrom(
                backgroundColor: dashBlue,
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(52),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
              ),
              icon: const Icon(Icons.speed, size: 18),
              label: const Text('Get credit analytics report'),
            ),
          ],
        ),
      ),
    );
  }
}

class _Bar extends StatelessWidget {
  const _Bar({required this.store, required this.onBack, required this.onMenu});

  final AgentStore store;
  final VoidCallback onBack;
  final VoidCallback onMenu;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        IconButton(
          visualDensity: VisualDensity.compact,
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          onPressed: onBack,
          icon: const Icon(Icons.arrow_back, color: dashNavy, size: 22),
        ),
        const CibilBadge(size: 34),
        const SizedBox(width: 8),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Broget AI', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: dashNavy, height: 1.05)),
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
          child: CircleAvatar(
            radius: 16,
            backgroundColor: const Color(0xFFE8F0FF),
            child: Text(store.agentName.isEmpty ? 'A' : store.agentName.substring(0, 1).toUpperCase(), style: const TextStyle(color: dashBlue, fontWeight: FontWeight.w800, fontSize: 13)),
          ),
        ),
      ],
    );
  }
}

class _Drop extends StatelessWidget {
  const _Drop({required this.label, required this.icon, required this.value, required this.open, required this.onTap, this.placeholder = false, this.child});

  final String label;
  final Widget icon;
  final String value;
  final bool open;
  final bool placeholder;
  final VoidCallback onTap;
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text.rich(
          TextSpan(children: [
            TextSpan(text: label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: dashNavy)),
            const TextSpan(text: ' *', style: TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w800)),
          ]),
        ),
        const SizedBox(height: 6),
        DecoratedBox(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: open ? dashBlue : const Color(0xFFE2E8F0)),
          ),
          child: Column(
            children: [
              InkWell(
                onTap: onTap,
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  child: Row(
                    children: [
                      icon,
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          value,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(fontWeight: FontWeight.w700, color: placeholder ? const Color(0xFFB0B8C6) : dashNavy, fontSize: 14),
                        ),
                      ),
                      Icon(open ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, color: const Color(0xFF8B95A7)),
                    ],
                  ),
                ),
              ),
              ?child,
            ],
          ),
        ),
      ],
    );
  }
}

class _PersonRow extends StatelessWidget {
  const _PersonRow({required this.customer, required this.tint, required this.selected, required this.onTap});

  final Customer customer;
  final int tint;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final parts = customer.name.split(' ').where((part) => part.isNotEmpty).toList();
    final initials = parts.length > 1 ? '${parts.first[0]}${parts.last[0]}' : customer.name.substring(0, 1);
    const washes = [Color(0xFFE8F1FF), Color(0xFFFDE8F3), Color(0xFFE7F8EE), Color(0xFFF3E8FF), Color(0xFFFFF1E6)];
    const inks = [Color(0xFF3B82F6), Color(0xFFDB2777), Color(0xFF16A34A), Color(0xFF7C3AED), Color(0xFFEA580C)];
    final slot = tint < 0 ? 0 : tint % washes.length;
    final score = customer.sampleScore;
    final band = score == null ? null : scoreBand(score);
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        child: Row(
          children: [
            CircleAvatar(radius: 16, backgroundColor: washes[slot], child: Text(initials.toUpperCase(), style: TextStyle(color: inks[slot], fontSize: 10, fontWeight: FontWeight.w800))),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(customer.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy, fontSize: 13)),
                  Text(
                    '+91 ${phoneLabel(customer.phone)}${customer.pan.isEmpty ? '' : '  ·  PAN: ${customer.pan}'}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Color(0xFF8B95A7), fontSize: 10),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 6),
            if (customer.cibil == CibilState.ready && band != null && score != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                decoration: BoxDecoration(color: band.wash, borderRadius: BorderRadius.circular(8)),
                child: Column(
                  children: [
                    Text('$score', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: dashNavy, height: 1)),
                    Text(band.label, style: TextStyle(color: band.color, fontSize: 9, fontWeight: FontWeight.w800)),
                  ],
                ),
              )
            else if (customer.cibil == CibilState.checking)
              const _Mini(icon: Icons.schedule, color: Color(0xFF2563EB), wash: Color(0xFFEAF1FF), label: 'In Progress')
            else if (customer.cibil == CibilState.ready)
              const _Mini(icon: Icons.check_circle, color: Color(0xFF16A34A), wash: Color(0xFFE8F8EE), label: 'Checked')
            else
              const _Mini(icon: Icons.cancel, color: Color(0xFFDC2626), wash: Color(0xFFFFF1F2), label: 'Not Checked'),
            const SizedBox(width: 6),
            Icon(Icons.check_circle, size: 18, color: selected ? dashBlue : const Color(0xFFE2E8F0)),
          ],
        ),
      ),
    );
  }
}

class _Mini extends StatelessWidget {
  const _Mini({required this.icon, required this.color, required this.wash, required this.label});

  final IconData icon;
  final Color color;
  final Color wash;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
      decoration: BoxDecoration(color: wash, borderRadius: BorderRadius.circular(8)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 3),
          Text(label, style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }
}

