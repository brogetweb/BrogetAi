import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'app_nav.dart';
import 'booking_store.dart';
import 'profile_store.dart';
import 'responsive.dart';
import 'splash.dart';
import 'theme.dart';
import 'toast.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
    systemNavigationBarColor: Colors.white,
    systemNavigationBarIconBrightness: Brightness.dark,
  ));
  await Future.wait([
    ProfileStore.instance.hydrate(),
    BookingStore.instance.hydrate(),
  ]);
  runApp(const BrogetBookApp());
}

class BrogetBookApp extends StatelessWidget {
  const BrogetBookApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Book by Broget AI',
      debugShowCheckedModeBanner: false,
      navigatorKey: bookNavigatorKey,
      theme: bookTheme(),
      builder: (context, child) {
        final media = MediaQuery.of(context);
        return MediaQuery(
          data: media.copyWith(
            textScaler: BookLayout.clampedTextScaler(context),
          ),
          child: Stack(
            fit: StackFit.expand,
            children: [
              child ?? const SizedBox.shrink(),
              const BookToastLayer(),
            ],
          ),
        );
      },
      home: const SplashPage(),
    );
  }
}
