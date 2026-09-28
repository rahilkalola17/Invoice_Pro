// Single source of truth for the Basic / Pro subscription model.
// Change limits, prices or feature lists here; nothing else hard-codes them.

// Every Pro feature. `available: false` marks features that are sold as part
// of Pro but not built yet; the paywall labels them "Soon".
export const FEATURES = {
  unlimited: { label: "Unlimited clients, invoices & receipts", icon: "infinity", available: true },
  noBranding: { label: "No “Made with” footer on PDFs", icon: "sparkles", available: true },
  signatures: { label: "Digital signatures", icon: "pen-line", available: false },
  reminders: { label: "Automated overdue reminders", icon: "bell-ring", available: false },
  onlinePayments: { label: "Stripe & PayPal payment links", icon: "link", available: false },
  timeTracker: { label: "Time tracker to invoice line items", icon: "timer", available: false },
  recurring: { label: "Recurring invoices for retainers", icon: "repeat", available: false },
  cloudSync: { label: "Cloud sync & backup", icon: "cloud", available: false },
  taxExport: { label: "Tax report export (CSV / Excel)", icon: "file-spreadsheet", available: false },
};

export const PLANS = {
  basic: {
    id: "basic",
    name: "Basic",
    // clients is a running total; the other two reset each calendar month.
    limits: { clients: 3, invoicesPerMonth: 5, receiptsPerMonth: 10 },
    features: [],
  },
  pro: {
    id: "pro",
    name: "Pro",
    limits: null, // unlimited
    features: Object.keys(FEATURES),
  },
};

// What the paywall sells. Prices are placeholders (USD).
export const OFFERS = [
  { id: "pro_yearly", planId: "pro", label: "Yearly", price: 49.99, period: "year", trialDays: 7, badge: "Save 40%" },
  { id: "pro_monthly", planId: "pro", label: "Monthly", price: 6.99, period: "month", trialDays: 7 },
];

// Maps a limit kind used by the app to its key in PLANS[*].limits.
export const LIMIT_KEYS = {
  clients: "clients",
  invoices: "invoicesPerMonth",
  receipts: "receiptsPerMonth",
};

export function getPlan(id) {
  return PLANS[id] || PLANS.basic;
}

export function getOffer(id) {
  return OFFERS.find((o) => o.id === id) || null;
}
