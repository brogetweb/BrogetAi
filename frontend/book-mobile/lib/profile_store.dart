import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class BookProfile {
  const BookProfile({
    required this.fullName,
    required this.email,
    required this.phone,
    this.gender = 'Male',
    this.city = '',
    this.id = '',
  });

  final String id;
  final String fullName;
  final String email;
  final String phone;
  final String gender;
  final String city;

  String get firstName {
    final parts = fullName.trim().split(RegExp(r'\s+'));
    return parts.isEmpty ? 'Traveller' : parts.first;
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'fullName': fullName,
        'email': email,
        'phone': phone,
        'gender': gender,
        'city': city,
      };

  factory BookProfile.fromJson(Map<String, dynamic> json) => BookProfile(
        id: '${json['id'] ?? ''}',
        fullName: '${json['fullName'] ?? ''}',
        email: '${json['email'] ?? ''}',
        phone: '${json['phone'] ?? ''}',
        gender: '${json['gender'] ?? 'Male'}',
        city: '${json['city'] ?? ''}',
      );
}

class ProfileStore extends ChangeNotifier {
  ProfileStore._();
  static final ProfileStore instance = ProfileStore._();

  BookProfile? _profile;
  String? _accessToken;
  String? _refreshToken;
  bool _ready = false;

  BookProfile? get profile => _profile;
  String? get accessToken => _accessToken;
  String? get refreshToken => _refreshToken;
  bool get hasProfile => _profile != null;
  bool get hasToken => (_accessToken ?? '').isNotEmpty;
  bool get ready => _ready;

  Future<void> hydrate() async {
    final prefs = await SharedPreferences.getInstance();
    _accessToken = prefs.getString('book_access');
    _refreshToken = prefs.getString('book_refresh');
    final raw = prefs.getString('book_profile');
    if (raw != null && raw.isNotEmpty) {
      try {
        _profile = BookProfile.fromJson(jsonDecode(raw) as Map<String, dynamic>);
      } catch (_) {
        _profile = null;
      }
    }
    _ready = true;
    notifyListeners();
  }

  Future<void> saveSession({
    required BookProfile profile,
    required String accessToken,
    String? refreshToken,
  }) async {
    _profile = profile;
    _accessToken = accessToken;
    _refreshToken = refreshToken;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('book_access', accessToken);
    if (refreshToken != null) await prefs.setString('book_refresh', refreshToken);
    await prefs.setString('book_profile', jsonEncode(profile.toJson()));
    notifyListeners();
  }

  Future<void> save(BookProfile profile) async {
    _profile = profile;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('book_profile', jsonEncode(profile.toJson()));
    notifyListeners();
  }

  Future<void> clear() async {
    _profile = null;
    _accessToken = null;
    _refreshToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('book_access');
    await prefs.remove('book_refresh');
    await prefs.remove('book_profile');
    notifyListeners();
  }
}
