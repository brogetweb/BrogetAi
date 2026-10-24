import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:beroget_agent/main.dart';
import 'package:beroget_agent/store.dart';
import 'package:beroget_agent/ui.dart';

void main() {
  testWidgets('Agent signs in and opens the desk', (WidgetTester tester) async {
    await tester.binding.setSurfaceSize(const Size(430, 1200));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(const BerogetAgentApp());
    expect(find.text('Broget AI'), findsWidgets);
    await tester.pump(const Duration(milliseconds: 1500));
    await tester.pumpAndSettle();
    expect(find.text('Welcome Back'), findsOneWidget);

    await tester.enterText(find.byType(TextField).at(0), 'priya@brogetai.com');
    await tester.enterText(find.byType(TextField).at(1), 'short');
    await tester.tap(find.text('Login'));
    await tester.pump();

    expect(find.text('Welcome Back'), findsOneWidget);
    expect(find.text('Could not sign in'), findsOneWidget);
    expect(find.text('Rohit Sharma'), findsNothing);
    await tester.pump(const Duration(seconds: 5));
  });

  testWidgets('desk screens fit a phone', (tester) async {
    await tester.binding.setSurfaceSize(const Size(360, 780));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    final store = AgentStore()
      ..agentName = 'Md Gafru'
      ..agentCode = 'BG9604'
      ..agentPhone = '9876543210'
      ..agentEmail = 'agent@brogetai.com'
      ..desk = 'Sangli';
    await tester.pumpWidget(AgentScope(
      store: store,
      child: const MaterialApp(home: DeskShell()),
    ));
    await tester.pump();
    expect(tester.takeException(), isNull);

    for (final label in ['Customers', 'CIBIL', 'Profile', 'Home']) {
      await tester.tap(find.text(label));
      await tester.pump();
      expect(tester.takeException(), isNull);
    }

    await tester.tap(find.byIcon(Icons.menu_rounded).first);
    await tester.pumpAndSettle();
    expect(find.text('Check CIBIL Report'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
