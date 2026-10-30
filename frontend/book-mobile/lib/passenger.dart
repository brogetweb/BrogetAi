import 'profile_store.dart';

enum PassengerType { adult, child, infant }

class Passenger {
  Passenger({
    this.title = 'Mr',
    this.firstName = '',
    this.lastName = '',
    this.dob,
    this.gender = 'Male',
    this.type = PassengerType.adult,
    this.email = '',
    this.phone = '',
    this.nationality = 'IN',
    this.passportNumber = '',
    this.passportExpiry,
  });

  String title;
  String firstName;
  String lastName;
  DateTime? dob;
  String gender;
  PassengerType type;
  String email;
  String phone;
  String nationality;
  String passportNumber;
  DateTime? passportExpiry;

  String get fullName => '$firstName $lastName'.trim();

  String get typeLabel {
    switch (type) {
      case PassengerType.adult:
        return 'Adult';
      case PassengerType.child:
        return 'Child';
      case PassengerType.infant:
        return 'Infant';
    }
  }

  Map<String, dynamic> toJson() => {
        'title': title,
        'firstName': firstName,
        'lastName': lastName,
        'dob': dob?.toIso8601String(),
        'gender': gender,
        'type': type.name,
        'email': email,
        'phone': phone,
        'nationality': nationality,
        'passportNumber': passportNumber,
        'passportExpiry': passportExpiry?.toIso8601String(),
      };

  factory Passenger.fromProfile(BookProfile profile) {
    final parts = profile.fullName.trim().split(RegExp(r'\s+'));
    final first = parts.isNotEmpty ? parts.first : '';
    final last = parts.length > 1 ? parts.sublist(1).join(' ') : '';
    final gender = profile.gender;
    final title = gender.toLowerCase().startsWith('f') ? 'Ms' : 'Mr';
    return Passenger(
      title: title,
      firstName: first,
      lastName: last,
      gender: gender,
      email: profile.email,
      phone: profile.phone,
      type: PassengerType.adult,
    );
  }
}

const indianAirports = {
  'DEL', 'BOM', 'BLR', 'HYD', 'MAA', 'CCU', 'AMD', 'PNQ', 'GOI', 'JAI', 'LKO', 'COK', 'IXC', 'GAU', 'PAT', 'BBI', 'IXB', 'TRV', 'CJB', 'IXE', 'NAG', 'IDR', 'SXR', 'IXJ', 'RPR', 'VTZ', 'IXZ', 'IXA', 'IMF', 'IXL',
};

bool isInternationalRoute(String fromCode, String toCode) {
  final from = fromCode.toUpperCase();
  final to = toCode.toUpperCase();
  return !indianAirports.contains(from) || !indianAirports.contains(to);
}

String formatDob(DateTime? d) {
  if (d == null) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return '${d.day.toString().padLeft(2, '0')} ${months[d.month - 1]} ${d.year}';
}
