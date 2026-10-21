import 'package:flutter/material.dart';

import 'customers.dart';
import 'kyc_documents.dart';
import 'support_pages.dart';
import 'ui.dart';

class AgentMenu extends StatelessWidget {
  const AgentMenu({required this.index, required this.onTab, required this.onClose, super.key});

  final int index;
  final ValueChanged<int> onTab;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    final store = AgentScope.of(context);
    final width = MediaQuery.sizeOf(context).width;
    return Drawer(
      width: width > 520 ? 380 : width - 28,
      backgroundColor: dashWash,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.horizontal(right: Radius.circular(28))),
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 12, 4),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      gradient: const LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFF1E4ED8), Color(0xFF5B93FF)]),
                    ),
                    child: const Icon(Icons.flight, color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('BerogetAI', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17, color: dashNavy, height: 1.1, letterSpacing: -0.3)),
                        SizedBox(height: 2),
                        Text('CREDIT DESK', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, letterSpacing: 0.9, color: Color(0xFF8B95A7))),
                      ],
                    ),
                  ),
                  Material(
                    color: Colors.white,
                    shape: const CircleBorder(),
                    child: InkWell(
                      customBorder: const CircleBorder(),
                      onTap: onClose,
                      child: Container(
                        width: 36,
                        height: 36,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: const Color(0xFFEEF1F6))),
                        child: const Icon(Icons.close_rounded, color: dashNavy, size: 18),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
              child: Material(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                child: InkWell(
                  onTap: () => onTab(3),
                  borderRadius: BorderRadius.circular(18),
                  child: Container(
                    padding: const EdgeInsets.fromLTRB(12, 10, 8, 10),
                    decoration: BoxDecoration(borderRadius: BorderRadius.circular(18), border: Border.all(color: const Color(0xFFEEF1F6))),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 24,
                          backgroundColor: const Color(0xFFEAF1FF),
                          child: Text(
                            store.agentName.isEmpty ? 'A' : store.agentName.substring(0, 1).toUpperCase(),
                            style: const TextStyle(color: dashBlue, fontWeight: FontWeight.w800, fontSize: 18),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(store.agentName, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy, fontSize: 15)),
                              const SizedBox(height: 2),
                              Text('Agent ID ${store.agentCode}', style: const TextStyle(color: Color(0xFF8B95A7), fontSize: 12, fontWeight: FontWeight.w600)),
                              const SizedBox(height: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(color: const Color(0xFFE8F8EE), borderRadius: BorderRadius.circular(999)),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.verified_rounded, size: 13, color: Color(0xFF16A34A)),
                                    SizedBox(width: 4),
                                    Text('Verified Agent', style: TextStyle(color: Color(0xFF16A34A), fontSize: 11, fontWeight: FontWeight.w800)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.chevron_right_rounded, color: Color(0xFFB0B8C6)),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 10, 16, 4),
                children: [
                  _Group(
                    title: 'Main',
                    children: [
                      _Item(icon: Icons.home_outlined, label: 'Home', selected: index == 0, onTap: () => onTab(0)),
                      _Item(icon: Icons.person_add_alt_1, label: 'Add Customer', onTap: () => _push(context, const AddCustomerPage())),
                      _Item(icon: Icons.speed, label: 'Check CIBIL Report', selected: index == 2, onTap: () => onTab(2)),
                      _Item(icon: Icons.people_outline, label: 'Customer List', selected: index == 1, onTap: () => onTab(1)),
                    ],
                  ),
                  _Group(
                    title: 'Manage',
                    children: [
                      _Item(icon: Icons.person_outline, label: 'My Profile', selected: index == 3, onTap: () => onTab(3)),
                      _Item(icon: Icons.badge_outlined, label: 'KYC & Documents', onTap: () => _push(context, const KycDocumentsPage())),
                    ],
                  ),
                  _Group(
                    title: 'Support',
                    children: [
                      _Item(icon: Icons.headset_mic_outlined, label: 'Help & Support', onTap: () => _push(context, const HelpSupportPage())),
                      _Item(icon: Icons.article_outlined, label: 'Terms & Conditions', onTap: () => _push(context, const TermsPage())),
                      _Item(icon: Icons.shield_outlined, label: 'Privacy Policy', onTap: () => _push(context, const PrivacyPage())),
                      _Item(icon: Icons.info_outline, label: 'About BerogetAI', onTap: () => _push(context, const AboutPage())),
                    ],
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 6),
              child: Material(
                color: const Color(0xFFFFF1F2),
                borderRadius: BorderRadius.circular(14),
                child: InkWell(
                  onTap: store.signOut,
                  borderRadius: BorderRadius.circular(14),
                  child: const Padding(
                    padding: EdgeInsets.symmetric(vertical: 13),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.logout_rounded, color: Color(0xFFDC2626), size: 18),
                        SizedBox(width: 8),
                        Text('Logout', style: TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w800, fontSize: 14)),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            const Padding(
              padding: EdgeInsets.only(bottom: 10),
              child: Text('Version 1.0.0', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFF8B95A7), fontSize: 11, fontWeight: FontWeight.w600)),
            ),
          ],
        ),
      ),
    );
  }

  void _push(BuildContext context, Widget page) {
    onClose();
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => page));
  }
}

