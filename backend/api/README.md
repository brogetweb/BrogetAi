# NestJS API

MongoDB holds application data. Cloudinary holds images and private documents. Copy `.env.example` to `.env` and fill `MONGODB_URI` plus the Cloudinary keys before `npm run start:dev`.

`GET /api/v1/health` reports whether MongoDB is connected and whether Cloudinary is configured. Upload helpers live on `CloudinaryService` for later authenticated modules. There is no public upload route yet.

Super admin sign-in is `POST /api/v1/auth/login`. The API returns a short-lived access token and a refresh token. Refresh tokens are stored hashed in Mongo and rotated on `POST /api/v1/auth/refresh`. `POST /api/v1/auth/logout` revokes the refresh token. `GET /api/v1/auth/me` requires `Authorization: Bearer <access token>`.

On first boot, if `SUPER_ADMIN_EMAIL` is not already in Mongo, that account is created from `SUPER_ADMIN_PASSWORD`. Change that password before any shared deploy. The local seed is `admin@beroget.ai` / `Desk@1024`.

Feature modules still to add: agents, customers, consent, kyc, documents, loans, credit-checks, travel/flights, travel/hotels, bookings, payments, notifications, settings, audit.
