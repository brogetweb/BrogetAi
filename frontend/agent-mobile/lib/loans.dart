import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'store.dart';
import 'ui.dart';

class LoansScreen extends StatelessWidget {
  const LoansScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final store = AgentScope.of(context);
    final canPop = Navigator.of(context).canPop();
    return Scaffold(
      backgroundColor: paper,
      appBar: canPop ? AppBar(backgroundColor: paper, elevation: 0, foregroundColor: ink, title: const Text('Loan files', style: TextStyle(fontWeight: FontWeight.w800))) : null,
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: ink,
        foregroundColor: Colors.white,
        onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const NewLoanPage())),
        icon: const Icon(Icons.add),
        label: const Text('New file'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 18, 20, 96),
          children: [
            if (!canPop) const Text('Loan files', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w800, letterSpacing: -1, color: ink)),
            const SizedBox(height: 6),
            const Text('A file on this desk is not an approval.', style: TextStyle(color: muted)),
            const SizedBox(height: 16),
            for (final loan in store.loans)
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: SoftCard(
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => LoanPage(id: loan.id))),
                  child: LoanRow(loan: loan, customerName: store.customerById(loan.customerId)?.name ?? 'Customer'),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class LoanRow extends StatelessWidget {
  const LoanRow({required this.loan, required this.customerName, super.key});

  final LoanFile loan;
  final String customerName;

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Expanded(child: Text(loan.id, style: const TextStyle(fontWeight: FontWeight.w800, color: ink))),
        StatusChip(label: loan.status.label, color: loanColor(loan.status)),
      ]),
      const SizedBox(height: 6),
      Text('$customerName · ${loan.purpose}', style: const TextStyle(color: muted)),
      const SizedBox(height: 4),
      Text(inr(loan.amount), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: ink)),
    ]);
  }
}

class LoanPage extends StatelessWidget {
  const LoanPage({required this.id, super.key});

  final String id;

  @override
  Widget build(BuildContext context) {
    final store = AgentScope.of(context);
    LoanFile? loan;
    for (final item in store.loans) {
      if (item.id == id) loan = item;
    }
    if (loan == null) return const Scaffold(body: Center(child: Text('That file is not on this desk.')));
    final file = loan;
    final customer = store.customerById(file.customerId);
    final steps = ['Draft', 'Submitted', 'In review'];
    final active = switch (file.status) {
      LoanStatus.draft => 0,
      LoanStatus.submitted => 1,
      LoanStatus.review || LoanStatus.needsDocs => 2,
    };
    final next = switch (file.status) {
      LoanStatus.draft => 'Mark submitted',
      LoanStatus.submitted => 'Send for review',
      _ => null,
    };
    return Scaffold(
      backgroundColor: paper,
      appBar: AppBar(backgroundColor: paper, elevation: 0, foregroundColor: ink, title: Text(file.id, style: const TextStyle(fontWeight: FontWeight.w800))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: [
          Text(customer?.name ?? 'Customer', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, letterSpacing: -0.8, color: ink)),
          const SizedBox(height: 6),
          Text('${file.purpose} · ${inr(file.amount)}', style: const TextStyle(color: muted, fontSize: 16)),
          const SizedBox(height: 8),
          Text(stamp(file.created), style: const TextStyle(color: muted, fontSize: 13)),
          if (file.note.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(file.note, style: const TextStyle(height: 1.45, color: ink)),
          ],
          const SizedBox(height: 20),
          const Text('Tracking', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: ink)),
          const SizedBox(height: 10),
          for (var index = 0; index < steps.length; index++)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(children: [
                Icon(index <= active ? Icons.check_circle : Icons.circle_outlined, color: index <= active ? indigo : const Color(0xFFCBD5E1), size: 20),
                const SizedBox(width: 10),
                Text(steps[index], style: TextStyle(fontWeight: index == active ? FontWeight.w800 : FontWeight.w500, color: index <= active ? ink : muted)),
              ]),
            ),
          if (file.status == LoanStatus.needsDocs)
            const Padding(
              padding: EdgeInsets.only(top: 4, bottom: 8),
              child: Text('This file is waiting on a document. Add the copy on the customer page.', style: TextStyle(color: Color(0xFFB45309), height: 1.4)),
            ),
          const SizedBox(height: 8),
          if (next != null) DeskButton(label: next, onPressed: () => store.advance(file)),
          if (file.status == LoanStatus.review)
            const Text('Waiting on the desk. Approval is not decided in this app.', style: TextStyle(color: muted, height: 1.4)),
        ],
      ),
    );
  }
}

class NewLoanPage extends StatefulWidget {
  const NewLoanPage({super.key});

  @override
  State<NewLoanPage> createState() => _NewLoanPageState();
}

class _NewLoanPageState extends State<NewLoanPage> {
  static const purposes = ['Travel', 'Personal'];
  final amount = TextEditingController();
  final note = TextEditingController();
  String? customerId;
  var purpose = purposes.first;
  var error = '';

  @override
  void dispose() {
    amount.dispose();
    note.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final store = AgentScope.of(context);
    if (store.customers.isEmpty) {
      return Scaffold(
        backgroundColor: paper,
        appBar: AppBar(backgroundColor: paper, elevation: 0, foregroundColor: ink, title: const Text('New loan file', style: TextStyle(fontWeight: FontWeight.w800))),
        body: const Center(child: Text('Add a customer before you open a loan file.', style: TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF5C677A)))),
      );
    }
    final selected = customerId ?? store.customers.first.id;
    return Scaffold(
      backgroundColor: paper,
      appBar: AppBar(backgroundColor: paper, elevation: 0, foregroundColor: ink, title: const Text('New loan file', style: TextStyle(fontWeight: FontWeight.w800))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
        children: [
          DropdownButtonFormField<String>(
            initialValue: selected,
            decoration: deskField('Customer', ''),
            items: [for (final customer in store.customers) DropdownMenuItem(value: customer.id, child: Text(customer.name))],
            onChanged: (value) => setState(() => customerId = value),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: amount,
            keyboardType: TextInputType.number,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            decoration: deskField('Amount', '250000'),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: purpose,
            decoration: deskField('Purpose', ''),
            items: [for (final item in purposes) DropdownMenuItem(value: item, child: Text(item))],
            onChanged: (value) => setState(() => purpose = value ?? purpose),
          ),
          const SizedBox(height: 12),
          TextField(controller: note, minLines: 2, maxLines: 4, decoration: deskField('Note', 'What the trip or the request is for')),
          if (error.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(error, style: const TextStyle(color: Color(0xFFB45309), fontWeight: FontWeight.w600)),
          ],
          const SizedBox(height: 20),
          DeskButton(
            label: 'Save as draft',
            onPressed: () {
              final value = int.tryParse(amount.text) ?? 0;
              if (value < 10000) {
                setState(() => error = 'Amount starts at ₹10,000.');
                return;
              }
              store.addLoan(customerId: customerId ?? selected, amount: value, purpose: purpose, note: note.text);
              Navigator.of(context).pop();
            },
          ),
          const SizedBox(height: 12),
          const Text('A draft stays on this device. It is not submitted to a lender.', style: TextStyle(color: muted, height: 1.4)),
        ],
      ),
    );
  }
}
