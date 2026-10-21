# BerogetAI Monorepo Starter

## Structure
- `frontend/public-website`: Next.js + TypeScript + Tailwind. Flights and hotels active; CIBIL and SIP show Coming Soon.
- `frontend/super-admin-web`: Next.js + TypeScript + Tailwind. One unified admin panel.
- `frontend/agent-mobile`: Flutter app for Android and iOS.
- `backend/api`: one NestJS backend. MongoDB for data, Cloudinary for images and documents. Supabase is not used.

## Integrations
- TripJack: flights and hotels, through backend only.
- TransUnion CIBIL API Marketplace: https://apimarketplace.transunioncibil.com/ — feature-gated until access is approved.
- SIP is not an active feature in this release.

This is a high-level scaffold, not a complete production implementation. Configure credentials, providers, tests, deployment and compliance before launch.

## Public website UI refresh
The public website now has a responsive branded landing-page scaffold with a custom BerogetAI mark, navigation, flight search panel, service cards, destination imagery slots, CTA sections and a detailed footer. Add approved optimized images under `frontend/public-website/public/images/` before deployment.
