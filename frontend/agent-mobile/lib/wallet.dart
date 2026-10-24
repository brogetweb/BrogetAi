import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

import 'api.dart';
import 'pay_launch.dart' if (dart.library.html) 'pay_launch_web.dart';
import 'store.dart';
import 'ui.dart';

String _when(DateTime at) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  final hour = at.hour % 12 == 0 ? 12 : at.hour % 12;
  final minute = at.minute.toString().padLeft(2, '0');
  final mark = at.hour < 12 ? 'AM' : 'PM';
  return '${at.day} ${months[at.month - 1]} ${at.year}, $hour:$minute $mark';
}

class WalletStrip extends StatelessWidget {
  const WalletStrip({super.key});

  @override
  Widget build(BuildContext context) {
    final store = AgentScope.of(context);
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const WalletPage())),
        child: Container(
          padding: const EdgeInsets.fromLTRB(14, 12, 12, 12),
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(18), border: Border.all(color: const Color(0xFFEEF1F6))),
          child: Row(
            children: [
              Container(
                width: 42,
                height: 42,
                alignment: Alignment.center,
                decoration: BoxDecoration(color: const Color(0xFFEAF1FF), borderRadius: BorderRadius.circular(14)),
                child: const Icon(Icons.account_balance_wallet_outlined, color: dashBlue),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Wallet', style: TextStyle(fontWeight: FontWeight.w800, color: dashNavy, fontSize: 14)),
                    const SizedBox(height: 2),
                    Text(store.lowBalance ? 'Low balance · ${inr(store.walletBalance)}' : inr(store.walletBalance), style: TextStyle(color: store.lowBalance ? const Color(0xFFDC2626) : const Color(0xFF8B95A7), fontWeight: FontWeight.w700, fontSize: 12)),
                  ],
                ),
              ),
              const Text('Add money', style: TextStyle(color: dashBlue, fontWeight: FontWeight.w800, fontSize: 13)),
            ],
          ),
        ),
      ),
    );
  }
}

class WalletPage extends StatelessWidget {
  const WalletPage({super.key});

  @override
  Widget build(BuildContext context) {
    final store = AgentScope.of(context);
    final last = store.lastWalletEntry;
    return Scaffold(
      backgroundColor: dashWash,
      appBar: AppBar(backgroundColor: dashWash, elevation: 0, foregroundColor: dashNavy, title: const Text('Wallet', style: TextStyle(fontWeight: FontWeight.w800))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(22),
              gradient: const LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFF1D4ED8), Color(0xFF2F6BFF)]),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.account_balance_wallet_outlined, color: Colors.white, size: 18),
                    SizedBox(width: 8),
                    Text('Current balance', style: TextStyle(color: Color(0xFFD6E4FF), fontWeight: FontWeight.w700)),
                  ],
                ),
                const SizedBox(height: 8),
                Text(inr(store.walletBalance), style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w800, letterSpacing: -0.8)),
                const SizedBox(height: 6),
                Text('Each credit check takes ${inr(store.chargeRupees)} from this wallet. Add money here before the next check.', style: const TextStyle(color: Color(0xFFD6E4FF), fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 14),
                Row(
                  children: [
                    _WhiteAction(icon: Icons.add, label: 'Add money', onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AddMoneyPage()))),
                    const SizedBox(width: 8),
                    _WhiteAction(icon: Icons.receipt_long_outlined, label: 'History', onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const WalletHistoryPage()))),
                    const SizedBox(width: 8),
                    _WhiteAction(icon: Icons.south_west, label: 'Withdraw', onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const WithdrawPage()))),
                  ],
                ),
              ],
            ),
          ),
          if (store.lowBalance) ...[
            const SizedBox(height: 12),
            const LowBalanceBanner(),
          ],
          const SizedBox(height: 16),
          const Text('Wallet summary', style: TextStyle(fontWeight: FontWeight.w800, color: dashNavy, fontSize: 16)),
          const SizedBox(height: 10),
          Row(
            children: [
              _Summary(label: 'Total added', value: inr(store.walletAdded), color: const Color(0xFF16A34A), icon: Icons.arrow_downward),
              const SizedBox(width: 10),
              _Summary(label: 'Total withdrawn', value: inr(store.walletUsed), color: const Color(0xFFDC2626), icon: Icons.arrow_upward),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _Summary(label: 'Current balance', value: inr(store.walletBalance), color: dashBlue, icon: Icons.account_balance_wallet_outlined),
              const SizedBox(width: 10),
              _Summary(label: 'Last movement', value: last == null ? 'None yet' : _when(last.at), color: const Color(0xFF64748B), icon: Icons.schedule),
            ],
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              const Expanded(child: Text('Recent', style: TextStyle(fontWeight: FontWeight.w800, color: dashNavy, fontSize: 16))),
              TextButton(onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const WalletHistoryPage())), child: const Text('View all')),
            ],
          ),
          if (store.wallet.isEmpty)
            const _Empty(text: 'No wallet movement yet. Add money through Broget Pay.')
          else
            ...store.wallet.take(5).map((entry) => _EntryTile(entry: entry)),
          const SizedBox(height: 8),
          const Text('Add money opens Broget Pay. The balance changes only after Broget Pay confirms the payment.', style: TextStyle(color: Color(0xFF8B95A7), fontSize: 12, height: 1.4)),
        ],
      ),
    );
  }
}

