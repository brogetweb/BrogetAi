class FlightOffer {
  const FlightOffer({
    required this.id,
    required this.airline,
    required this.code,
    required this.fromCode,
    required this.toCode,
    required this.depart,
    required this.arrive,
    required this.duration,
    required this.stops,
    required this.price,
    this.airlineCode = '',
    this.flightKey = '',
    this.fareId = '',
    this.baseFare = 0,
    this.taxes = 0,
    this.cabinBaggage = '7 kg',
    this.checkInBaggage = '15 kg',
    this.refundable = true,
  });

  final String id;
  final String airline;
  final String code;
  final String airlineCode;
  final String fromCode;
  final String toCode;
  final String depart;
  final String arrive;
  final String duration;
  final int stops;
  final int price;
  final String flightKey;
  final String fareId;
  final int baseFare;
  final int taxes;
  final String cabinBaggage;
  final String checkInBaggage;
  final bool refundable;

  String get logoCode {
    if (airlineCode.trim().isNotEmpty) return airlineCode.trim().toUpperCase();
    final part = code.trim().split(RegExp(r'\s+')).first;
    return part.toUpperCase();
  }

  factory FlightOffer.fromApi(Map<String, dynamic> json) {
    final airlineCode = '${json['airlineCode'] ?? ''}';
    final flightNumber = '${json['flightNumber'] ?? ''}';
    return FlightOffer(
      id: '${json['id'] ?? ''}',
      airline: '${json['airlineName'] ?? airlineCode}',
      airlineCode: airlineCode,
      code: [airlineCode, flightNumber].where((part) => part.isNotEmpty).join(' '),
      fromCode: '${json['fromCode'] ?? ''}',
      toCode: '${json['toCode'] ?? ''}',
      depart: '${json['depart'] ?? ''}',
      arrive: '${json['arrive'] ?? ''}',
      duration: '${json['duration'] ?? ''}',
      stops: (json['stops'] as num?)?.toInt() ?? 0,
      price: (json['price'] as num?)?.round() ?? 0,
      flightKey: '${json['flightKey'] ?? ''}',
      fareId: '${json['fareId'] ?? ''}',
      baseFare: (json['baseFare'] as num?)?.round() ?? 0,
      taxes: (json['taxes'] as num?)?.round() ?? 0,
      cabinBaggage: '${json['cabinBaggage'] ?? '7KG'}',
      checkInBaggage: '${json['checkInBaggage'] ?? '15KG'}',
      refundable: json['refundable'] == true,
    );
  }
}

class BusOffer {
  const BusOffer({
    required this.id,
    required this.operatorName,
    required this.type,
    required this.depart,
    required this.arrive,
    required this.duration,
    required this.price,
    required this.seats,
  });

  final String id;
  final String operatorName;
  final String type;
  final String depart;
  final String arrive;
  final String duration;
  final int price;
  final int seats;
}

class HotelOffer {
  const HotelOffer({
    required this.id,
    required this.name,
    required this.place,
    required this.rating,
    required this.price,
    required this.amenities,
    required this.tone,
  });

  final String id;
  final String name;
  final String place;
  final double rating;
  final int price;
  final List<String> amenities;
  final ColorTone tone;
}

enum ColorTone { teal, sand, blue, rose }

const cities = ['New Delhi (DEL)', 'Mumbai (BOM)', 'Bengaluru (BLR)', 'Hyderabad (HYD)', 'Chennai (MAA)', 'Goa (GOI)', 'Jaipur (JAI)', 'Dubai (DXB)'];
const busCities = ['Delhi', 'Jaipur', 'Agra', 'Manali', 'Chandigarh', 'Lucknow', 'Mumbai', 'Pune'];
const hotelCities = ['Goa', 'Manali', 'Dubai', 'Jaipur', 'Mumbai', 'Udaipur'];

List<FlightOffer> mockFlights({String from = 'DEL', String to = 'BOM'}) => [
      FlightOffer(id: 'f1', airline: 'IndiGo', airlineCode: '6E', code: '6E 2031', fromCode: from, toCode: to, depart: '06:15', arrive: '08:25', duration: '2h 10m', stops: 0, price: 3499),
      FlightOffer(id: 'f2', airline: 'Air India', airlineCode: 'AI', code: 'AI 865', fromCode: from, toCode: to, depart: '09:40', arrive: '12:05', duration: '2h 25m', stops: 0, price: 4120),
      FlightOffer(id: 'f3', airline: 'Vistara', airlineCode: 'UK', code: 'UK 955', fromCode: from, toCode: to, depart: '13:20', arrive: '15:40', duration: '2h 20m', stops: 0, price: 4580),
      FlightOffer(id: 'f4', airline: 'Akasa Air', airlineCode: 'QP', code: 'QP 1120', fromCode: from, toCode: to, depart: '17:05', arrive: '20:55', duration: '3h 50m', stops: 1, price: 3290),
      FlightOffer(id: 'f5', airline: 'IndiGo', airlineCode: '6E', code: '6E 511', fromCode: from, toCode: to, depart: '20:30', arrive: '22:45', duration: '2h 15m', stops: 0, price: 3899),
    ];

List<BusOffer> mockBuses() => const [
      BusOffer(id: 'b1', operatorName: 'RSRTC', type: 'AC Seater', depart: '21:30', arrive: '05:15', duration: '7h 45m', price: 699, seats: 12),
      BusOffer(id: 'b2', operatorName: 'Zingbus', type: 'AC Sleeper', depart: '22:10', arrive: '06:00', duration: '7h 50m', price: 899, seats: 8),
      BusOffer(id: 'b3', operatorName: 'IntrCity', type: 'Volvo AC', depart: '23:00', arrive: '06:40', duration: '7h 40m', price: 949, seats: 15),
      BusOffer(id: 'b4', operatorName: 'RedBus', type: 'Non-AC Seater', depart: '20:00', arrive: '04:30', duration: '8h 30m', price: 499, seats: 20),
    ];

List<HotelOffer> mockHotels() => const [
      HotelOffer(id: 'h1', name: 'The Leela Goa', place: 'Cavelossim, Goa', rating: 4.8, price: 12800, amenities: ['Pool', 'WiFi', 'Spa'], tone: ColorTone.teal),
      HotelOffer(id: 'h2', name: 'Taj Holiday Village', place: 'Candolim, Goa', rating: 4.7, price: 9800, amenities: ['Beach', 'WiFi', 'Gym'], tone: ColorTone.sand),
      HotelOffer(id: 'h3', name: 'Bloom Boutique', place: 'Calangute, Goa', rating: 4.4, price: 4200, amenities: ['WiFi', 'Cafe', 'AC'], tone: ColorTone.blue),
      HotelOffer(id: 'h4', name: 'Sea Pearl Resort', place: 'Baga, Goa', rating: 4.2, price: 3100, amenities: ['Pool', 'WiFi'], tone: ColorTone.rose),
    ];

String codeOf(String place) {
  final match = RegExp(r'\(([^)]+)\)').firstMatch(place);
  return match?.group(1) ?? place.substring(0, 3).toUpperCase();
}
