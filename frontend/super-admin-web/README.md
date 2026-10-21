# Unified Super Admin

```bash
npm install
npm run dev
```

Opens at http://localhost:3002. The sidebar keeps Flights, Hotels, Check CIBIL Report, Customer List, KYC & Documents, and Agents. The super admin creates agent accounts. Each agent adds customers and runs CIBIL checks, and only sees their own file in the agent app. This desk shows every agent's customers and reports. Figures are samples until the API is connected.

Modules: overview, flight bookings, hotel bookings, travel customers, agents, loan applications, loan customers, KYC/consent status, payments/refunds, audit logs, general settings, email/notifications, payment settings. Never return provider secrets to browser code.