class AddMoneyPage extends StatefulWidget {
  const AddMoneyPage({super.key});

  @override
  State<AddMoneyPage> createState() => _AddMoneyPageState();
}

class _AddMoneyPageState extends State<AddMoneyPage> {
  final amount = TextEditingController();
  final mobile = TextEditingController();
  String? error;
  var filledPhone = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (filledPhone) return;
    filledPhone = true;
    final phone = AgentScope.of(context).agentPhone.replaceAll(RegExp(r'\D'), '');
    if (phone.length >= 10) mobile.text = phone.substring(phone.length - 10);
  }

  @override
  void dispose() {
    amount.dispose();
    mobile.dispose();
    super.dispose();
  }

  void pick(int value) => setState(() => amount.text = '$value');

  var sending = false;

  Future<void> next() async {
    final parsed = double.tryParse(amount.text.trim());
    final phone = mobile.text.trim();
    if (parsed == null || parsed < 300) {
      setState(() => error = 'Broget Pay accepts ₹300 or more.');
      return;
    }
    if (parsed > 500000) {
      setState(() => error = 'The most you can add in one payment is ₹5,00,000.');
      return;
    }
    if (!RegExp(r'^[6-9]\d{9}$').hasMatch(phone)) {
      setState(() => error = 'Enter a 10-digit mobile number.');
      return;
    }
    final store = AgentScope.of(context);
    setState(() {
      sending = true;
      error = null;
    });
    try {
      final link = await createWalletTopup(accessToken: store.accessToken, amount: parsed, mobile: phone);
      if (!mounted) return;
      await Navigator.of(context).push(MaterialPageRoute(builder: (_) => PayinWaitingPage(amount: parsed, paymentUrl: link.paymentUrl, upiUrl: link.upiUrl, checkoutUrl: link.checkoutUrl)));
    } on ApiException catch (caught) {
      if (mounted) setState(() => error = caught.message);
    } finally {
      if (mounted) setState(() => sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: dashWash,
      appBar: AppBar(backgroundColor: dashWash, elevation: 0, foregroundColor: dashNavy, title: const Text('Add money', style: TextStyle(fontWeight: FontWeight.w800))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
        children: [
          const Text('Enter amount', style: TextStyle(fontWeight: FontWeight.w800, color: dashNavy)),
          const SizedBox(height: 8),
          TextField(
            controller: amount,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9.]'))],
            decoration: const InputDecoration(prefixText: '₹ ', filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(14)), borderSide: BorderSide(color: Color(0xFFEEF1F6)))),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            children: [500, 1000, 2000, 5000].map((value) {
              final selected = amount.text == '$value';
              return ChoiceChip(
                label: Text('₹$value'),
                selected: selected,
                onSelected: (_) => pick(value),
                selectedColor: const Color(0xFFEAF1FF),
                labelStyle: TextStyle(fontWeight: FontWeight.w800, color: selected ? dashBlue : dashNavy),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          const Text('Mobile for the payment', style: TextStyle(fontWeight: FontWeight.w800, color: dashNavy)),
          const SizedBox(height: 8),
          TextField(
            controller: mobile,
            keyboardType: TextInputType.phone,
            maxLength: 10,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            decoration: const InputDecoration(counterText: '', filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(14)), borderSide: BorderSide(color: Color(0xFFEEF1F6)))),
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: const Color(0xFFFFF6E5), borderRadius: BorderRadius.circular(16)),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Broget Pay', style: TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF92400E))),
                SizedBox(height: 6),
                Text('The payment page is Broget Pay. UPI, QR, net banking, and cards are collected there.', style: TextStyle(color: Color(0xFF92400E), height: 1.4, fontSize: 13)),
                SizedBox(height: 4),
                Text('This wallet updates only after Broget Pay confirms the payment.', style: TextStyle(color: Color(0xFF92400E), height: 1.4, fontSize: 13)),
              ],
            ),
          ),
          if (error != null) ...[
            const SizedBox(height: 12),
            Text(error!, style: const TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w700)),
          ],
          const SizedBox(height: 18),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: dashBlue, minimumSize: const Size.fromHeight(48), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
            onPressed: sending ? null : next,
            child: Text(sending ? 'Opening payment…' : 'Proceed to pay', style: const TextStyle(fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }
}

