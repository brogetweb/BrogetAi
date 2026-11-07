export type ServiceDetail = {
  headline: string;
  summary: string;
  features: [string, string][];
  steps: [string, string][];
};

export const serviceDetails: Record<string, ServiceDetail> = {
  "flight-booking": {
    headline: "Find the flight that fits the trip.",
    summary: "Search a route and a date, compare nonstop and one-stop fares across airlines, and book the seat from the same desk.",
    features: [
      ["Fare search", "Search one-way and return routes across domestic and international airlines."],
      ["Compare stops", "See nonstop and one-stop options side by side, with times and duration."],
      ["Traveller details", "Add every passenger once and keep the booking on one record."],
      ["E-ticket", "Get the ticket and the PNR as soon as the booking is confirmed."],
    ],
    steps: [
      ["Search", "Pick the cities, the date, and the number of travellers."],
      ["Choose", "Compare fares and pick the flight that fits."],
      ["Book", "Add traveller details, pay, and receive the ticket."],
    ],
  },
  "train-booking": {
    headline: "See the seat before you plan around it.",
    summary: "Check trains between two stations, compare classes and availability, and book the seat on the same desk as the rest of the trip.",
    features: [
      ["Train search", "Find trains between two stations on the date you travel."],
      ["Class and quota", "Compare sleeper, AC classes, and quotas in one view."],
      ["Availability", "See open seats and waitlist status before you book."],
      ["One trip", "Keep the train beside the flight, bus, or hotel for the same journey."],
    ],
    steps: [
      ["Search", "Enter the stations and the travel date."],
      ["Compare", "Pick the train and the class with open seats."],
      ["Book", "Add passengers and confirm the booking."],
    ],
  },
  "bus-booking": {
    headline: "Pick the coach and the seat.",
    summary: "Compare buses by operator, timing, and coach type, choose the seat, and book the trip in a few steps.",
    features: [
      ["Operators", "Compare private and state operators on the same route."],
      ["Coach type", "Filter AC, non-AC, sleeper, and seater coaches."],
      ["Seat map", "Choose the exact seat you want before you pay."],
      ["Boarding points", "Pick the boarding and drop point that suits you."],
    ],
    steps: [
      ["Search", "Choose the route and the travel date."],
      ["Select", "Pick the coach, the seat, and the boarding point."],
      ["Book", "Pay and receive the ticket on your phone."],
    ],
  },
  "hotel-booking": {
    headline: "A stay that matches the journey.",
    summary: "Choose a city and dates, compare rooms by price and rating, and reserve the stay beside the rest of the trip.",
    features: [
      ["City search", "Search hotels in the city and on the dates you need."],
      ["Room compare", "Compare rooms, prices, ratings, and amenities."],
      ["Photos and details", "See the property, the room, and the policies before you book."],
      ["Same trip", "Keep the stay on the same desk as the flight or train."],
    ],
    steps: [
      ["Search", "Pick the city, the dates, and the guests."],
      ["Compare", "Choose the property and the room."],
      ["Reserve", "Confirm the stay and get the booking voucher."],
    ],
  },
  cibil: {
    headline: "Know the credit score before the next step.",
    summary: "A Broget AI agent pulls the CIBIL credit report with the customer's consent, so the score and the history are clear before a loan or a card.",
    features: [
      ["Instant report", "The agent fetches the CIBIL report in moments, not days."],
      ["Consent first", "The check runs only with the customer's consent."],
      ["Clear score", "See the score, accounts, and repayment history in one view."],
      ["Agent desk", "Agents manage customers and reports from one dashboard."],
    ],
    steps: [
      ["Visit an agent", "Reach a Broget AI agent or open cibil.brogetai.com."],
      ["Give consent", "Share the details and approve the credit check."],
      ["Get the report", "See the score and the full report right away."],
    ],
  },
  sip: {
    headline: "Save a fixed amount, every month.",
    summary: "A systematic investment plan that builds savings month by month, set up on the same BrogetAI desk.",
    features: [
      ["Monthly plan", "Choose an amount and a date that suit your income."],
      ["Small start", "Begin with a small amount and raise it later."],
      ["Track growth", "See what has been saved and how it has grown."],
      ["One account", "Keep the plan with the rest of your BrogetAI services."],
    ],
    steps: [
      ["Choose", "Pick the plan and the monthly amount."],
      ["Set up", "Complete the details and the mandate."],
      ["Grow", "Save every month and track the plan."],
    ],
  },
  "fd-rd": {
    headline: "Fixed and recurring deposits, made simple.",
    summary: "Open a fixed deposit for a lump sum, or a recurring deposit for monthly savings, through the BrogetAI desk.",
    features: [
      ["Fixed deposit", "Lock a lump sum for a chosen term."],
      ["Recurring deposit", "Save a set amount every month."],
      ["Choose the term", "Pick a tenure that matches your goal."],
      ["Agent help", "An agent guides the customer through each step."],
    ],
    steps: [
      ["Pick", "Choose FD or RD and the term."],
      ["Apply", "Share the details with the desk."],
      ["Save", "The deposit runs and matures on schedule."],
    ],
  },
  "payment-gateway": {
    headline: "Accept online payments, securely.",
    summary: "BroGetPay's payment gateway lets a business accept online payments for purchases, subscriptions, and services, with a merchant dashboard and developer APIs.",
    features: [
      ["Many methods", "Accept UPI, cards, net banking, and wallets."],
      ["Merchant dashboard", "See every payment and its status in one place."],
      ["Developer APIs", "Integrate with clean APIs and webhooks."],
      ["Reconciliation", "Records are ready for accounting and settlement."],
    ],
    steps: [
      ["Sign up", "Open a merchant account on brogetpay.com."],
      ["Integrate", "Connect the gateway to your site or app."],
      ["Get paid", "Accept payments and track settlements."],
    ],
  },
  "pay-in": {
    headline: "Collect money the way customers pay.",
    summary: "Collect payments with UPI QR codes, payment links, and bank transfers, and watch every pay-in arrive on the BroGetPay dashboard.",
    features: [
      ["UPI QR", "Show a QR code and collect instantly."],
      ["Payment links", "Send a link by SMS, WhatsApp, or email, with no checkout page."],
      ["Bank transfer", "Accept transfers straight to the account."],
      ["Live status", "See each pay-in and its status as it lands."],
    ],
    steps: [
      ["Create", "Make a QR code or a payment link."],
      ["Share", "Send it to the customer."],
      ["Collect", "The money lands and the dashboard updates."],
    ],
  },
  payout: {
    headline: "Send money out, at scale.",
    summary: "Disburse payments to bank accounts, wallets, UPI IDs, and cards from one BroGetPay account, one at a time or in bulk.",
    features: [
      ["Bank and UPI", "Pay out to bank accounts and UPI IDs."],
      ["Wallets and cards", "Send money to wallets and cards too."],
      ["Bulk payouts", "Pay many beneficiaries in one go."],
      ["Status updates", "Track every payout until it is credited."],
    ],
    steps: [
      ["Add", "Add the beneficiary and the amount."],
      ["Send", "Start the payout from the dashboard or the API."],
      ["Track", "Follow the status until it is credited."],
    ],
  },
  "builder-ships": {
    headline: "Construction and builder projects in one place.",
    summary: "Builder Ships brings construction, sites, and builder projects together, from planning to the finished property.",
    features: [
      ["Projects", "Browse ongoing and upcoming builder projects."],
      ["Sites", "See site details, locations, and progress."],
      ["Construction", "Plan and manage construction work."],
      ["One partner", "Work with one team from start to finish."],
    ],
    steps: [
      ["Explore", "Visit builderbroget.com and see the projects."],
      ["Talk", "Reach the team about a site or a project."],
      ["Build", "Plan, build, and move in."],
    ],
  },
  education: {
    headline: "Learning, campuses, and students, connected.",
    summary: "An education desk that brings learning, campuses, and student services into one place.",
    features: [
      ["Learning", "Courses and learning resources in one place."],
      ["Campuses", "Information for schools, colleges, and institutes."],
      ["Student services", "Admissions, fees, and support for students."],
      ["One desk", "Education beside the rest of BrogetAI."],
    ],
    steps: [
      ["Explore", "See the programs and campuses."],
      ["Apply", "Share the student details."],
      ["Learn", "Start the course and track progress."],
    ],
  },
  "health-care": {
    headline: "Care for the whole family.",
    summary: "A health desk for clinics, care, and health services that families can reach from one place.",
    features: [
      ["Clinics", "Find clinics and care providers."],
      ["Family care", "Services for every member of the family."],
      ["Health services", "Checkups, consultations, and follow-ups."],
      ["One desk", "Health beside the rest of BrogetAI."],
    ],
    steps: [
      ["Find", "Choose the care or the clinic you need."],
      ["Book", "Share the details and pick a time."],
      ["Visit", "Get care and follow up."],
    ],
  },
  agriculture: {
    headline: "Support for every grower.",
    summary: "An agriculture desk for farm inputs, markets, and grower services, built for the people who work the land.",
    features: [
      ["Farm inputs", "Seeds, fertilisers, and tools for the season."],
      ["Markets", "Reach buyers and market prices."],
      ["Grower services", "Advice and services for farmers."],
      ["One desk", "Agriculture beside the rest of BrogetAI."],
    ],
    steps: [
      ["Choose", "Pick the input or service you need."],
      ["Order", "Share the details with the desk."],
      ["Grow", "Get support through the season."],
    ],
  },
};
