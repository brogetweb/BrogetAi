# Architecture & Security

Public website, super admin web, and Flutter agent app all call one NestJS REST API. NestJS stores data in MongoDB. Images and documents go to Cloudinary: public images in a folder, KYC and other documents as authenticated assets with short-lived signed URLs. Supabase is not used.

## Feature modules
auth, users, agents, customers, consent, kyc, documents, loans, credit-checks, travel/flights, travel/hotels, bookings, payments, notifications, settings, audit, health.

## Security requirements
- Never put TripJack/CIBIL secrets in browser or Flutter code.
- Keep CIBIL disabled until onboarding/access and compliance are approved.
- Record explicit consent before credit-data requests.
- Mask PAN and sensitive data in UI/logs; avoid logging credit reports.
- Store documents in Cloudinary as authenticated assets and hand out short-lived signed URLs.
- Use RBAC on every protected backend endpoint.
- Make booking/payment operations idempotent and reconcile uncertain provider results.
