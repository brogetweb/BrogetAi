import 'package:flutter/material.dart';

import 'ui.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF0E1B4D), Color(0xFF2F6BFF)],
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: EdgeInsets.fromLTRB(28, 12, 28, 18),
          child: Column(
            children: [
              Spacer(),
              CibilBadge(size: 132),
              SizedBox(height: 18),
              Text('BerogetAI', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: -0.8)),
              SizedBox(height: 6),
              Text('CIBIL SCORE DESK', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, letterSpacing: 1.6, color: Color(0xFFD6E4FF))),
              Spacer(),
              Text('Version 1.0.2', style: TextStyle(color: Color(0xFFD6E4FF), fontSize: 12, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }
}
