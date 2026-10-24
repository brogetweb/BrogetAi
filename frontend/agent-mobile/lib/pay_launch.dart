import 'dart:io';

import 'package:android_intent_plus/android_intent.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

const _upiPackages = [
  'com.phonepe.app',
  'com.google.android.apps.nbu.paisa.user',
  'net.one97.paytm',
  'in.org.npci.upiapp',
];

Future<bool> launchPayment(Uri uri) async {
  if (Platform.isAndroid && uri.scheme == 'upi') {
    for (final package in _upiPackages) {
      try {
        await AndroidIntent(action: 'action_view', data: uri.toString(), package: package).launch();
        return true;
      } on PlatformException {
        continue;
      } catch (_) {
        continue;
      }
    }
    try {
      await AndroidIntent(action: 'action_view', data: uri.toString()).launch();
      return true;
    } on PlatformException {
      // No UPI app accepted the explicit intent.
    } catch (_) {}
  }
  try {
    return await launchUrl(uri, mode: LaunchMode.externalApplication);
  } catch (_) {
    return false;
  }
}
