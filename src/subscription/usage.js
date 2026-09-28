// Pure usage / entitlement maths (no React), in the same spirit as
// utils/calculations.js, so it can be tested on its own.
import { getPlan, LIMIT_KEYS } from "./plans";
import { formatDate } from "../utils/calculations";

export function isSameMonth(iso, now = new Date()) {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function nextMonthStart(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

// Only records carrying `createdAt` count. It is stamped when a record is
// first created (never from user-editable dates, so backdating can't dodge a
// limit). Seed data and records from before subscriptions never count.
// Usage is what currently exists, so deleting a record frees its slot.
export function getUsage({ clients = [], invoices = [], receipts = [] }, now = new Date()) {
  const createdThisMonth = (list) => list.filter((r) => isSameMonth(r.createdAt, now)).length;
  return {
    clients: clients.filter((c) => !!c.createdAt).length,
    invoices: createdThisMonth(invoices),
    receipts: createdThisMonth(receipts),
  };
}

// kind: "clients" | "invoices" | "receipts"
export function checkLimit(planId, kind, usage) {
  const plan = getPlan(planId);
  const used = (usage && usage[kind]) || 0;
  const limit = plan.limits ? plan.limits[LIMIT_KEYS[kind]] : null;
  if (limit == null) return { allowed: true, used, limit: null, remaining: null };
  return { allowed: used < limit, used, limit, remaining: Math.max(limit - used, 0) };
}

export function hasFeature(planId, feature) {
  return getPlan(planId).features.includes(feature);
}

// User-facing copy for a limit, shared by the paywall and the locked forms.
export function describeLimit(kind, info, now = new Date()) {
  const { used, limit } = info;
  const resets = formatDate(nextMonthStart(now).toISOString());
  switch (kind) {
    case "clients":
      return {
        title: "Client limit reached",
        short: `You've reached the ${limit}-client limit on Basic.`,
        message: `Basic includes up to ${limit} clients. Upgrade to Pro for unlimited clients, or delete one you no longer work with.`,
      };
    case "invoices":
      return {
        title: "Monthly invoice limit reached",
        short: `You've created ${used} of ${limit} invoices this month.`,
        message: `Basic includes ${limit} new invoices a month and you've used ${used}. Your allowance resets on ${resets}. Upgrade to Pro for unlimited invoices.`,
      };
    case "receipts":
      return {
        title: "Monthly receipt limit reached",
        short: `You've logged ${used} of ${limit} receipts this month.`,
        message: `Basic includes ${limit} new receipts a month and you've used ${used}. Your allowance resets on ${resets}. Upgrade to Pro for unlimited receipts.`,
      };
    default:
      return { title: "Limit reached", short: "", message: "" };
  }
}
