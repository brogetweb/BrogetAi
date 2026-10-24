import 'package:url_launcher/url_launcher.dart';

Future<bool> launchPayment(Uri uri) async {
  try {
    return await launchUrl(uri, mode: LaunchMode.externalApplication);
  } catch (_) {
    return false;
  }
}
