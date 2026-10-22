import 'package:flutter/material.dart';

import 'api.dart';
import 'customers.dart';
import 'menu.dart';
import 'store.dart';
import 'ui.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final store = AgentScope.of(context);
    final nav = DeskNav.of(context);
    final ready = store.customers.where((customer) => customer.cibil == CibilState.ready).length;
    final checking = store.customers.where((customer) => customer.cibil == CibilState.checking).length;
    final pending = store.customers.where((customer) => customer.cibil == CibilState.pending).length;

    return ColoredBox(
      color: dashWash,
      child: SafeArea(
        bottom: false,
        child: ListView(
          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
          padding: const EdgeInsets.fromLTRB(14, 6, 14, 16),
          children: [
            _TopBar(store: store, onMenu: nav.openMenu),
            const SizedBox(height: 10),
            _Greeting(store: store),
            const SizedBox(height: 10),
            _Hero(onCheck: () => nav.go(2)),
            const SizedBox(height: 12),
            const _SectionLabel(title: 'Desk today'),
            const SizedBox(height: 10),
            _StatGrid(
              total: store.customers.length,
              ready: ready,
              checking: checking,
              pending: pending,
              onOpen: () => nav.go(1),
            ),
            if (pending > 0) ...[
              const SizedBox(height: 12),
              _PendingBanner(count: pending, onCheck: () => nav.go(2)),
            ],
            const SizedBox(height: 20),
            const _CheckHistory(),
            const SizedBox(height: 20),
            const _SectionLabel(title: 'Quick actions'),
            const SizedBox(height: 10),
            _QuickActions(nav: nav),
            const SizedBox(height: 20),
            _Recent(store: store, onViewAll: () => nav.go(1)),
            const SizedBox(height: 16),
            const _SecureNote(),
          ],
        ),
      ),
    );
  }
}

class _CheckHistory extends StatefulWidget {
  const _CheckHistory();

  @override
  State<_CheckHistory> createState() => _CheckHistoryState();
}

class _CheckHistoryState extends State<_CheckHistory> {
  static const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  late int year;
  late int month;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    year = now.year;
    month = now.month;
  }

  @override
  Widget build(BuildContext context) {
    final store = AgentScope.of(context);
    final now = DateTime.now();
    final today = store.checks.where((check) => check.checkedAt.year == now.year && check.checkedAt.month == now.month && check.checkedAt.day == now.day).length;
    final inMonth = store.checks.where((check) => check.checkedAt.year == year && check.checkedAt.month == month).toList();
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 8),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFEEF1F6))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Your checks', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: dashNavy, letterSpacing: -0.3)),
          const SizedBox(height: 4),
          const Text('Only the credit checks you ran.', style: TextStyle(color: Color(0xFF8B95A7), fontSize: 12, fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          Row(
            children: [
              _CountTile(label: 'Today', value: '$today'),
              const SizedBox(width: 8),
              _CountTile(label: months[month - 1], value: '${inMonth.length}'),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _YearButton(icon: Icons.chevron_left, onTap: () => setState(() => year -= 1)),
              Expanded(child: Text('$year', textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy))),
              _YearButton(icon: Icons.chevron_right, onTap: year >= now.year ? null : () => setState(() => year += 1)),
            ],
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 36,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: months.length,
              separatorBuilder: (_, _) => const SizedBox(width: 6),
              itemBuilder: (context, index) {
                final selected = month == index + 1;
                return Material(
                  color: selected ? dashBlue : const Color(0xFFF4F7FC),
                  borderRadius: BorderRadius.circular(999),
                  child: InkWell(
                    onTap: () => setState(() => month = index + 1),
                    borderRadius: BorderRadius.circular(999),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Center(child: Text(months[index], style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: selected ? Colors.white : const Color(0xFF5C677A)))),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 8),
          if (inMonth.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 14),
              child: Text('No checks in this month.', style: TextStyle(color: Color(0xFF8B95A7), fontWeight: FontWeight.w700, fontSize: 13)),
            )
          else
            for (final check in inMonth) _CheckRow(check: check),
        ],
      ),
    );
  }
}

class _YearButton extends StatelessWidget {
  const _YearButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return IconButton(onPressed: onTap, icon: Icon(icon, color: onTap == null ? const Color(0xFFD0D5DD) : dashNavy));
  }
}

class _CountTile extends StatelessWidget {
  const _CountTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(color: const Color(0xFFF4F7FC), borderRadius: BorderRadius.circular(14)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: dashNavy, letterSpacing: -0.4)),
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF8B95A7))),
          ],
        ),
      ),
    );
  }
}

