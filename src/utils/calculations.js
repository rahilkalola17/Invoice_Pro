// All money math for the app lives here so the form, the detail screen,
// and the PDF generator can never disagree with each other.

export function lineItemAmount(item) {
  if (!item) return 0;
  if (item.type === "flat") {
    return Number(item.rate) || 0;
  }
  const qty = Number(item.quantity) || 0;
  const rate = Number(item.rate) || 0;
  return qty * rate;
}

export function invoiceSubtotal(items = []) {
  return items.reduce((sum, item) => sum + lineItemAmount(item), 0);
}

export function discountAmount(subtotal, discount) {
  if (!discount || !discount.value) return 0;
  const value = Number(discount.value) || 0;
  if (discount.type === "percentage") {
    return subtotal * (value / 100);
  }
  return Math.min(value, subtotal);
}

export function taxAmount(taxableBase, taxRate) {
  const rate = Number(taxRate) || 0;
  return taxableBase * (rate / 100);
}

// Returns the full breakdown used by both the invoice form/detail
// screens and the PDF template.
export function computeInvoiceTotals(invoice) {
  const subtotal = invoiceSubtotal(invoice.items);
  const discount = discountAmount(subtotal, invoice.discount);
  const taxableBase = Math.max(subtotal - discount, 0);
  const tax = taxAmount(taxableBase, invoice.taxRate);
  const total = taxableBase + tax;
  return { subtotal, discount, tax, total };
}

// "Overdue" is never stored directly — it's derived from a Sent
// invoice whose due date has passed, so the dashboard is always
// accurate without a background job.
export function effectiveStatus(invoice) {
  if (invoice.status !== "paid") {
    const { total } = computeInvoiceTotals(invoice);
    const paid = paymentsTotal(invoice.payments);
    if (total > 0 && paid >= total) {
      // Fully covered by recorded payments — treat as paid even if
      // the stored status hasn't caught up yet.
      return "paid";
    }
  }
  if (invoice.status === "sent" && invoice.dueDate) {
    const due = new Date(invoice.dueDate);
    const today = new Date();
    due.setHours(23, 59, 59, 999);
    if (today.getTime() > due.getTime()) {
      return "overdue";
    }
  }
  return invoice.status;
}

// --- Payment tracking ------------------------------------------------

export function paymentsTotal(payments = []) {
  return (payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
}

// Returns the full picture for the Payments card: what the invoice is
// worth, how much has been recorded against it, and what's left.
export function computeInvoiceBalance(invoice) {
  const { total } = computeInvoiceTotals(invoice);
  const amountPaid = paymentsTotal(invoice.payments);
  const balanceDue = Math.max(total - amountPaid, 0);
  return { total, amountPaid, balanceDue };
}

export function formatDate(isoString) {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function daysUntil(isoString) {
  if (!isoString) return null;
  const due = new Date(isoString);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86400000);
}

// Sums invoice totals grouped by currency, since a freelancer's
// invoices are rarely all in one currency — returns e.g.
// { USD: 1800, INR: 21000 } rather than an incorrect single sum.
export function groupTotalsByCurrency(invoices) {
  const totals = {};
  invoices.forEach((inv) => {
    const { total } = computeInvoiceTotals(inv);
    const code = inv.currency || "USD";
    totals[code] = (totals[code] || 0) + total;
  });
  return totals;
}

// Same idea, but sums the remaining BALANCE DUE rather than the full
// invoice total — so a Sent invoice that's been partially paid only
// counts what's actually still outstanding.
export function groupBalanceDueByCurrency(invoices) {
  const totals = {};
  invoices.forEach((inv) => {
    const { balanceDue } = computeInvoiceBalance(inv);
    const code = inv.currency || "USD";
    totals[code] = (totals[code] || 0) + balanceDue;
  });
  return totals;
}

// --- Profit & Loss -----------------------------------------------------

// Income = money actually received (recorded payments), not just
// invoices marked Paid — so a partially-paid invoice only contributes
// what's actually come in. Invoices marked Paid before payment
// tracking existed (no logged payments) still count their full total,
// dated by due date as the best available proxy.
// Expenses = logged receipts. Both grouped by currency, since income
// and expenses in different currencies can't be netted together.
export function computeProfitAndLoss(invoices, receipts, period = "all") {
  const now = new Date();
  const inPeriod = (isoDate) => {
    if (period !== "month") return true;
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return false;
    return (
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    );
  };

  const income = {};
  invoices.forEach((inv) => {
    const code = inv.currency || "USD";
    const payments = inv.payments || [];
    if (payments.length > 0) {
      payments.forEach((p) => {
        if (!inPeriod(p.date)) return;
        income[code] = (income[code] || 0) + (Number(p.amount) || 0);
      });
    } else if (inv.status === "paid") {
      const { total } = computeInvoiceTotals(inv);
      const dateRef = inv.dueDate || inv.issueDate;
      if (inPeriod(dateRef)) {
        income[code] = (income[code] || 0) + total;
      }
    }
  });

  const expenses = {};
  receipts.forEach((r) => {
    if (!inPeriod(r.date)) return;
    const code = r.currency || "USD";
    expenses[code] = (expenses[code] || 0) + (Number(r.amount) || 0);
  });

  const codes = Array.from(
    new Set([...Object.keys(income), ...Object.keys(expenses)])
  ).sort();

  return codes.map((code) => ({
    code,
    income: income[code] || 0,
    expenses: expenses[code] || 0,
    profit: (income[code] || 0) - (expenses[code] || 0),
  }));
}

// Generates the next sequential invoice number from existing invoices,
// e.g. INV-0001, INV-0002 ...
export function nextInvoiceNumber(invoices = []) {
  let max = 0;
  invoices.forEach((inv) => {
    const match = /INV-(\d+)/.exec(inv.invoiceNumber || "");
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > max) max = n;
    }
  });
  const next = max + 1;
  return `INV-${String(next).padStart(4, "0")}`;
}