class PayinWaitingPage extends StatefulWidget {
  const PayinWaitingPage({super.key, required this.amount, required this.paymentUrl, this.upiUrl = '', this.checkoutUrl = ''});

  final double amount;
  final String paymentUrl;
  final String upiUrl;
  final String checkoutUrl;

  @override
  State<PayinWaitingPage> createState() => _PayinWaitingPageState();
}

Uri? _paymentUri(String url) {
  final value = url.trim();
  if (value.isEmpty) return null;
  try {
    return _paymentUriParsed(value);
  } catch (_) {
    return Uri.tryParse(value);
  }
}

Uri? _paymentUriParsed(String value) {
  if (value.startsWith('upi:')) {
    final query = value.contains('?') ? value.substring(value.indexOf('?') + 1) : '';
    final params = <String, String>{};
    for (final part in query.split('&')) {
      if (part.isEmpty) continue;
      final eq = part.indexOf('=');
      final key = Uri.decodeQueryComponent(eq >= 0 ? part.substring(0, eq) : part);
      final raw = eq >= 0 ? part.substring(eq + 1) : '';
      params[key] = Uri.decodeQueryComponent(raw.replaceAll('+', '%20'));
    }
    return Uri(scheme: 'upi', host: 'pay', queryParameters: params);
  }
  return Uri.tryParse(value);
}

class _PayinWaitingPageState extends State<PayinWaitingPage> {
  var refreshing = false;
  var opening = false;
  String? openError;
  var started = false;
  WebViewController? web;

  Uri? _pageUri() {
    if (widget.checkoutUrl.startsWith('https://')) return Uri.tryParse(widget.checkoutUrl);
    if (widget.paymentUrl.startsWith('https://')) return Uri.tryParse(widget.paymentUrl);
    return null;
  }

