# Backend workspace
One NestJS API shared by all frontends. MongoDB is the database. Cloudinary stores images and private documents. Supabase is not part of this stack.

From this folder run `npm run dev`. The app lives in `api`. Put the MongoDB Atlas connection string in `api/.env` as `MONGODB_URI`.

## EC2

On the instance, from `backend/api` after Node 22 is installed:

```bash
npm ci
npm run build
npm run start:prod
```

`start:prod` runs `node dist/main.js` and listens on `0.0.0.0:3000`. Keep port 3000 closed to the internet. Open 80 and 443, and proxy with `deploy/nginx.conf`. Register `deploy/berogetai-api.service` so the API restarts after reboot. Copy `api/.env` onto the server. It is not in git. Set `CORS_ORIGINS` to the public website and super admin URLs.
