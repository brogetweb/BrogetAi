import 'package:flutter/material.dart';

import 'ui.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ColoredBox(
      color: Color(0xFFF4F7FC),
      child: SafeArea(
        child: Padding(
          padding: EdgeInsets.fromLTRB(28, 24, 28, 28),
          child: Column(
            children: [
              Spacer(),
              _Mark(),
              SizedBox(height: 22),
              Text('BerogetAI', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: dashNavy, letterSpacing: -0.8)),
              SizedBox(height: 6),
              Text('AGENT DESK', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1.4, color: dashBlue)),
              SizedBox(height: 10),
              Text(
                'Customers, CIBIL checks, and KYC\nin one place.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Color(0xFF8B95A7), fontSize: 14, height: 1.4, fontWeight: FontWeight.w600),
              ),
              Spacer(),
              Text('Version 1.0.0', style: TextStyle(color: Color(0xFF8B95A7), fontSize: 12, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }
}

class _Mark extends StatelessWidget {
  const _Mark();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 112,
      height: 112,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        boxShadow: const [BoxShadow(color: Color(0x332F6BFF), blurRadius: 28, offset: Offset(0, 12))],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(28),
        child: Image.asset('assets/brand/mark.png', width: 112, height: 112, filterQuality: FilterQuality.high, fit: BoxFit.cover),
      ),
    );
  }
}
