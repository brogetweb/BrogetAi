import 'dart:convert';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

import 'api.dart';
import 'store.dart';
import 'ui.dart';

class KycDocumentsPage extends StatefulWidget {
  const KycDocumentsPage({super.key});

  @override
  State<KycDocumentsPage> createState() => _KycDocumentsPageState();
}

class _KycDocumentsPageState extends State<KycDocumentsPage> {
  var aadhaar = false;
  var pan = false;
  var selfie = false;
  var address = false;
  var submitted = false;
  var sending = false;
  var error = '';
  final files = <String, ({String name, String data})>{};

  bool get ready => aadhaar && pan && selfie;

  Future<void> pick(String kind, void Function(bool) mark) async {
    final result = await FilePicker.platform.pickFiles(
      withData: true,
      type: FileType.custom,
      allowedExtensions: const ['jpg', 'jpeg', 'png', 'pdf'],
    );
    final file = result?.files.single;
    if (file == null || file.bytes == null) return;
    if (file.size > 5 * 1024 * 1024) {
      setState(() => error = 'Each file must be 5 MB or smaller.');
      return;
    }
    setState(() {
      files[kind] = (name: file.name, data: base64Encode(file.bytes!));
      mark(true);
      submitted = false;
      error = '';
    });
  }

  Future<void> submit() async {
    if (!ready) {
      setState(() => error = 'Add Aadhaar, PAN, and a selfie before you submit.');
      return;
    }
    final store = AgentScope.of(context);
    setState(() => sending = true);
    try {
      for (final entry in files.entries) {
        await submitKycDocument(accessToken: store.accessToken, kind: entry.key, fileName: entry.value.name, dataBase64: entry.value.data);
      }
      if (!mounted) return;
      setState(() {
        sending = false;
        submitted = true;
        error = '';
      });
      store.showToast(true, 'KYC submitted', 'The documents are with the super admin.');
    } on ApiException catch (caught) {
      if (!mounted) return;
      setState(() {
        sending = false;
        error = caught.message;
      });
      store.showToast(false, 'Could not submit KYC', caught.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = AgentScope.of(context);
    final step = submitted ? 1 : 0;
    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                children: [
                  _Bar(store: store),
                  const SizedBox(height: 16),
                  const Text('KYC Documents', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, letterSpacing: -0.5, color: dashNavy)),
                  const SizedBox(height: 4),
                  const Text('Please upload the required documents to complete your KYC verification.', style: TextStyle(color: Color(0xFF8B95A7), fontSize: 13, height: 1.35)),
                  const SizedBox(height: 16),
                  _Steps(step: step),
                  const SizedBox(height: 14),
                  _DocCard(
                    icon: const Icon(Icons.fingerprint, color: Color(0xFFF97316), size: 22),
                    iconWash: const Color(0xFFFFF1E6),
                    title: 'Aadhaar Card',
                    required: true,
                    hint: 'Upload clear photo or PDF (Front Side)',
                    verified: false,
                    pending: aadhaar,
                    attached: aadhaar,
                    onUpload: () => pick('Aadhaar', (value) => aadhaar = value),
                    onRemove: () => setState(() {
                      aadhaar = false;
                      files.remove('Aadhaar');
                      submitted = false;
                    }),
                    uploadLabel: 'Upload Document',
                    uploadNote: 'JPG, PNG or PDF (Max 5 MB)',
                    preview: Text(files['Aadhaar']?.name ?? 'Aadhaar', style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy)),
                  ),
                  const SizedBox(height: 12),
                  _DocCard(
                    icon: const _PanMark(),
                    iconWash: const Color(0xFFEAF1FF),
                    title: 'PAN Card',
                    required: true,
                    hint: 'Upload clear photo or PDF',
                    verified: false,
                    pending: pan,
                    attached: pan,
                    onUpload: () => pick('PAN', (value) => pan = value),
                    onRemove: () => setState(() {
                      pan = false;
                      files.remove('PAN');
                      submitted = false;
                    }),
                    uploadLabel: 'Upload Document',
                    uploadNote: 'JPG, PNG or PDF (Max 5 MB)',
                    preview: Text(files['PAN']?.name ?? 'PAN', style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy)),
                  ),
                  const SizedBox(height: 12),
                  _DocCard(
                    icon: const Icon(Icons.account_circle_outlined, color: dashBlue, size: 22),
                    iconWash: const Color(0xFFEAF1FF),
                    title: 'Selfie with Photo',
                    required: true,
                    hint: 'Take a clear selfie (Your face should be clearly visible)',
                    verified: false,
                    pending: selfie,
                    attached: selfie,
                    onUpload: () => pick('Selfie', (value) => selfie = value),
                    onRemove: () => setState(() {
                      selfie = false;
                      files.remove('Selfie');
                      submitted = false;
                    }),
                    uploadLabel: 'Take Photo',
                    uploadNote: 'or select from gallery',
                    camera: true,
                    preview: Text(files['Selfie']?.name ?? 'Selfie', style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy)),
                  ),
                  const SizedBox(height: 12),
                  _DocCard(
                    icon: const Icon(Icons.home_outlined, color: Color(0xFFEA580C), size: 22),
                    iconWash: const Color(0xFFFFF6E5),
                    title: 'Address Proof',
                    required: false,
                    hint: 'Upload any one: Electricity Bill, Bank Statement, Rent Agreement etc.',
                    verified: false,
                    pending: address,
                    attached: address,
                    onUpload: () => pick('Address', (value) => address = value),
                    onRemove: () => setState(() {
                      address = false;
                      files.remove('Address');
                    }),
                    uploadLabel: 'Upload Document',
                    uploadNote: 'JPG, PNG or PDF (Max 5 MB)',
                    preview: Text(files['Address']?.name ?? 'Address proof', style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy)),
                  ),
                  if (error.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Text(error, style: const TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w700, fontSize: 13)),
                  ],
                  if (submitted) ...[
                    const SizedBox(height: 12),
                    const Text('Documents sent. Verification is in progress.', style: TextStyle(color: Color(0xFF16A34A), fontWeight: FontWeight.w700)),
                  ],
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
              child: FilledButton(
                onPressed: submitted || sending ? null : submit,
                style: FilledButton.styleFrom(
                  backgroundColor: dashBlue,
                  disabledBackgroundColor: const Color(0xFFBFDBFE),
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(52),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                ),
                child: Text(sending ? 'Sending' : submitted ? 'Verification in progress' : 'Submit for Verification'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Bar extends StatelessWidget {
  const _Bar({required this.store});

  final AgentStore store;

  @override
  Widget build(BuildContext context) {
    final initial = store.agentName.isEmpty ? 'R' : store.agentName.substring(0, 1);
    return Row(
      children: [
        IconButton(
          visualDensity: VisualDensity.compact,
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          onPressed: () => Navigator.of(context).pop(),
          icon: const Icon(Icons.arrow_back, color: dashNavy, size: 22),
        ),
        Container(
          width: 34,
          height: 34,
          alignment: Alignment.center,
          decoration: BoxDecoration(color: dashBlue, borderRadius: BorderRadius.circular(10)),
          child: const Icon(Icons.flight, color: Colors.white, size: 18),
        ),
        const SizedBox(width: 8),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('BerogetAI', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: dashNavy, height: 1.05)),
              Text('CREDIT INSIGHTS', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w700, letterSpacing: 0.7, color: Color(0xFF8B95A7))),
            ],
          ),
        ),
        IconButton(
          visualDensity: VisualDensity.compact,
          onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AlertsPage())),
          icon: Badge(
            isLabelVisible: store.unread > 0,
            label: Text('${store.unread}'),
            child: const Icon(Icons.notifications_none, color: dashNavy),
          ),
        ),
        CircleAvatar(
          radius: 16,
          backgroundColor: const Color(0xFFE8F0FF),
          child: Text(initial, style: const TextStyle(color: dashBlue, fontWeight: FontWeight.w800, fontSize: 13)),
        ),
      ],
    );
  }
}

