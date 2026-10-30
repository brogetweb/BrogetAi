import 'package:broget_book/main.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Splash opens Broget AI', (tester) async {
    await tester.pumpWidget(const BrogetBookApp());
    expect(find.textContaining('Broget'), findsWidgets);
    expect(find.textContaining('TRAVEL EASY'), findsOneWidget);
    await tester.pump(const Duration(milliseconds: 2600));
    await tester.pumpAndSettle();
  });
}
