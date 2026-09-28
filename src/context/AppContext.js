import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { KEYS, loadJSON, saveJSON } from "../utils/storage";
import { buildSeed } from "../utils/seedData";
import { computeInvoiceTotals, paymentsTotal } from "../utils/calculations";
import makeId from "../utils/id";

const DEFAULT_SETTINGS = {
  businessName: "",
  businessEmail: "",
  businessAddress: "",
  businessTaxNumber: "",
  defaultCurrency: "USD",
  defaultTaxRate: 0,
};

const AppContext = createContext(null);

// Stamped once when a record is first created. Plan limits count by it, and
// edits keep the original value.
const now = () => new Date().toISOString();

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Load everything once on launch, seeding sample data the very
  // first time the app has ever been opened.
  useEffect(() => {
    (async () => {
      const alreadySeeded = await loadJSON(KEYS.SEEDED, false);
      let [c, i, r, s] = await Promise.all([
        loadJSON(KEYS.CLIENTS, []),
        loadJSON(KEYS.INVOICES, []),
        loadJSON(KEYS.RECEIPTS, []),
        loadJSON(KEYS.SETTINGS, DEFAULT_SETTINGS),
      ]);

      if (!alreadySeeded && c.length === 0 && i.length === 0) {
        const seed = buildSeed();
        c = seed.clients;
        i = seed.invoices;
        r = seed.receipts;
        await Promise.all([
          saveJSON(KEYS.CLIENTS, c),
          saveJSON(KEYS.INVOICES, i),
          saveJSON(KEYS.RECEIPTS, r),
          saveJSON(KEYS.SEEDED, true),
        ]);
      }

      setClients(c);
      setInvoices(i);
      setReceipts(r);
      setSettings({ ...DEFAULT_SETTINGS, ...s });
      setReady(true);
    })();
  }, []);

  // --- Clients -----------------------------------------------------
  const upsertClient = useCallback((client) => {
    setClients((prev) => {
      const exists = prev.some((c) => c.id === client.id);
      const next = exists
        ? prev.map((c) =>
            c.id === client.id ? { ...client, createdAt: client.createdAt || c.createdAt } : c
          )
        : [...prev, { ...client, id: client.id || makeId("cli"), createdAt: client.createdAt || now() }];
      saveJSON(KEYS.CLIENTS, next);
      return next;
    });
  }, []);

  const deleteClient = useCallback((id) => {
    setClients((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveJSON(KEYS.CLIENTS, next);
      return next;
    });
  }, []);

  // --- Invoices ------------------------------------------------------
  const upsertInvoice = useCallback((invoice) => {
    setInvoices((prev) => {
      const exists = prev.some((inv) => inv.id === invoice.id);
      const next = exists
        ? prev.map((inv) =>
            inv.id === invoice.id ? { ...invoice, createdAt: invoice.createdAt || inv.createdAt } : inv
          )
        : [...prev, { ...invoice, id: invoice.id || makeId("inv"), createdAt: invoice.createdAt || now() }];
      saveJSON(KEYS.INVOICES, next);
      return next;
    });
  }, []);

  const deleteInvoice = useCallback((id) => {
    setInvoices((prev) => {
      const next = prev.filter((inv) => inv.id !== id);
      saveJSON(KEYS.INVOICES, next);
      return next;
    });
  }, []);

  const setInvoiceStatus = useCallback((id, status) => {
    setInvoices((prev) => {
      const next = prev.map((inv) =>
        inv.id === id ? { ...inv, status } : inv
      );
      saveJSON(KEYS.INVOICES, next);
      return next;
    });
  }, []);

  // Records a payment against an invoice and, if it fully covers the
  // total, flips the invoice to Paid in the same update — so Payment
  // Tracking and the Payment Status Tracker never disagree.
  const addPayment = useCallback((invoiceId, payment) => {
    setInvoices((prev) => {
      const next = prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const payments = [
          ...(inv.payments || []),
          { ...payment, id: payment.id || makeId("pmt") },
        ];
        const { total } = computeInvoiceTotals(inv);
        const fullyPaid = total > 0 && paymentsTotal(payments) >= total;
        return { ...inv, payments, status: fullyPaid ? "paid" : inv.status };
      });
      saveJSON(KEYS.INVOICES, next);
      return next;
    });
  }, []);

  const deletePayment = useCallback((invoiceId, paymentId) => {
    setInvoices((prev) => {
      const next = prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        return {
          ...inv,
          payments: (inv.payments || []).filter((p) => p.id !== paymentId),
        };
      });
      saveJSON(KEYS.INVOICES, next);
      return next;
    });
  }, []);

  // --- Receipts ------------------------------------------------------
  const addReceipt = useCallback((receipt) => {
    setReceipts((prev) => {
      const next = [
        { ...receipt, id: receipt.id || makeId("rcp"), createdAt: receipt.createdAt || now() },
        ...prev,
      ];
      saveJSON(KEYS.RECEIPTS, next);
      return next;
    });
  }, []);

  const deleteReceipt = useCallback((id) => {
    setReceipts((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveJSON(KEYS.RECEIPTS, next);
      return next;
    });
  }, []);

  // --- Settings ------------------------------------------------------
  const updateSettings = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveJSON(KEYS.SETTINGS, next);
      return next;
    });
  }, []);

  const getClientById = useCallback(
    (id) => clients.find((c) => c.id === id) || null,
    [clients]
  );

  const value = useMemo(
    () => ({
      ready,
      clients,
      invoices,
      receipts,
      settings,
      upsertClient,
      deleteClient,
      upsertInvoice,
      deleteInvoice,
      setInvoiceStatus,
      addPayment,
      deletePayment,
      addReceipt,
      deleteReceipt,
      updateSettings,
      getClientById,
    }),
    [
      ready,
      clients,
      invoices,
      receipts,
      settings,
      upsertClient,
      deleteClient,
      upsertInvoice,
      deleteInvoice,
      setInvoiceStatus,
      addPayment,
      deletePayment,
      addReceipt,
      deleteReceipt,
      updateSettings,
      getClientById,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}