class _CheckRow extends StatelessWidget {
  const _CheckRow({required this.check});

  final AgentCreditCheck check;

  @override
  Widget build(BuildContext context) {
    final when = TimeOfDay.fromDateTime(check.checkedAt).format(context);
    final day = '${check.checkedAt.day} ${ _CheckHistoryState.months[check.checkedAt.month - 1]}';
    final ready = check.status == 'ready' && check.score != null;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(check.name, style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy)),
                Text('$day · $when', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF8B95A7))),
              ],
            ),
          ),
          Text(ready ? '${check.score}' : 'Failed', style: TextStyle(fontWeight: FontWeight.w800, color: ready ? const Color(0xFF16A34A) : const Color(0xFFDC2626))),
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: dashNavy, letterSpacing: -0.3));
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({required this.store, required this.onMenu});

  final AgentStore store;
  final VoidCallback onMenu;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _RoundButton(icon: Icons.menu_rounded, onTap: onMenu),
        const SizedBox(width: 12),
        const CibilBadge(size: 36),
        const SizedBox(width: 10),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('BerogetAI', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: dashNavy, letterSpacing: -0.4)),
              Text('CIBIL DESK', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, letterSpacing: 0.9, color: Color(0xFF8B95A7))),
            ],
          ),
        ),
        _RoundButton(
          icon: Icons.notifications_none_rounded,
          badge: store.unread,
          onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AlertsPage())),
        ),
      ],
    );
  }
}

class _RoundButton extends StatelessWidget {
  const _RoundButton({required this.icon, required this.onTap, this.badge = 0});

  final IconData icon;
  final VoidCallback onTap;
  final int badge;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      shape: const CircleBorder(),
      elevation: 0,
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: Container(
          width: 40,
          height: 40,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0xFFEEF1F6)),
          ),
          child: Badge(
            isLabelVisible: badge > 0,
            label: Text('$badge'),
            child: Icon(icon, color: dashNavy, size: 20),
          ),
        ),
      ),
    );
  }
}

class _Greeting extends StatelessWidget {
  const _Greeting({required this.store});

  final AgentStore store;

  @override
  Widget build(BuildContext context) {
    final hour = DateTime.now().hour;
    final hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(hello, style: const TextStyle(color: Color(0xFF8B95A7), fontWeight: FontWeight.w700, fontSize: 13)),
        const SizedBox(height: 2),
        Text(store.agentName, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: dashNavy, letterSpacing: -0.6, height: 1.1)),
        const SizedBox(height: 6),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _Pill(icon: Icons.badge_outlined, label: 'ID ${store.agentCode}'),
            _Pill(icon: Icons.location_on_outlined, label: '${store.desk} desk'),
            _Pill(icon: Icons.calendar_today_outlined, label: prettyDate(DateTime.now())),
          ],
        ),
      ],
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(999), border: Border.all(color: const Color(0xFFEEF1F6))),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: dashBlue),
          const SizedBox(width: 5),
          Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF5C677A))),
        ],
      ),
    );
  }
}

class _Hero extends StatelessWidget {
  const _Hero({required this.onCheck});

