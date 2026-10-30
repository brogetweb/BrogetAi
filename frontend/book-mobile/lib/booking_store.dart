import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class BookBooking {
  const BookBooking({
    required this.id,
    required this.airline,
    required this.airlineCode,
    required this.flightCode,
    required this.fromCode,
    required this.toCode,
    required this.date,
    required this.depart,
    required this.arrive,
    required this.duration,
    required this.total,
    required this.travellerName,
    required this.createdAt,
    this.pnr = '',
    this.email = '',
    this.phone = '',
    this.cabin = 'Economy',
  });

  final String id;
  final String airline;
  final String airlineCode;
  final String flightCode;
  final String fromCode;
  final String toCode;
  final String date;
  final String depart;
  final String arrive;
  final String duration;
  final int total;
  final String travellerName;
  final DateTime createdAt;
  final String pnr;
  final String email;
  final String phone;
  final String cabin;

  Map<String, dynamic> toJson() => {
        'id': id,
        'airline': airline,
        'airlineCode': airlineCode,
        'flightCode': flightCode,
        'fromCode': fromCode,
        'toCode': toCode,
        'date': date,
        'depart': depart,
        'arrive': arrive,
        'duration': duration,
        'total': total,
        'travellerName': travellerName,
        'createdAt': createdAt.toIso8601String(),
        'pnr': pnr,
        'email': email,
        'phone': phone,
        'cabin': cabin,
      };

  factory BookBooking.fromJson(Map<String, dynamic> json) => BookBooking(
        id: '${json['id'] ?? ''}',
        airline: '${json['airline'] ?? ''}',
        airlineCode: '${json['airlineCode'] ?? ''}',
        flightCode: '${json['flightCode'] ?? ''}',
        fromCode: '${json['fromCode'] ?? ''}',
        toCode: '${json['toCode'] ?? ''}',
        date: '${json['date'] ?? ''}',
        depart: '${json['depart'] ?? ''}',
        arrive: '${json['arrive'] ?? ''}',
        duration: '${json['duration'] ?? ''}',
        total: (json['total'] as num?)?.round() ?? 0,
        travellerName: '${json['travellerName'] ?? ''}',
        createdAt: DateTime.tryParse('${json['createdAt'] ?? ''}') ?? DateTime.now(),
        pnr: '${json['pnr'] ?? ''}',
        email: '${json['email'] ?? ''}',
        phone: '${json['phone'] ?? ''}',
        cabin: '${json['cabin'] ?? 'Economy'}',
      );
}

class BookingStore extends ChangeNotifier {
  BookingStore._();
  static final BookingStore instance = BookingStore._();

  final List<BookBooking> _items = [];
  bool _ready = false;

  List<BookBooking> get items => List.unmodifiable(_items);
  bool get ready => _ready;

  Future<void> hydrate() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('book_bookings');
    _items.clear();
    if (raw != null && raw.isNotEmpty) {
      try {
        final list = jsonDecode(raw) as List? ?? const [];
        for (final row in list) {
          if (row is Map) {
            _items.add(BookBooking.fromJson(Map<String, dynamic>.from(row)));
          }
        }
      } catch (_) {}
    }
    _ready = true;
    notifyListeners();
  }

  Future<void> add(BookBooking booking) async {
    _items.insert(0, booking);
    await _persist();
    notifyListeners();
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('book_bookings', jsonEncode(_items.map((e) => e.toJson()).toList()));
  }
}
