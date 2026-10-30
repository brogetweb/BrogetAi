export type TravellerAccessPayload = {
  sub: string;
  email: string;
  role: 'traveller';
  typ: 'access';
};

export type PublicTraveller = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  gender: string;
  role: 'traveller';
};