  final VoidCallback onCheck;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(22),
      child: InkWell(
        onTap: onCheck,
        borderRadius: BorderRadius.circular(22),
        child: Container(
          padding: const EdgeInsets.fromLTRB(12, 12, 14, 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: const Color(0xFFD9E4FF)),
          ),
          child: Row(
            children: [
              const CibilBadge(size: 72),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('CIBIL check', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: dashNavy, letterSpacing: -0.3)),
                    SizedBox(height: 3),
                    Text('Open a saved customer and fetch the score.', style: TextStyle(color: Color(0xFF8B95A7), fontSize: 12, height: 1.3, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                width: 36,
                height: 36,
                alignment: Alignment.center,
                decoration: const BoxDecoration(color: dashBlue, shape: BoxShape.circle),
                child: const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 18),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatGrid extends StatelessWidget {
  const _StatGrid({required this.total, required this.ready, required this.checking, required this.pending, required this.onOpen});

  final int total;
  final int ready;
  final int checking;
  final int pending;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            _StatTile(color: dashBlue, wash: const Color(0xFFEAF1FF), icon: Icons.people_alt_outlined, value: '$total', label: 'Profiles', hint: 'On this desk', onTap: onOpen),
            const SizedBox(width: 10),
            _StatTile(color: const Color(0xFF16A34A), wash: const Color(0xFFE8F8EE), icon: Icons.speed, value: '$ready', label: 'Checked', hint: 'Score ready', onTap: onOpen),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            _StatTile(color: const Color(0xFF2563EB), wash: const Color(0xFFEAF1FF), icon: Icons.schedule, value: '$checking', label: 'In progress', hint: 'Still fetching', onTap: onOpen),
            const SizedBox(width: 10),
            _StatTile(color: const Color(0xFFDC2626), wash: const Color(0xFFFFF1F2), icon: Icons.person_off_outlined, value: '$pending', label: 'Not checked', hint: 'Needs a check', onTap: onOpen),
          ],
        ),
      ],
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({required this.color, required this.wash, required this.icon, required this.value, required this.label, required this.hint, required this.onTap});

  final Color color;
  final Color wash;
  final IconData icon;
  final String value;
  final String label;
  final String hint;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(18),
          child: Container(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
            decoration: BoxDecoration(borderRadius: BorderRadius.circular(18), border: Border.all(color: const Color(0xFFEEF1F6))),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(color: wash, borderRadius: BorderRadius.circular(10)),
                      child: Icon(icon, size: 16, color: color),
                    ),
                    const Spacer(),
                    const Icon(Icons.north_east, size: 14, color: Color(0xFFB0B8C6)),
                  ],
                ),
                const SizedBox(height: 12),
                Text(value, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: dashNavy, letterSpacing: -0.6, height: 1)),
                const SizedBox(height: 4),
                Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: dashNavy)),
                Text(hint, style: const TextStyle(fontSize: 11, color: Color(0xFF8B95A7), fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _PendingBanner extends StatelessWidget {
  const _PendingBanner({required this.count, required this.onCheck});

  final int count;
  final VoidCallback onCheck;

  @override
  Widget build(BuildContext context) {
    final noun = count == 1 ? 'customer still needs' : 'customers still need';
    return Material(
      color: const Color(0xFFFFF6E5),
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onCheck,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
          child: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                alignment: Alignment.center,
                decoration: BoxDecoration(color: const Color(0xFFF59E0B), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.priority_high_rounded, color: Colors.white, size: 20),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('$count $noun a check', style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy, fontSize: 13)),
                    const Text('Open CIBIL Check and pick them.', style: TextStyle(color: Color(0xFF8A6A2F), fontSize: 12)),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: Color(0xFFD97706)),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuickActions extends StatelessWidget {
  const _QuickActions({required this.nav});

  final DeskNav nav;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            _Action(
              wash: const Color(0xFFEAF1FF),
              color: dashBlue,
              icon: Icons.person_add_alt_1,
              title: 'Add Customer',
              subtitle: 'Five-step profile',
              onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AddCustomerPage())),
            ),
            const SizedBox(width: 10),
            _Action(wash: const Color(0xFFE8F8EE), color: const Color(0xFF16A34A), icon: Icons.speed, title: 'Check CIBIL', subtitle: 'Select and fetch', onTap: () => nav.go(2)),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            _Action(
              wash: const Color(0xFFF3E8FF),
              color: const Color(0xFF7C3AED),
              icon: Icons.description_outlined,
              title: 'View Reports',
              subtitle: 'Saved score files',
              onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ReportsScreen())),
            ),
            const SizedBox(width: 10),
            _Action(
              wash: const Color(0xFFFFF6E5),
              color: const Color(0xFFD97706),
              icon: Icons.notifications_none_rounded,
              title: 'Alerts',
              subtitle: 'Desk notices',
              onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AlertsPage())),
            ),
          ],
        ),
      ],
    );
  }
}

class _Action extends StatelessWidget {
  const _Action({required this.wash, required this.color, required this.icon, required this.title, required this.subtitle, required this.onTap});

