import React from "react";
import { setOverlay } from "../components/overlay";
import Paywall from "../components/Paywall";

// Opens the full-screen Pro paywall from anywhere (it renders through the
// app-level OverlayHost, like sheets and dialogs).
// reason: optional { kind: "clients" | "invoices" | "receipts" } to explain why.
export function openPaywall(reason) {
  setOverlay("paywall", <Paywall reason={reason} onClose={closePaywall} />);
}

export function closePaywall() {
  setOverlay("paywall", null);
}
