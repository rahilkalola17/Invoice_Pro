// Design tokens modelled on shadcn/ui's "zinc" theme: neutral surfaces,
// hairline borders, a near-black primary, and semantic colours reserved
// for status. Every colour has a light and a dark value; components read
// them through useTheme() so switching modes restyles the whole app.

const light = {
  background: "#FAFAFA",
  foreground: "#09090B",
  card: "#FFFFFF",
  cardForeground: "#09090B",
  primary: "#18181B",
  primaryForeground: "#FAFAFA",
  secondary: "#F4F4F5",
  secondaryForeground: "#18181B",
  muted: "#F4F4F5",
  mutedForeground: "#71717A",
  accent: "#F4F4F5",
  accentForeground: "#18181B",
  destructive: "#DC2626",
  destructiveForeground: "#FAFAFA",
  border: "#E4E4E7",
  input: "#E4E4E7",
  ring: "#A1A1AA",
  overlay: "rgba(9, 9, 11, 0.55)",
  // Dashboard hero card
  heroBg: "#18181B",
  heroBorder: "#18181B",
  heroForeground: "#FAFAFA",
  heroMuted: "#A1A1AA",
  // Status colours: fg = text, bg = tinted fill, border, solid = bars/dots
  status: {
    paid: { fg: "#047857", bg: "#ECFDF5", border: "#A7F3D0", solid: "#10B981" },
    sent: { fg: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE", solid: "#3B82F6" },
    overdue: { fg: "#B91C1C", bg: "#FEF2F2", border: "#FECACA", solid: "#EF4444" },
    draft: { fg: "#52525B", bg: "#F4F4F5", border: "#E4E4E7", solid: "#A1A1AA" },
  },
};

const dark = {
  background: "#09090B",
  foreground: "#FAFAFA",
  card: "#111113",
  cardForeground: "#FAFAFA",
  primary: "#FAFAFA",
  primaryForeground: "#18181B",
  secondary: "#27272A",
  secondaryForeground: "#FAFAFA",
  muted: "#1C1C1F",
  mutedForeground: "#A1A1AA",
  accent: "#27272A",
  accentForeground: "#FAFAFA",
  destructive: "#EF4444",
  destructiveForeground: "#FAFAFA",
  border: "#27272A",
  input: "#323238",
  ring: "#71717A",
  overlay: "rgba(0, 0, 0, 0.7)",
  heroBg: "#18181C",
  heroBorder: "#2A2A30",
  heroForeground: "#FAFAFA",
  heroMuted: "#A1A1AA",
  status: {
    paid: {
      fg: "#34D399",
      bg: "rgba(16, 185, 129, 0.12)",
      border: "rgba(16, 185, 129, 0.30)",
      solid: "#10B981",
    },
    sent: {
      fg: "#60A5FA",
      bg: "rgba(59, 130, 246, 0.12)",
      border: "rgba(59, 130, 246, 0.30)",
      solid: "#3B82F6",
    },
    overdue: {
      fg: "#F87171",
      bg: "rgba(239, 68, 68, 0.12)",
      border: "rgba(239, 68, 68, 0.30)",
      solid: "#EF4444",
    },
    draft: {
      fg: "#A1A1AA",
      bg: "rgba(161, 161, 170, 0.12)",
      border: "rgba(161, 161, 170, 0.25)",
      solid: "#71717A",
    },
  },
};

export const palettes = { light, dark };

export const radius = { sm: 6, md: 8, lg: 12, xl: 16, full: 999 };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

// Card elevation: a faint shadow in light mode, none in dark (borders do
// the work there) — the same restraint shadcn uses.
export const shadows = {
  light: {
    card: {
      shadowColor: "#09090B",
      shadowOpacity: 0.05,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    raised: {
      shadowColor: "#09090B",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
  },
  dark: { card: {}, raised: {} },
};

const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
};

const tabular = { fontVariant: ["tabular-nums"] };

export const type = {
  fonts,
  display: { fontFamily: fonts.semibold, fontSize: 34, lineHeight: 40, letterSpacing: -1, ...tabular },
  title: { fontFamily: fonts.semibold, fontSize: 24, lineHeight: 30, letterSpacing: -0.5 },
  heading: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  subheading: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20, letterSpacing: -0.1 },
  amount: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 26, letterSpacing: -0.4, ...tabular },
  amountSm: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20, letterSpacing: -0.2, ...tabular },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 16 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  tiny: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 14 },
  tabular,
};
