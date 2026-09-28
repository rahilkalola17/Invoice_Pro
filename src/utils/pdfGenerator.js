import * as Print from "expo-print";
import { computeInvoiceTotals } from "./calculations";
import { formatCurrency } from "./currency";

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatDateLong(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Builds the HTML that expo-print rasterizes into a fixed, un-editable
// PDF — this is intentionally plain, high-contrast, and print-safe
// rather than mirroring the in-app screen design pixel for pixel.
// options.branding: show the "Made with" footer (Basic plan). Pro turns it off.
export function buildInvoiceHtml(invoice, client, settings, options = {}) {
  const branding = options.branding !== false;
  const currency = invoice.currency || settings.defaultCurrency;
  const { subtotal, discount, tax, total } = computeInvoiceTotals(invoice);

  const rows = invoice.items
    .map((item) => {
      const qtyLabel =
        item.type === "flat"
          ? "Flat fee"
          : `${item.quantity} × ${formatCurrency(item.rate, currency)}/hr`;
      const amount =
        item.type === "flat"
          ? Number(item.rate) || 0
          : (Number(item.quantity) || 0) * (Number(item.rate) || 0);
      return `
        <tr>
          <td class="desc">${escapeHtml(item.description || "Line item")}</td>
          <td class="qty">${escapeHtml(qtyLabel)}</td>
          <td class="amt">${formatCurrency(amount, currency)}</td>
        </tr>`;
    })
    .join("");

  const discountRow =
    discount > 0
      ? `<div class="totalsRow"><span>Discount</span><span>-${formatCurrency(
          discount,
          currency
        )}</span></div>`
      : "";

  const taxRow =
    invoice.taxRate > 0
      ? `<div class="totalsRow"><span>Tax (${invoice.taxRate}%)</span><span>${formatCurrency(
          tax,
          currency
        )}</span></div>`
      : "";

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: Helvetica, Arial, sans-serif;
          color: #09090B;
          padding: 48px;
          font-size: 13px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #18181B;
          padding-bottom: 20px;
          margin-bottom: 28px;
        }
        .business h1 {
          font-size: 20px;
          margin: 0 0 4px 0;
          color: #18181B;
        }
        .business p { margin: 2px 0; color: #52525B; }
        .invoiceMeta { text-align: right; }
        .invoiceMeta .label {
          font-size: 11px;
          color: #71717A;
          margin: 0;
        }
        .invoiceMeta .number {
          font-size: 24px;
          font-weight: bold;
          color: #18181B;
          margin: 0 0 10px 0;
        }
        .badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
          text-transform: capitalize;
        }
        .billTo {
          display: flex;
          justify-content: space-between;
          margin-bottom: 28px;
        }
        .billTo .block { width: 48%; }
        .billTo h3 {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #71717A;
          margin: 0 0 6px 0;
        }
        .billTo p { margin: 2px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th {
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #71717A;
          border-bottom: 1px solid #E4E4E7;
          padding: 8px 4px;
        }
        td {
          padding: 10px 4px;
          border-bottom: 1px solid #F4F4F5;
          vertical-align: top;
        }
        td.desc { width: 55%; }
        td.qty { color: #52525B; }
        td.amt, th.amt { text-align: right; }
        .totalsBox {
          margin-left: auto;
          width: 260px;
        }
        .totalsRow {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          color: #52525B;
        }
        .totalsRow.grand {
          border-top: 2px solid #18181B;
          margin-top: 6px;
          padding-top: 12px;
          font-size: 18px;
          font-weight: bold;
          color: #18181B;
        }
        .notes {
          margin-top: 32px;
          padding-top: 16px;
          border-top: 1px solid #E4E4E7;
          color: #52525B;
        }
        .notes h3 {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #71717A;
          margin: 0 0 6px 0;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #71717A;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="business">
          <h1>${escapeHtml(settings.businessName || "Your Business Name")}</h1>
          <p>${escapeHtml(settings.businessEmail || "")}</p>
          <p>${escapeHtml(settings.businessAddress || "")}</p>
          ${
            settings.businessTaxNumber
              ? `<p>Tax No. ${escapeHtml(settings.businessTaxNumber)}</p>`
              : ""
          }
        </div>
        <div class="invoiceMeta">
          <p class="label">Invoice</p>
          <p class="number">${escapeHtml(invoice.invoiceNumber)}</p>
          <p class="label">Issued ${formatDateLong(invoice.issueDate)}</p>
          <p class="label">Due ${formatDateLong(invoice.dueDate)}</p>
        </div>
      </div>

      <div class="billTo">
        <div class="block">
          <h3>Billed to</h3>
          <p><strong>${escapeHtml(client?.name || "Client")}</strong></p>
          <p>${escapeHtml(client?.email || "")}</p>
          <p>${escapeHtml(client?.address || "")}</p>
          ${
            client?.taxNumber
              ? `<p>Tax No. ${escapeHtml(client.taxNumber)}</p>`
              : ""
          }
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Details</th>
            <th class="amt">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="totalsBox">
        <div class="totalsRow"><span>Subtotal</span><span>${formatCurrency(
          subtotal,
          currency
        )}</span></div>
        ${discountRow}
        ${taxRow}
        <div class="totalsRow grand"><span>Total due</span><span>${formatCurrency(
          total,
          currency
        )}</span></div>
      </div>

      ${
        invoice.notes
          ? `<div class="notes"><h3>Notes</h3><p>${escapeHtml(
              invoice.notes
            )}</p></div>`
          : ""
      }

      ${branding ? `<div class="footer">Made with Freelance Invoice Pro</div>` : ""}
    </body>
  </html>`;
}

// Renders the invoice to a PDF file on-device and returns its local
// file URI, ready to be shared or previewed.
export async function generateInvoicePdf(invoice, client, settings, options = {}) {
  const html = buildInvoiceHtml(invoice, client, settings, options);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri;
}
