import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import 'account.dart';
import 'cibil_flow.dart';
import 'customers.dart';
import 'home.dart';
import 'login.dart';
import 'menu.dart';
import 'splash.dart';
import 'store.dart';
import 'toast.dart';
import 'ui.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const BerogetAgentApp());
}

class BerogetAgentApp extends StatefulWidget {
  const BerogetAgentApp({super.key});

  @override
  State<BerogetAgentApp> createState() => _BerogetAgentAppState();
}

class _BerogetAgentAppState extends State<BerogetAgentApp> {
  final store = AgentStore();
  var showSplash = true;
  var signedIn = false;

  @override
  void initState() {
    super.initState();
    store.addListener(_onAuth);
    Future<void>.delayed(const Duration(milliseconds: 450), () {
      if (mounted) setState(() => showSplash = false);
    });
  }

  @override
  void dispose() {
    store.removeListener(_onAuth);
    super.dispose();
  }

  void _onAuth() {
    if (!mounted || store.signedIn == signedIn) return;
    setState(() => signedIn = store.signedIn);
  }

  @override
  Widget build(BuildContext context) {
    return AgentScope(
      store: store,
      child: MaterialApp(
        title: 'Broget AI',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          scaffoldBackgroundColor: paper,
          colorScheme: ColorScheme.fromSeed(seedColor: indigo),
          splashFactory: InkRipple.splashFactory,
          visualDensity: VisualDensity.standard,
          pageTransitionsTheme: const PageTransitionsTheme(
            builders: {
              TargetPlatform.android: CupertinoPageTransitionsBuilder(),
              TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
            },
          ),
        ),
        scrollBehavior: const _SmoothScroll(),
        builder: (context, child) {
          return ColoredBox(
            color: const Color(0xFFE7E4DE),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 430),
                child: Stack(
                  children: [
                    child ?? const SizedBox.shrink(),
                    const AgentToastHost(),
                  ],
                ),
              ),
            ),
          );
        },
        home: showSplash ? const SplashScreen() : signedIn ? const DeskShell() : const LoginScreen(),
      ),
    );
  }
}

class _SmoothScroll extends MaterialScrollBehavior {
  const _SmoothScroll();

  @override
  ScrollPhysics getScrollPhysics(BuildContext context) {
    return const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics());
  }
}

class DeskShell extends StatefulWidget {
  const DeskShell({super.key});

  @override
  State<DeskShell> createState() => _DeskShellState();
}

class _DeskShellState extends State<DeskShell> with WidgetsBindingObserver {
  final scaffoldKey = GlobalKey<ScaffoldState>();
  var index = 0;
  DateTime _synced = DateTime.fromMillisecondsSinceEpoch(0);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) => _sync(force: true));
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) _sync();
  }

  void _sync({bool force = false}) {
    if (!mounted) return;
    final now = DateTime.now();
    if (!force && now.difference(_synced) < const Duration(seconds: 20)) return;
    _synced = now;
    AgentScope.of(context).refreshDesk();
  }

  void go(int value) {
    if (index == value) return;
    setState(() => index = value);
  }

  @override
  Widget build(BuildContext context) {
    return DeskNav(
      index: index,
      openMenu: () => scaffoldKey.currentState?.openDrawer(),
      go: go,
      child: Scaffold(
        key: scaffoldKey,
        backgroundColor: dashWash,
        drawerEnableOpenDragGesture: true,
        drawerEdgeDragWidth: 32,
        drawer: AgentMenu(
          index: index,
          onTab: (value) {
            Navigator.of(context).pop();
            go(value);
          },
          onClose: () => Navigator.of(context).pop(),
        ),
        body: IndexedStack(
          index: index,
          children: const [HomeScreen(), CustomersScreen(), CibilScreen(), AccountScreen()],
        ),
        bottomNavigationBar: _DeskBar(index: index, onPick: go),
      ),
    );
  }
}

class _DeskBar extends StatelessWidget {
  const _DeskBar({required this.index, required this.onPick});

  final int index;
  final ValueChanged<int> onPick;

  @override
  Widget build(BuildContext context) {
    const items = [
      (Icons.home_outlined, Icons.home, 'Home'),
      (Icons.people_outline, Icons.people, 'Customers'),
      (Icons.speed_outlined, Icons.speed, 'CIBIL'),
      (Icons.person_outline, Icons.person, 'Profile'),
    ];
    return Material(
      color: Colors.white,
      child: SafeArea(
        top: false,
        child: Container(
          height: 56,
          decoration: const BoxDecoration(border: Border(top: BorderSide(color: Color(0xFFEEF1F6)))),
          child: Row(
            children: [
              for (var i = 0; i < items.length; i++)
                Expanded(
                  child: InkWell(
                    onTap: () => onPick(i),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(index == i ? items[i].$2 : items[i].$1, size: 22, color: index == i ? dashBlue : const Color(0xFF8B95A7)),
                        const SizedBox(height: 2),
                        Text(items[i].$3, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: index == i ? dashBlue : const Color(0xFF8B95A7))),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