class _Steps extends StatelessWidget {
  const _Steps({required this.step});

  final int step;

  @override
  Widget build(BuildContext context) {
    const labels = ['Upload\nDocuments', 'Verification\nIn Progress', 'Completed'];
    return Row(
      children: [
        for (var i = 0; i < labels.length; i++)
          Expanded(
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(child: Container(height: 2, color: i == 0 ? Colors.transparent : (i <= step ? dashBlue : const Color(0xFFE2E8F0)))),
                    Container(
                      width: 28,
                      height: 28,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: i <= step ? dashBlue : Colors.white,
                        shape: BoxShape.circle,
                        border: Border.all(color: i <= step ? dashBlue : const Color(0xFFD5DDE8), width: 1.4),
                      ),
                      child: i < step
                          ? const Icon(Icons.check, size: 14, color: Colors.white)
                          : Text('${i + 1}', style: TextStyle(color: i == step ? Colors.white : const Color(0xFF8B95A7), fontWeight: FontWeight.w800, fontSize: 12)),
                    ),
                    Expanded(child: Container(height: 2, color: i == labels.length - 1 ? Colors.transparent : (i < step ? dashBlue : const Color(0xFFE2E8F0)))),
                  ],
                ),
                const SizedBox(height: 6),
                Text(labels[i], textAlign: TextAlign.center, style: TextStyle(fontSize: 10, height: 1.2, fontWeight: FontWeight.w700, color: i == step ? dashBlue : const Color(0xFF8B95A7))),
              ],
            ),
          ),
      ],
    );
  }
}