  final Color wash;
  final Color color;
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(18),
          child: Container(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 14),
            decoration: BoxDecoration(borderRadius: BorderRadius.circular(18), border: Border.all(color: const Color(0xFFEEF1F6))),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(color: wash, borderRadius: BorderRadius.circular(12)),
                  child: Icon(icon, color: color, size: 20),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: dashNavy)),
                      const SizedBox(height: 2),
                      Text(subtitle, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11, color: Color(0xFF8B95A7), fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Recent extends StatelessWidget {
  const _Recent({required this.store, required this.onViewAll});

  final AgentStore store;
  final VoidCallback onViewAll;

  @override
  Widget build(BuildContext context) {
    final people = store.customers.take(4).toList();
    return Column(
      children: [
        Row(
          children: [
            const Expanded(child: _SectionLabel(title: 'Recent customers')),
            TextButton(
              onPressed: onViewAll,
              style: TextButton.styleFrom(foregroundColor: dashBlue, visualDensity: VisualDensity.compact, padding: const EdgeInsets.symmetric(horizontal: 8)),
              child: const Text('View all', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Container(
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: const Color(0xFFEEF1F6))),
          child: people.isEmpty
              ? const Padding(
                  padding: EdgeInsets.all(16),
                  child: Text('No customers yet.', style: TextStyle(color: Color(0xFF8B95A7), fontWeight: FontWeight.w700)),
                )
              : Column(
                  children: [
                    for (var i = 0; i < people.length; i++) ...[
                      if (i > 0) const Divider(height: 1, color: Color(0xFFF1F4F8)),
                      _CustomerLine(customer: people[i], tint: i),
                    ],
                  ],
                ),
        ),
      ],
    );
  }
}

class _CustomerLine extends StatelessWidget {
  const _CustomerLine({required this.customer, required this.tint});

  final Customer customer;
  final int tint;

  @override
  Widget build(BuildContext context) {
    final parts = customer.name.split(' ').where((part) => part.isNotEmpty).toList();
    final initials = parts.length > 1 ? '${parts.first[0]}${parts.last[0]}' : customer.name.substring(0, 1);
    const washes = [Color(0xFFE8F1FF), Color(0xFFFDE8F3), Color(0xFFE7F8EE), Color(0xFFF3E8FF)];
    const inks = [Color(0xFF3B82F6), Color(0xFFDB2777), Color(0xFF16A34A), Color(0xFF7C3AED)];
    final slot = tint % washes.length;
    final score = customer.sampleScore;
    final band = score == null || customer.cibil != CibilState.ready ? null : scoreBand(score);

    return InkWell(
      onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => CustomerPage(id: customer.id))),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 12, 10, 12),
        child: Row(
          children: [
            CircleAvatar(radius: 20, backgroundColor: washes[slot], child: Text(initials.toUpperCase(), style: TextStyle(color: inks[slot], fontSize: 12, fontWeight: FontWeight.w800))),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(customer.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: dashNavy)),
                  const SizedBox(height: 2),
                  Text('+91 ${phoneLabel(customer.phone)}', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Color(0xFF8B95A7), fontSize: 12, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
            const SizedBox(width: 8),
            if (band != null && score != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                decoration: BoxDecoration(color: band.wash, borderRadius: BorderRadius.circular(10)),
                child: Column(
                  children: [
                    Text('$score', style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy, fontSize: 13, height: 1)),
                    Text(band.label, style: TextStyle(color: band.color, fontWeight: FontWeight.w800, fontSize: 10)),
                  ],
                ),
              )
            else if (customer.cibil == CibilState.checking)
              const _StatusPill(label: 'In progress', color: Color(0xFF2563EB), wash: Color(0xFFEAF1FF))
            else if (customer.cibil == CibilState.ready)
              const _StatusPill(label: 'Checked', color: Color(0xFF16A34A), wash: Color(0xFFE8F8EE))
            else
              const _StatusPill(label: 'Not checked', color: Color(0xFFDC2626), wash: Color(0xFFFFF1F2)),
          ],
        ),
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.label, required this.color, required this.wash});

  final String label;
  final Color color;
  final Color wash;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(color: wash, borderRadius: BorderRadius.circular(10)),
      child: Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w800)),
    );
  }
}

class _SecureNote extends StatelessWidget {
  const _SecureNote();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 14, 10, 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFEEF1F6)),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            alignment: Alignment.center,
            decoration: BoxDecoration(color: const Color(0xFFEAF1FF), borderRadius: BorderRadius.circular(14)),
            child: const Icon(Icons.verified_user_outlined, color: dashBlue, size: 22),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Secure & authorized', style: TextStyle(fontWeight: FontWeight.w800, color: dashNavy, fontSize: 14)),
                SizedBox(height: 3),
                Text('Checks run with customer consent. Scores on this desk stay on the device.', style: TextStyle(color: Color(0xFF5C677A), fontSize: 12, height: 1.35)),
              ],
            ),
          ),
          IconButton(
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const InfoPage(title: 'Secure & Authorized', body: 'The scores on this desk are sample figures. A live bureau check is not connected, and a PDF is not downloaded from here.'))),
            icon: const Icon(Icons.arrow_forward_rounded, color: dashBlue, size: 20),
          ),
        ],
      ),
    );
  }
}