  @override
  void initState() {
    super.initState();
    final page = _pageUri();
    if (page != null) {
      web = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setNavigationDelegate(NavigationDelegate(
          onNavigationRequest: (request) {
            final target = _paymentUri(request.url);
            if (request.url.startsWith('upi:') || request.url.startsWith('intent:')) {
              if (target != null) launchPayment(target);
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ))
        ..loadRequest(page);
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Future<void>.delayed(const Duration(milliseconds: 400), () {
        if (!mounted || started) return;
        started = true;
        openPay();
      });
    });
  }

  Future<void> openPay({bool fromUser = false}) async {
    setState(() {
      opening = true;
      if (fromUser) openError = null;
    });
    final uri = _paymentUri(widget.upiUrl);
    final opened = uri == null ? false : await launchPayment(uri);
    if (!mounted) return;
    setState(() {
      opening = false;
      openError = opened || !fromUser ? null : 'PhonePe, GPay, or Paytm did not open. Use the payment page below.';
    });
  }

  Future<void> refresh() async {
    setState(() => refreshing = true);
    try {
      await AgentScope.of(context).loadWallet();
    } on ApiException catch (caught) {
      if (mounted) AgentScope.of(context).showToast(false, 'Wallet', caught.message);
    } finally {
      if (mounted) setState(() => refreshing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final page = web;
    return Scaffold(
      backgroundColor: dashWash,
      appBar: AppBar(backgroundColor: dashWash, elevation: 0, foregroundColor: dashNavy, title: Text('Pay ${inr(widget.amount)}', style: const TextStyle(fontWeight: FontWeight.w800))),
      body: Column(
        children: [
          if (page != null) Expanded(child: WebViewWidget(controller: page)),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            child: Column(
              children: [
                if (openError != null) ...[
                  Text(openError!, style: const TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w700)),
                  const SizedBox(height: 10),
                ],
                FilledButton(
                  style: FilledButton.styleFrom(backgroundColor: dashBlue, minimumSize: const Size.fromHeight(48), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                  onPressed: opening ? null : () => openPay(fromUser: true),
                  child: Text(opening ? 'Opening UPI…' : 'Pay with UPI', style: const TextStyle(fontWeight: FontWeight.w800)),
                ),
                const SizedBox(height: 10),
                OutlinedButton(
                  style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(48), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                  onPressed: refreshing ? null : refresh,
                  child: Text(refreshing ? 'Checking…' : 'Refresh wallet', style: const TextStyle(fontWeight: FontWeight.w800)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class WithdrawPage extends StatefulWidget {
  const WithdrawPage({super.key});

  @override
  State<WithdrawPage> createState() => _WithdrawPageState();
}

class _WithdrawPageState extends State<WithdrawPage> {
  final amount = TextEditingController();
  final holder = TextEditingController();
  final bank = TextEditingController();
  final account = TextEditingController();
  final ifsc = TextEditingController();
  final mobile = TextEditingController();
  String? error;
  var filled = false;
  var sending = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (filled) return;
    filled = true;
    final store = AgentScope.of(context);
    holder.text = store.agentName;
    final phone = store.agentPhone.replaceAll(RegExp(r'\D'), '');
    if (phone.length >= 10) mobile.text = phone.substring(phone.length - 10);
  }

  @override
  void dispose() {
    amount.dispose();
    holder.dispose();
    bank.dispose();
    account.dispose();
    ifsc.dispose();
    mobile.dispose();
    super.dispose();
  }

  Future<void> submit() async {
    final store = AgentScope.of(context);
    final parsed = double.tryParse(amount.text.trim());
    final code = ifsc.text.trim().toUpperCase();
    if (parsed == null || parsed < 1) {
      setState(() => error = 'Enter the amount to withdraw.');
      return;
    }
    if (parsed > store.walletBalance) {
      setState(() => error = 'Low balance');
      return;
    }
    if (holder.text.trim().length < 3 || bank.text.trim().length < 3) {
      setState(() => error = 'Enter the account holder and the bank name.');
      return;
    }
    if (!RegExp(r'^\d{9,18}$').hasMatch(account.text.trim())) {
      setState(() => error = 'Enter the bank account number.');
      return;
    }
    if (!RegExp(r'^[A-Z]{4}0[A-Z0-9]{6}$').hasMatch(code)) {
      setState(() => error = 'Enter a valid IFSC code.');
      return;
    }
    if (!RegExp(r'^[6-9]\d{9}$').hasMatch(mobile.text.trim())) {
      setState(() => error = 'Enter a 10-digit mobile number.');
      return;
    }
    setState(() {
      sending = true;
      error = null;
    });
    try {
      await createWalletPayout(
        accessToken: store.accessToken,
        amount: parsed,
        mobile: mobile.text.trim(),
        holderName: holder.text.trim(),
        bankName: bank.text.trim(),
        accountNumber: account.text.trim(),
        ifsc: code,
      );
      await store.loadWallet();
      if (!mounted) return;
      Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => WithdrawWaitingPage(amount: parsed)));
    } on ApiException catch (caught) {
      if (mounted) setState(() => error = caught.message);
    } finally {
      if (mounted) setState(() => sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final balance = AgentScope.of(context).walletBalance;
    return Scaffold(
      backgroundColor: dashWash,
      appBar: AppBar(backgroundColor: dashWash, elevation: 0, foregroundColor: dashNavy, title: const Text('Withdraw', style: TextStyle(fontWeight: FontWeight.w800))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
        children: [
          Text('Available ${inr(balance)}', style: const TextStyle(color: Color(0xFF8B95A7), fontWeight: FontWeight.w700)),
          const SizedBox(height: 12),
          _Field(controller: amount, label: 'Amount', keyboard: const TextInputType.numberWithOptions(decimal: true)),
          _Field(controller: holder, label: 'Account holder'),
          _Field(controller: bank, label: 'Bank name'),
          _Field(controller: account, label: 'Account number', keyboard: TextInputType.number),
          _Field(controller: ifsc, label: 'IFSC'),
          _Field(controller: mobile, label: 'Mobile', keyboard: TextInputType.phone),
          if (error != null) Text(error!, style: const TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          const Text('Broget Pay sends this to the bank. The wallet is reduced only after the payout succeeds.', style: TextStyle(color: Color(0xFF8B95A7), fontSize: 12, height: 1.4)),
          const SizedBox(height: 16),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: dashBlue, minimumSize: const Size.fromHeight(48), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
            onPressed: sending ? null : submit,
            child: const Text('Request payout', style: TextStyle(fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }
}

class WithdrawWaitingPage extends StatelessWidget {
  const WithdrawWaitingPage({required this.amount, super.key});

  final double amount;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: dashWash,
      appBar: AppBar(backgroundColor: dashWash, elevation: 0, foregroundColor: dashNavy, title: const Text('Payout', style: TextStyle(fontWeight: FontWeight.w800))),
      body: Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.account_balance_outlined, color: dashBlue, size: 40),
            const SizedBox(height: 12),
            const Text('Payout requested', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: dashNavy)),
            const SizedBox(height: 6),
            Text(inr(amount), style: const TextStyle(color: Color(0xFF8B95A7), fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            const Text('The amount is held. If Broget Pay marks the payout failed, it returns to the wallet.', style: TextStyle(color: Color(0xFF64748B), height: 1.45)),
            const Spacer(),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: dashBlue, minimumSize: const Size.fromHeight(48), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Back to wallet', style: TextStyle(fontWeight: FontWeight.w800)),
            ),
          ],
        ),
      ),
    );
  }
}

class WalletHistoryPage extends StatefulWidget {
  const WalletHistoryPage({super.key});

  @override
  State<WalletHistoryPage> createState() => _WalletHistoryPageState();
}

class _WalletHistoryPageState extends State<WalletHistoryPage> {
  var filter = 'All';

  @override
  Widget build(BuildContext context) {
    final entries = AgentScope.of(context).wallet.where((entry) {
      if (filter == 'Top up') return entry.kind == WalletKind.topUp;
      if (filter == 'Usage') return entry.kind == WalletKind.usage;
      if (filter == 'Withdraw') return entry.kind == WalletKind.withdraw;
      return true;
    });
    return Scaffold(
      backgroundColor: dashWash,
      appBar: AppBar(backgroundColor: dashWash, elevation: 0, foregroundColor: dashNavy, title: const Text('Transactions', style: TextStyle(fontWeight: FontWeight.w800))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
        children: [
          Wrap(
            spacing: 8,
            children: ['All', 'Top up', 'Usage', 'Withdraw'].map((label) {
              final selected = filter == label;
              return ChoiceChip(
                label: Text(label),
                selected: selected,
                onSelected: (_) => setState(() => filter = label),
                selectedColor: const Color(0xFFEAF1FF),
                labelStyle: TextStyle(fontWeight: FontWeight.w800, color: selected ? dashBlue : dashNavy),
              );
            }).toList(),
          ),
          const SizedBox(height: 12),
          if (entries.isEmpty) const _Empty(text: 'Nothing in this list yet.') else ...entries.map((entry) => _EntryTile(entry: entry)),
        ],
      ),
    );
  }
}

class _WhiteAction extends StatelessWidget {
  const _WhiteAction({required this.icon, required this.label, required this.onTap});

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Column(
              children: [
                Icon(icon, color: dashBlue, size: 18),
                const SizedBox(height: 4),
                Text(label, style: const TextStyle(color: dashNavy, fontSize: 11, fontWeight: FontWeight.w800)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Summary extends StatelessWidget {
  const _Summary({required this.label, required this.value, required this.color, required this.icon});

  final String label;
  final String value;
  final Color color;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFEEF1F6))),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 16, color: color),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(color: Color(0xFF8B95A7), fontSize: 11, fontWeight: FontWeight.w700)),
            const SizedBox(height: 2),
            Text(value, style: const TextStyle(color: dashNavy, fontWeight: FontWeight.w800, fontSize: 13)),
          ],
        ),
      ),
    );
  }
}

class _EntryTile extends StatelessWidget {
  const _EntryTile({required this.entry});

  final WalletEntry entry;

  @override
  Widget build(BuildContext context) {
    final topUp = entry.kind == WalletKind.topUp;
    final title = entry.note == 'Test balance'
        ? 'Test balance'
        : switch (entry.kind) {
            WalletKind.topUp => 'Wallet top up',
            WalletKind.usage => 'Service usage',
            WalletKind.withdraw => 'Withdraw',
          };
    final color = entry.status == WalletStatus.failed
        ? const Color(0xFFDC2626)
        : entry.status == WalletStatus.pending
            ? const Color(0xFFD97706)
            : topUp
                ? const Color(0xFF16A34A)
                : const Color(0xFFDC2626);
    final status = switch (entry.status) {
      WalletStatus.pending => 'Pending',
      WalletStatus.success => 'Success',
      WalletStatus.failed => 'Failed',
    };
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFEEF1F6))),
      child: Row(
        children: [
          Icon(topUp ? Icons.south_west : Icons.north_east, color: color, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy)),
                Text('${_when(entry.at)} · ${entry.id}', style: const TextStyle(color: Color(0xFF8B95A7), fontSize: 11, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('${topUp ? '+' : '-'}${inr(entry.amount)}', style: TextStyle(fontWeight: FontWeight.w800, color: color)),
              Text(status, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w700)),
            ],
          ),
        ],
      ),
    );
  }
}

