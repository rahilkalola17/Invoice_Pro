# Freelance Invoice Pro

A focused invoicing and expense app for freelancers, built with React Native
(Expo **SDK 57**). Everything runs locally on your phone. No backend, no
account.

## Features

| Feature | Where it lives |
|---|---|
| Client management | `screens/ClientsScreen.js`, `ClientFormScreen.js` |
| Invoice creator (line items, hourly / flat fee, discounts, tax, currency) | `screens/InvoiceFormScreen.js`, `components/LineItemEditor.js` |
| Receipt capture (camera / photo library) | `screens/ReceiptCaptureScreen.js` |
| PDF generation | `utils/pdfGenerator.js` (`expo-print`) |
| One-touch sharing (WhatsApp, Mail, Messages, Slack…) | `InvoiceDetailScreen.js` (`expo-sharing`) |
| Payment status tracker (Draft / Sent / Overdue / Paid) | `screens/DashboardScreen.js`, `InvoicesScreen.js` |
| Payment tracking: partial / full payments with date and method | `screens/RecordPaymentScreen.js`, Payments card on the invoice screen |
| Automatic overdue detection | `effectiveStatus()` in `utils/calculations.js` |
| Profit & loss (income − expenses) | Profit & loss card on the Dashboard, `computeProfitAndLoss()` |
| Tax & currency settings | `screens/SettingsScreen.js` |
| **Light / dark / system theme** | `theme/`, switch in **Settings → Appearance** or the sun/moon button on the Dashboard |

## Subscriptions: Basic and Pro

| | **Basic** (free) | **Pro** ($6.99/month or $49.99/year, 7-day trial) |
|---|---|---|
| Clients | up to 3 | unlimited |
| New invoices | 5 per month | unlimited |
| New receipts | 10 per month | unlimited |
| PDF footer | "Made with Freelance Invoice Pro" | none |
| Premium add-ons (signatures, reminders, payment links, time tracker, recurring, cloud sync, tax export) | locked | included (shown as "Soon" until built) |

**Prototype billing.** Purchases are simulated on the device
(`subscription/billing/mockBilling.js`); no payment is taken and the app still
runs in Expo Go. To go live, write an adapter with the same methods
(`getEntitlement`, `purchase`, `restore`, `cancel`, `resume`) for RevenueCat or
StoreKit / Play Billing and change the one export in
`subscription/billing/index.js`.

**How it works**

- `src/subscription/plans.js` is the only place limits, prices and plan
  features are defined.
- `src/subscription/usage.js` is the pure maths: usage counts records by a
  `createdAt` stamp added when they're first created (seed data and older
  records never count). Monthly limits follow the calendar month, and deleting
  a record frees its slot.
- `useSubscription()` gives `isPro`, `can(feature)`, `limit(kind)`,
  `purchase()`, `restore()`, `cancel()` and `resume()`.
- `openPaywall({ kind })` shows the paywall from anywhere. `<ProGate feature="...">`
  wraps Pro-only UI. A "new" client, invoice or receipt form shows an upgrade
  card when Basic is at its limit.
- Only creating is limited. Viewing, editing, sharing, payments and deleting
  always work, and downgrading never removes data.
- Settings → Plan shows usage meters, upgrade, cancel/resume and restore. In
  development builds it also has **Reset to Basic** for testing.

## Design system

The UI follows the **shadcn/ui** design language (zinc palette, hairline
borders, near-black primary, tinted status badges, Tabs-style toggles,
bottom sheets, alert dialogs) with **Lucide** icons and the **Inter** font.

shadcn/ui itself is web-only (React DOM + Tailwind + Radix), so it is
re-created natively here: `src/theme/tokens.js` holds the light and dark
palettes, and `src/components/` holds the Button, Card, Badge, Input, Tabs
(SegmentedControl), Sheet, AlertDialog, Calendar and Avatar building blocks.
Every colour comes from `useTheme()`, so switching modes restyles the entire
app.

## Getting started

```bash
npm install
npx expo start
```

1. Install **Expo Go** from the App Store / Play Store and open it once.
2. Put your phone and computer on the **same Wi-Fi network**.
3. **iPhone:** scan the QR code with the built-in **Camera** app and tap the
   banner. **Android:** open Expo Go → "Scan QR code".

To preview in a browser: `npm run web`.

### Expo Go and SDK versions

Expo Go supports **one SDK version at a time**, and the App Store version
updates to the newest SDK. This project targets **SDK 57**. If Expo Go ever
shows *"Project is incompatible with this version of Expo Go"*, upgrade the
project to the SDK it names:

```bash
npx expo install expo@latest --fix
```

(Expo publishes the exact list of matching package versions for each SDK;
`--fix` applies it.)

### Troubleshooting the QR code

| Symptom | Fix |
|---|---|
| Camera says **"No usable data found"** | Expo Go isn't installed (or never opened). Install it, open it once, scan again. |
| QR is cut off / won't focus | Enlarge the terminal (or zoom text out) so the whole square is visible. |
| Scans but times out | Same Wi-Fi? Turn on **Settings → Expo Go → Local Network**, or run `npm run start:tunnel`. |
| Camera still won't cooperate | In Expo Go choose *Enter URL manually* and type the `exp://192.168.x.x:8081` address shown under the QR. |

## Project structure

```
index.js              Registers the root component
App.js                Fonts, theme + data providers, overlay host
src/theme/            Design tokens (light/dark), ThemeProvider, useTheme/useStyles
src/components/       Reusable UI (shadcn-style) + Lucide icon data
src/screens/          One file per screen
src/navigation/       Theme-aware bottom tabs + nested stacks
src/context/          App data (AsyncStorage persistence)
src/subscription/     Plans, usage limits, subscription state, billing adapter, paywall
src/utils/            Money maths, currency, PDF, seed data
```

## Notes

- Sample clients, invoices, a partial payment and a receipt are seeded on
  first launch so the app isn't empty. Delete them freely.
- Icons are generated from the official Lucide SVGs (ISC licence) into
  `src/components/iconData.js`.
- All data stays on the device.
