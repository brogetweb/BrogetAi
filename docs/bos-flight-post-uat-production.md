# BOS / AO Pay Flight — Post-UAT production setup

After UAT succeeds, share these with AO Pay / BOS so they can enable **production** access.

| # | Detail | Notes (Broget) |
|---|--------|----------------|
| 1 | **Public Key** | ✅ Generated on prod EC2 (`keys/bos-flight-prod-private.pem` stays on server only). Copy for AO Pay: `docs/ao-pay-handoff/bos-flight-prod-public.pem`. Env: `BOS_FLIGHT_PUBLIC_KEY`. |
| 2 | **Client Secret Key** | ✅ Flight Reg ID **`AOP-1006`** → `hi0ioHBOgqzrxMxMVBvpEwkP/q8El08tntEE1p9dAkU=` (AO Pay SHA256→HMAC logic). File: `docs/ao-pay-handoff/bos-flight-client-secret.txt`. Env: `BOS_FLIGHT_CLIENT_SECRET`. Not CIBIL `AOP-5065`. |
| 3 | **Indian Static IP** | **`65.2.205.197`** — ye AO Pay mail wala item hai; unko dena / whitelist ke liye. Env (hamare server pe): `BOS_FLIGHT_IP_ADDRESS=65.2.205.197`. Nest API host abhi `3.7.65.46` bhi ho sakta hai; AO Pay ko dena wala static IP yehi hai. |
| 4 | **API Log File** | ✅ Live capture: `docs/ao-pay-handoff/bos-flight-api-log.txt` — BOS `AirSearch` HTTP 200 SUCCESS (~173KB raw) + Broget Nest `search/guest` sample. Also on server: `backend/api/keys/bos-flight-api-log.txt`. |

Do **not** mix with CIBIL / credit keys (`AOPAY_*`). Flight keys stay under `BOS_FLIGHT_*` only.

When they enable prod: set `BOS_FLIGHT_MOCK=false`, point `BOS_FLIGHT_BASE_URL` at the production travel URL they give, fill Registration ID + secret + public key + IP, restart API, then retest Book APK against live.

**Status:** Noted — wait for user to ask for generation / packaging of these items. Do not start until asked.
