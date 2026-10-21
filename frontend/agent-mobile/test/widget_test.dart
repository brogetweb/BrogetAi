import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:beroget_agent/main.dart';

void main() {
  testWidgets('Agent signs in and opens the desk', (WidgetTester tester) async {
    await tester.binding.setSurfaceSize(const Size(430, 1200));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(const BerogetAgentApp());
    expect(find.text('BerogetAI'), findsWidgets);
    await tester.pump(const Duration(milliseconds: 1500));
    await tester.pumpAndSettle();
    expect(find.text('Welcome Back'), findsOneWidget);

    await tester.enterText(find.byType(TextField).at(0), 'priya@beroget.ai');
    await tester.enterText(find.byType(TextField).at(1), 'short');
    await tester.tap(find.text('Login'));
    await tester.pump();

    expect(find.text('Welcome Back'), findsOneWidget);
    expect(find.text('Could not sign in'), findsOneWidget);
    expect(find.text('Rohit Sharma'), findsNothing);
    await tester.pump(const Duration(seconds: 5));
  });
}
