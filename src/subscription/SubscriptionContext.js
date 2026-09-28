import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import { useApp } from "../context/AppContext";
import { billing, EMPTY_ENTITLEMENT } from "./billing";
import { getPlan } from "./plans";
import { checkLimit, getUsage, hasFeature } from "./usage";

const SubscriptionContext = createContext(null);

// Knows the current plan and the user's usage, and answers the two questions
// the rest of the app asks: "can I use feature X?" and "can I create another Y?".
export function SubscriptionProvider({ children }) {
  const { clients, invoices, receipts } = useApp();
  const [entitlement, setEntitlement] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setEntitlement(await billing.getEntitlement());
    } catch {
      // Never lock someone out because the store is unreachable.
      setEntitlement((prev) => prev || EMPTY_ENTITLEMENT);
    }
  }, []);

  useEffect(() => {
    refresh();
    // Re-check on returning to the app so trial ends / expiries are noticed.
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  // Each action updates state with the entitlement the billing adapter returns.
  const run = useCallback(async (action) => {
    const next = await action();
    setEntitlement(next);
    return next;
  }, []);

  const planId = entitlement?.planId || "basic";
  const usage = useMemo(() => getUsage({ clients, invoices, receipts }), [clients, invoices, receipts]);

  const value = useMemo(
    () => ({
      ready: entitlement !== null,
      entitlement: entitlement || EMPTY_ENTITLEMENT,
      planId,
      plan: getPlan(planId),
      isPro: planId === "pro",
      usage,
      can: (feature) => hasFeature(planId, feature),
      limit: (kind) => checkLimit(planId, kind, usage),
      purchase: (offerId) => run(() => billing.purchase(offerId)),
      restore: () => run(() => billing.restore()),
      cancel: () => run(() => billing.cancel()),
      resume: () => run(() => billing.resume()),
      reset: () => run(() => billing.reset()),
    }),
    [entitlement, planId, usage, run]
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used within a SubscriptionProvider");
  return ctx;
}