class _Group extends StatelessWidget {
  const _Group({required this.title, required this.children});

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Container(
        padding: const EdgeInsets.fromLTRB(8, 8, 8, 6),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFFEEF1F6)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 2, 8, 6),
              child: Text(title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.6, color: Color(0xFF8B95A7))),
            ),
            ...children,
          ],
        ),
      ),
    );
  }
}

class _Item extends StatelessWidget {
  const _Item({required this.icon, required this.label, required this.onTap, this.selected = false});

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    final ink = selected ? dashBlue : const Color(0xFF3D4658);
    return Padding(
      padding: const EdgeInsets.only(bottom: 2),
      child: Material(
        color: selected ? const Color(0xFFEAF1FF) : Colors.transparent,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
            child: Row(
              children: [
                Container(
                  width: 34,
                  height: 34,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: selected ? dashBlue : const Color(0xFFF4F7FB),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, size: 18, color: selected ? Colors.white : ink),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontWeight: FontWeight.w700, color: selected ? dashBlue : dashNavy, fontSize: 14)),
                ),
                if (selected) const Icon(Icons.chevron_right_rounded, size: 18, color: dashBlue),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class ReportsScreen extends StatelessWidget {
  const ReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final store = AgentScope.of(context);
    final rows = store.customers.where((customer) => customer.sampleScore != null).toList();
    return ColoredBox(
      color: dashWash,
      child: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          children: [
            const Text('Reports', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, letterSpacing: -0.6, color: dashNavy)),
            const SizedBox(height: 6),
            const Text('Sample figures already on this device. Nothing here was pulled from a bureau, and nothing downloads.', style: TextStyle(color: Color(0xFF5C677A), height: 1.4)),
            const SizedBox(height: 16),
            for (final customer in rows)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: SoftCard(
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(customer.name, style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy)),
                          const SizedBox(height: 2),
                          Text(customer.city, style: const TextStyle(color: muted, fontSize: 12)),
                        ]),
                      ),
                      Text('${customer.sampleScore}', style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy)),
                      const SizedBox(width: 8),
                      const StatusChip(label: 'Sample', color: Color(0xFF16A34A)),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class InfoPage extends StatelessWidget {
  const InfoPage({required this.title, required this.body, super.key});

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: dashWash,
      appBar: AppBar(backgroundColor: dashWash, elevation: 0, foregroundColor: dashNavy, title: Text(title, style: const TextStyle(fontWeight: FontWeight.w800))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
        children: [
          Text(body, style: const TextStyle(color: Color(0xFF3D4658), height: 1.5, fontSize: 15)),
        ],
      ),
    );
  }
}
