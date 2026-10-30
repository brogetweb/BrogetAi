import 'dart:io';

import 'package:android_intent_plus/android_intent.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

Future<bool> _openUpi(Uri uri, String? package) async {
  try {
    await AndroidIntent(action: 'action_view', data: uri.toString(), package: package).launch();
    return true;
  } on PlatformException {
    return false;
  } catch (_) {
    return false;
  }
}

Future<bool> launchPayment(Uri uri, {String? package}) async {
  if (Platform.isAndroid && uri.scheme == 'upi') {
    if (package != null && await _openUpi(uri, package)) return true;
    return _openUpi(uri, null);
  }
  try {
    return await launchUrl(uri, mode: LaunchMode.externalApplication);
  } catch (_) {
    return false;
  }
}