class _DocCard extends StatelessWidget {
  const _DocCard({
    required this.icon,
    required this.iconWash,
    required this.title,
    required this.required,
    required this.hint,
    required this.verified,
    required this.pending,
    required this.attached,
    required this.onUpload,
    required this.onRemove,
    required this.uploadLabel,
    required this.uploadNote,
    required this.preview,
    this.camera = false,
  });

  final Widget icon;
  final Color iconWash;
  final String title;
  final bool required;
  final String hint;
  final bool verified;
  final bool pending;
  final bool attached;
  final VoidCallback onUpload;
  final VoidCallback onRemove;
  final String uploadLabel;
  final String uploadNote;
  final Widget preview;
  final bool camera;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFEEF1F6))),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                alignment: Alignment.center,
                decoration: BoxDecoration(color: iconWash, borderRadius: BorderRadius.circular(10)),
                child: icon,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text.rich(
                      TextSpan(children: [
                        TextSpan(text: title, style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy, fontSize: 14)),
                        if (required) const TextSpan(text: ' *', style: TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w800)),
                      ]),
                    ),
                    Text(hint, style: const TextStyle(color: Color(0xFF8B95A7), fontSize: 11, height: 1.3)),
                  ],
                ),
              ),
              const SizedBox(width: 6),
              if (verified)
                const _Badge(label: 'Verified', color: Color(0xFF16A34A), wash: Color(0xFFE8F8EE), icon: Icons.check_circle)
              else if (pending)
                const _Badge(label: 'Pending', color: Color(0xFFD97706), wash: Color(0xFFFFF6E5), icon: Icons.schedule),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Material(
                  color: const Color(0xFFF7F9FC),
                  borderRadius: BorderRadius.circular(12),
                  child: InkWell(
                    onTap: onUpload,
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      height: 108,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(camera ? Icons.photo_camera_outlined : Icons.cloud_upload_outlined, color: const Color(0xFF8B95A7), size: 26),
                            const SizedBox(height: 6),
                            Text(uploadLabel, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w800, color: dashNavy, fontSize: 12)),
                            Text(uploadNote, textAlign: TextAlign.center, maxLines: 2, style: const TextStyle(color: Color(0xFF8B95A7), fontSize: 10, height: 1.2)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: SizedBox(
                  height: 108,
                  child: attached
                      ? Stack(
                          children: [
                            Positioned.fill(child: preview),
                            Positioned(
                              top: 4,
                              right: 4,
                              child: Material(
                                color: Colors.white,
                                shape: const CircleBorder(),
                                child: InkWell(
                                  customBorder: const CircleBorder(),
                                  onTap: onRemove,
                                  child: const Padding(padding: EdgeInsets.all(2), child: Icon(Icons.close, size: 14, color: Color(0xFF64748B))),
                                ),
                              ),
                            ),
                          ],
                        )
                      : Container(
                          alignment: Alignment.center,
                          decoration: BoxDecoration(color: const Color(0xFFF7F9FC), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
                          child: const Text('No file yet', style: TextStyle(color: Color(0xFF8B95A7), fontSize: 12, fontWeight: FontWeight.w700)),
                        ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge({required this.label, required this.color, required this.wash, required this.icon});

  final String label;
  final Color color;
  final Color wash;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: wash, borderRadius: BorderRadius.circular(999)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 3),
          Text(label, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }
}

class _PanMark extends StatelessWidget {
  const _PanMark();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
      decoration: BoxDecoration(color: dashBlue, borderRadius: BorderRadius.circular(4)),
      child: const Text('PAN', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w800)),
    );
  }
}
