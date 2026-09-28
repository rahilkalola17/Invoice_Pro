// A focused list of currencies commonly invoiced by freelancers.
// Each entry carries the symbol used in formatting.
export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AED", symbol: "AED", name: "UAE Dirham" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
];

export function getCurrency(code) {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
}

// Formats a number using the currency's symbol. Yen has no minor unit;
// everything else shows two decimals.
export function formatCurrency(amount, code = "USD") {
  const currency = getCurrency(code);
  const value = Number.isFinite(amount) ? amount : 0;
  const decimals = code === "JPY" ? 0 : 2;
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${currency.symbol}${formatted}`;
}
