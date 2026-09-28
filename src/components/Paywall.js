import React, { useEffect, useRef, useState } from "react";
import { Animated, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStyles, useTheme } from "../theme";
import Icon from "./Icon";
import Button from "./Button";
import { Badge } from "./Badge";
import Alert from "./Dialog";
import { useSubscription } from "../subscription/SubscriptionContext";
import { FEATURES, OFFERS } from "../subscription/plans";
import { describeLimit } from "../subscription/usage";
import { formatCurrency } from "../utils/currency";

const makeStyles = ({ colors, radius, spacing, type }) => ({
  root: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
  },
  topBar: { flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  close: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.muted,
  },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    backgroundColor: colors.heroBg,
    borderWidth: 1,
    borderColor: colors.heroBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  eyebrow: { ...type.label, color: colors.mutedForeground },
  title: { ...type.title, color: colors.foreground, marginTop: 4 },
  subtitle: { ...type.body, color: colors.mutedForeground, marginTop: 6 },
  reason: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: colors.status.overdue.bg,
    borderColor: colors.status.overdue.border,
  },
  reasonText: { ...type.label, color: colors.status.overdue.fg, flex: 1 },
  features: { marginTop: spacing.xl, gap: 14 },
  feature: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  featureLabel: { ...type.bodyMedium, color: colors.foreground, flex: 1 },
  offers: { marginTop: spacing.xl, gap: spacing.md },
  offer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  offerActive: { borderColor: colors.foreground, borderWidth: 2, padding: spacing.lg - 1 },
  offerInfo: { flex: 1 },
  offerTop: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  offerLabel: { ...type.subheading, color: colors.foreground },
  offerPrice: { ...type.amountSm, color: colors.foreground, marginTop: 4 },
  offerSub: { ...type.caption, color: colors.mutedForeground, marginTop: 2 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.input,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: colors.foreground },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.foreground },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    gap: spacing.sm,
  },
  fine: { ...type.caption, color: colors.mutedForeground, textAlign: "center" },
  proNote: { ...type.body, color: colors.foreground, marginTop: spacing.lg },
});

function priceLine(offer) {
  return `${formatCurrency(offer.price, "USD")}/${offer.period}`;
}

export default function Paywall({ reason, onClose }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isPro, entitlement, purchase, restore, limit } = useSubscription();
  const [offerId, setOfferId] = useState(OFFERS[0].id);
  const [busy, setBusy] = useState(null); // "buy" | "restore" | null
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: Platform.OS !== "web" }).start();
  }, [fade]);

  const offer = OFFERS.find((o) => o.id === offerId) || OFFERS[0];
  const trialEligible = offer.trialDays > 0 && !entitlement.trialUsed;
  const reasonText = reason?.kind && !isPro ? describeLimit(reason.kind, limit(reason.kind)).short : null;

  async function handleBuy() {
    setBusy("buy");
    try {
      await purchase(offer.id);
      onClose();
      Alert.alert(
        "Welcome to Pro",
        trialEligible
          ? `Your ${offer.trialDays}-day free trial has started. Everything in Pro is unlocked.`
          : "Everything in Pro is unlocked."
      );
    } catch (err) {
      Alert.alert("Purchase didn't go through", err?.message || "Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function handleRestore() {
    setBusy("restore");
    try {
      const next = await restore();
      if (next.planId === "pro") {
        onClose();
        Alert.alert("Purchase restored", "Your Pro subscription is active again.");
      } else {
        Alert.alert("Nothing to restore", "No active Pro subscription was found for this device.");
      }
    } catch (err) {
      Alert.alert("Couldn't restore", err?.message || "Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Animated.View style={[styles.root, { opacity: fade, paddingTop: insets.top + 8 }]}>
      <View style={styles.topBar}>
        <Pressable onPress={onClose} style={styles.close} hitSlop={8} accessibilityLabel="Close">
          <Icon name="x" size={18} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroIcon}>
          <Icon name="crown" size={26} color={colors.heroForeground} />
        </View>
        <Text style={styles.eyebrow}>Freelance Invoice Pro</Text>
        <Text style={styles.title}>{isPro ? "You're on Pro" : "Upgrade to Pro"}</Text>
        <Text style={styles.subtitle}>
          {isPro
            ? "Every Pro feature is unlocked on this device."
            : "No limits, no branding, and the tools that get you paid faster."}
        </Text>

        {reasonText ? (
          <View style={styles.reason}>
            <Icon name="lock" size={16} color={colors.status.overdue.fg} />
            <Text style={styles.reasonText}>{reasonText}</Text>
          </View>
        ) : null}

        {!isPro ? (
          <View style={styles.offers}>
            {OFFERS.map((o) => {
              const active = o.id === offerId;
              return (
                <Pressable
                  key={o.id}
                  onPress={() => setOfferId(o.id)}
                  style={[styles.offer, active && styles.offerActive]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <View style={styles.offerInfo}>
                    <View style={styles.offerTop}>
                      <Text style={styles.offerLabel}>{o.label}</Text>
                      {o.badge ? <Badge label={o.badge} variant="paid" /> : null}
                    </View>
                    <Text style={styles.offerPrice}>{priceLine(o)}</Text>
                    {o.period === "year" ? (
                      <Text style={styles.offerSub}>
                        {formatCurrency(o.price / 12, "USD")}/month, billed yearly
                      </Text>
                    ) : null}
                  </View>
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View style={styles.features}>
          {Object.entries(FEATURES).map(([key, f]) => (
            <View key={key} style={styles.feature}>
              <View style={styles.featureIcon}>
                <Icon name={f.icon} size={16} />
              </View>
              <Text style={styles.featureLabel}>{f.label}</Text>
              {f.available ? (
                <Icon name="check" size={16} color={colors.status.paid.fg} />
              ) : (
                <View>
                  <Badge label="Soon" variant="secondary" />
                </View>
              )}
            </View>
          ))}
        </View>

      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {isPro ? (
          <Button label="Done" fullWidth onPress={onClose} />
        ) : (
          <>
            <Button
              label={trialEligible ? `Start ${offer.trialDays}-day free trial` : "Subscribe to Pro"}
              fullWidth
              size="lg"
              loading={busy === "buy"}
              disabled={busy !== null}
              onPress={handleBuy}
            />
            <Text style={styles.fine}>
              {trialEligible
                ? `Free for ${offer.trialDays} days, then ${priceLine(offer)}. Cancel anytime.`
                : `${priceLine(offer)}. Cancel anytime.`}
            </Text>
            <Button
              label="Restore purchase"
              variant="ghost"
              size="sm"
              fullWidth
              loading={busy === "restore"}
              disabled={busy !== null}
              onPress={handleRestore}
            />
            <Text style={styles.fine}>Prototype: purchases are simulated on this device. No payment is taken.</Text>
          </>
        )}
      </View>
    </Animated.View>
  );
}
