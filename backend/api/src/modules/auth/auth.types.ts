export type AccessPayload = {
  sub: string;
  email: string;
  role: 'super_admin' | 'agent';
  typ: 'access';
};

export type RefreshPayload = {
  sub: string;
  sid: string;
  typ: 'refresh';
};

export type PublicAdmin = {
  id: string;
  email: string;
  name: string;
  role: 'super_admin';
};

export type PublicAgent = {
  id: string;
  email: string;
  name: string;
  phone: string;
  city: string;
  role: 'agent';
};
