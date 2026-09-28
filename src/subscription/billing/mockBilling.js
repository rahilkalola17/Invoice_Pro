// Simulated app store for the prototype. No payment is taken.
//
// A real adapter (RevenueCat, StoreKit / Play Billing) must expose the same
// methods and return the same entitlement shape; swap it in billing/index.js
// and nothing else in the app changes.
//
// Entitlement shape:
// { planId: "basic" | "pro", offerId, status: "none" | "trial" | "active",
//   trialEndsAt, expiresAt, willRenew, trialUsed }
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getOffer } from "../plans";

const KEY = "@fip/subscription";
const DAY = 86400000;

export const EMPTY_ENTITLEMENT = {
  planId: "basic",
  offerId: null,
  status: "none",
  trialEndsAt: null,
  expiresAt: null,
  willRenew: false,
  trialUsed: false,
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const periodMs = (offer) => (offer.period === "year" ? 365 : 30) * DAY;

async function read() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...EMPTY_ENTITLEMENT, ...JSON.parse(raw) } : EMPTY_ENTITLEMENT;
  } catch {
    return EMPTY_ENTITLEMENT;
  }
}

async function write(entitlement) {
  await AsyncStorage.setItem(KEY, JSON.stringify(entitlement));
  return entitlement;
}

// Brings a stored entitlement up to date: renewing subscriptions roll into
// their next period (a finished trial becomes "active"); cancelled ones drop
// back to Basic once they expire. Exported for tests.
export function resolveEntitlement(e, now = Date.now()) {
  if (e.planId !== "pro" || !e.expiresAt) return e;
  let expires = new Date(e.expiresAt).getTime();
  if (expires > now) return e;
  const offer = getOffer(e.offerId);
  if (!e.willRenew || !offer) return { ...EMPTY_ENTITLEMENT, trialUsed: e.trialUsed };
  while (expires <= now) expires += periodMs(offer);
  return { ...e, status: "active", trialEndsAt: null, expiresAt: new Date(expires).toISOString() };
}

// Pure: what a purchase of `offer` turns `current` into. Exported for tests.
export function applyPurchase(current, offer, now = Date.now()) {
  const trial = offer.trialDays > 0 && !current.trialUsed;
  const expiresAt = new Date(now + (trial ? offer.trialDays * DAY : periodMs(offer))).toISOString();
  return {
    planId: offer.planId,
    offerId: offer.id,
    status: trial ? "trial" : "active",
    trialEndsAt: trial ? expiresAt : null,
    expiresAt,
    willRenew: true,
    trialUsed: current.trialUsed || trial,
  };
}

async function getEntitlement() {
  const stored = await read();
  const current = resolveEntitlement(stored);
  if (current !== stored) await write(current);
  return current;
}

export const mockBilling = {
  name: "mock",
  getEntitlement,

  async purchase(offerId) {
    await wait(700); // feels like a store sheet
    const offer = getOffer(offerId);
    if (!offer) throw new Error("That plan is no longer available.");
    return write(applyPurchase(await getEntitlement(), offer));
  },

  // In the mock the purchase already lives on this device, so restoring is
  // just a re-read. A real adapter asks the store here.
  async restore() {
    await wait(500);
    return getEntitlement();
  },

  // Turn off auto-renew: Pro stays until expiresAt, then drops to Basic.
  async cancel() {
    return write({ ...(await getEntitlement()), willRenew: false });
  },

  async resume() {
    const current = await getEntitlement();
    if (current.planId !== "pro") return current;
    return write({ ...current, willRenew: true });
  },

  // Developer helper: forget the subscription, including the used trial.
  async reset() {
    return write(EMPTY_ENTITLEMENT);
  },
};
