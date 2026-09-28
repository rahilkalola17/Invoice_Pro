import makeId from "./id";

// Only used once, on the very first launch, so a freelancer opening
// the app for the first time can see what a real client/invoice/
// receipt looks like before entering their own. Users can delete
// these freely — they behave exactly like real records.
export function buildSeed() {
  const clientA = {
    id: makeId("cli"),
    name: "Marlowe & Finch Studio",
    email: "accounts@marlowefinch.com",
    phone: "+1 415 555 0148",
    address: "228 Bryant St, San Francisco, CA 94107",
    taxNumber: "US-TAX-88213",
  };
  const clientB = {
    id: makeId("cli"),
    name: "Rina Chatterjee",
    email: "rina.chatterjee@gmail.com",
    phone: "+91 98765 43210",
    address: "14 Lake View Road, Rajkot, Gujarat 360001",
    taxNumber: "22AAAAA0000A1Z5",
  };

  const today = new Date();
  const iso = (daysOffset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString();
  };

  const invoicePaid = {
    id: makeId("inv"),
    invoiceNumber: "INV-0001",
    clientId: clientA.id,
    issueDate: iso(-28),
    dueDate: iso(-14),
    currency: "USD",
    taxRate: 0,
    discount: { type: "percentage", value: 0 },
    status: "paid",
    notes: "Thank you for the quick turnaround on approvals.",
    items: [
      {
        id: makeId("li"),
        description: "Brand identity design — logo & style guide",
        type: "flat",
        quantity: 1,
        rate: 1800,
      },
      {
        id: makeId("li"),
        description: "Revision rounds",
        type: "hourly",
        quantity: 3,
        rate: 75,
      },
    ],
    payments: [
      {
        id: makeId("pmt"),
        amount: 2025,
        date: iso(-10),
        method: "Bank transfer",
        note: "Paid in full on delivery",
      },
    ],
  };

  const invoiceOverdue = {
    id: makeId("inv"),
    invoiceNumber: "INV-0002",
    clientId: clientB.id,
    issueDate: iso(-20),
    dueDate: iso(-6),
    currency: "INR",
    taxRate: 18,
    discount: { type: "flat", value: 500 },
    status: "sent",
    notes: "GST included as per the retainer agreement.",
    items: [
      {
        id: makeId("li"),
        description: "Monthly content writing retainer",
        type: "flat",
        quantity: 1,
        rate: 22000,
      },
    ],
    payments: [
      {
        id: makeId("pmt"),
        amount: 15000,
        date: iso(-15),
        method: "UPI",
        note: "Advance before month-end",
      },
    ],
  };

  const invoiceSent = {
    id: makeId("inv"),
    invoiceNumber: "INV-0003",
    clientId: clientA.id,
    issueDate: iso(-2),
    dueDate: iso(12),
    currency: "USD",
    taxRate: 0,
    discount: { type: "percentage", value: 0 },
    status: "sent",
    notes: "",
    items: [
      {
        id: makeId("li"),
        description: "Website UI design — 6 screens",
        type: "hourly",
        quantity: 18,
        rate: 65,
      },
    ],
  };

  const invoiceDraft = {
    id: makeId("inv"),
    invoiceNumber: "INV-0004",
    clientId: clientB.id,
    issueDate: iso(0),
    dueDate: iso(15),
    currency: "INR",
    taxRate: 18,
    discount: { type: "percentage", value: 0 },
    status: "draft",
    notes: "",
    items: [
      {
        id: makeId("li"),
        description: "Social media caption pack (30 posts)",
        type: "flat",
        quantity: 1,
        rate: 9000,
      },
    ],
  };

  const receipt = {
    id: makeId("rcp"),
    vendor: "Blue Bottle Coffee — client meeting",
    amount: 14.5,
    currency: "USD",
    category: "Meals & entertainment",
    date: iso(-3),
    note: "Coffee with Marlowe & Finch before kickoff.",
    imageUri: null,
  };

  return {
    clients: [clientA, clientB],
    invoices: [invoicePaid, invoiceOverdue, invoiceSent, invoiceDraft],
    receipts: [receipt],
  };
}
