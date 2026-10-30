/** Local-only mock AirSearch-shaped flights. Used when BOS_FLIGHT_MOCK=true. */

export function mockAirSearchRaw(input: {
  requestId: string;
  origin: string;
  destination: string;
  travelDateIso: string;
}) {
  const travelDate = toBosDate(input.travelDateIso);
  const flights = [
    mockFlight({
      id: '4925587844442920571',
      airline: 'IndiGo',
      code: '6E',
      number: '2031',
      origin: input.origin,
      destination: input.destination,
      travelDate,
      depart: '06:15',
      arrive: '08:25',
      duration: '02:10',
      price: 3499,
      base: 2900,
      tax: 599,
    }),
    mockFlight({
      id: '4925587844442920572',
      airline: 'Air India',
      code: 'AI',
      number: '865',
      origin: input.origin,
      destination: input.destination,
      travelDate,
      depart: '09:40',
      arrive: '12:05',
      duration: '02:25',
      price: 4120,
      base: 3480,
      tax: 640,
    }),
    mockFlight({
      id: '4925587844442920573',
      airline: 'Vistara',
      code: 'UK',
      number: '955',
      origin: input.origin,
      destination: input.destination,
      travelDate,
      depart: '13:20',
      arrive: '15:40',
      duration: '02:20',
      price: 4580,
      base: 3900,
      tax: 680,
    }),
    mockFlight({
      id: '4925587844442920574',
      airline: 'Akasa Air',
      code: 'QP',
      number: '1120',
      origin: input.origin,
      destination: input.destination,
      travelDate,
      depart: '17:05',
      arrive: '20:55',
      duration: '03:50',
      price: 3290,
      base: 2750,
      tax: 540,
      stops: 1,
    }),
    mockFlight({
      id: '4925587844442920575',
      airline: 'IndiGo',
      code: '6E',
      number: '511',
      origin: input.origin,
      destination: input.destination,
      travelDate,
      depart: '20:30',
      arrive: '22:45',
      duration: '02:15',
      price: 3899,
      base: 3300,
      tax: 599,
    }),
  ];

  return {
    response_Header: {
      error_Code: '0000',
      error_Desc: 'SUCCESS',
      error_InnerException: '',
      request_Id: input.requestId,
      status_Id: '11',
    },
    search_Key: `LOCAL_MOCK_${input.requestId}`,
    tripDetails: [{ trip_Id: 0, flights }],
    statuss: 'TRUE',
    message: 'Local mock mode (BOS_FLIGHT_MOCK=true)',
    value: '',
  };
}

function mockFlight(row: {
  id: string;
  airline: string;
  code: string;
  number: string;
  origin: string;
  destination: string;
  travelDate: string;
  depart: string;
  arrive: string;
  duration: string;
  price: number;
  base: number;
  tax: number;
  stops?: number;
}) {
  return {
    airline_Code: row.code,
    flight_Id: row.id,
    flight_Key: `MOCK_KEY_${row.id}`,
    flight_Numbers: `${row.number}-${row.travelDate} ${row.depart}`,
    origin: row.origin,
    destination: row.destination,
    isLCC: row.code === '6E' || row.code === 'QP',
    travelDate: row.travelDate,
    fares: [
      {
        fare_Id: `FARE_${row.id}`,
        fareType: 0,
        productClass: 'R',
        refundable: true,
        food_onboard: 'Paid Meal',
        fareDetails: [
          {
            basic_Amount: row.base,
            airportTax_Amount: row.tax,
            total_Amount: row.price,
            currency_Code: 'INR',
            free_Baggage: { check_In_Baggage: '15KG', hand_Baggage: '7KG' },
            fareClasses: [{ class_Code: 'R', class_Desc: 'PUBLISHED', fareBasis: 'R0IP', segment_Id: 0 }],
          },
        ],
      },
    ],
    segments: [
      {
        aircraft_Type: '320',
        airline_Code: row.code,
        airline_Name: row.airline,
        flight_Number: row.number,
        origin: row.origin,
        destination: row.destination,
        origin_City: row.origin,
        destination_City: row.destination,
        departure_DateTime: `${row.travelDate} ${row.depart}`,
        arrival_DateTime: `${row.travelDate} ${row.arrive}`,
        duration: row.duration,
        segment_Id: 0,
        return_Flight: false,
      },
      ...(row.stops
        ? [
            {
              aircraft_Type: '320',
              airline_Code: row.code,
              airline_Name: row.airline,
              flight_Number: `${row.number}B`,
              origin: 'HYD',
              destination: row.destination,
              origin_City: 'HYDERABAD',
              destination_City: row.destination,
              departure_DateTime: `${row.travelDate} 19:10`,
              arrival_DateTime: `${row.travelDate} ${row.arrive}`,
              duration: '01:45',
              segment_Id: 1,
              return_Flight: false,
            },
          ]
        : []),
    ],
  };
}

function toBosDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}
