import 'package:url_launcher/url_launcher.dart';

Future<bool> launchPayment(Uri uri, {String? package}) async {
  try {
    return await launchUrl(uri, mode: LaunchMode.externalApplication);
  } catch (_) {
    return false;
  }
}