class _Field extends StatelessWidget {
  const _Field({required this.controller, required this.label, this.keyboard});

  final TextEditingController controller;
  final String label;
  final TextInputType? keyboard;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: TextField(
        controller: controller,
        keyboardType: keyboard,
        textCapitalization: label == 'IFSC' ? TextCapitalization.characters : TextCapitalization.words,
        decoration: InputDecoration(
          labelText: label,
          filled: true,
          fillColor: Colors.white,
          border: const OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(14)), borderSide: BorderSide(color: Color(0xFFEEF1F6))),
        ),
      ),
    );
  }
}

class LowBalanceBanner extends StatelessWidget {
  const LowBalanceBanner({super.key});

  @override
  Widget build(BuildContext context) {
    final store = AgentScope.of(context);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: const Color(0xFFFFF1F2), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFFECACA))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Low balance', style: TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w800, fontSize: 16)),
          const SizedBox(height: 4),
          Text('A credit check needs ${inr(store.chargeRupees)}. Add money with Broget Pay before the next API hit.', style: const TextStyle(color: Color(0xFF991B1B), height: 1.4, fontSize: 13)),
        ],
      ),
    );
  }
}

class _Empty extends StatelessWidget {
  const _Empty({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFEEF1F6))),
      child: Text(text, style: const TextStyle(color: Color(0xFF8B95A7), height: 1.4, fontWeight: FontWeight.w600)),
    );
  }
}
