import React from "react";
import { Text, View } from "react-native";
import { useStyles, useTheme } from "../theme";
import { Card, CardHeader } from "./Card";
import Button from "./Button";
import { Badge } from "./Badge";
import Alert from "./Dialog";
import { useSubscription } from "../subscription/SubscriptionContext";
import { getOffer } from "../subscription/plans";
import { openPaywall } from "../subscription/paywall";
import { formatDate } from "../utils/calculations";

const METERS = [
  { kind: "clients", label: "Clients" },
  { kind: "invoices", label: "Invoices this month" },
  { kind: "receipts", label: "Receipts this month" },
];

const makeStyles = ({ colors, radius, spacing, type }) => ({
  meters: { marginTop: spacing.lg, gap: spacing.md },
  meterTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  meterLabel: { ...type.small, color: colors.mutedForeground },
  meterValue: { ...type.label, ...type.tabular, color: colors.foreground },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.muted, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },
  status: { ...type.small, color: colors.mutedForeground, marginTop: spacing.md },
  actions: { marginTop: spacing.lg, gap: spacing.sm },
  dev: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  devLabel: { ...type.caption, color: colors.mutedForeground, marginBottom: spacing.sm },
});

function proStatusText(e) {
  const offer = getOffer(e.offerId);
  const cycle = offer ? offer.label : "Pro";
  if (e.status === "trial") {
    return e.willRenew
      ? `Free trial ends ${formatDate(e.trialEndsAt)}, then ${cycle.toLowerCase()} billing starts.`
      : `Free trial ends ${formatDate(e.trialEndsAt)}. It won't renew.`;
  }
  return e.willRenew
    ? `${cycle} plan · renews ${formatDate(e.expiresAt)}`
    : `Cancelled · Pro until ${formatDate(e.expiresAt)}`;
}

export default function PlanCard() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { isPro, plan, entitlement, limit, cancel, resume, restore, reset } = useSubscription();

  function confirmCancel() {
    Alert.alert(
      "Cancel Pro?",
      `You'll keep Pro until ${formatDate(entitlement.expiresAt)}. After that you're back on Basic. Nothing is deleted, but Basic limits apply to new items.`,
      [
        { text: "Keep Pro", style: "cancel" },
        { text: "Cancel Pro", style: "destructive", onPress: () => cancel() },
      ]
    );
  }

  async function handleRestore() {
    const next = await restore();
    Alert.alert(
      next.planId === "pro" ? "Purchase restored" : "Nothing to restore",
      next.planId === "pro" ? "Your Pro subscription is active." : "No active Pro subscription was found for this device."
    );
  }

  return (
    <Card>
      <CardHeader
        icon="crown"
        title={`${plan.name} plan`}
        description={isPro ? "All features unlocked" : "Free, with monthly limits"}
        right={<Badge label={isPro ? (entitlement.status === "trial" ? "Trial" : "Pro") : "Free"} variant={isPro ? "default" : "secondary"} />}
      />

      {isPro ? (
        <Text style={styles.status}>{proStatusText(entitlement)}</Text>
      ) : (
        <View style={styles.meters}>
          {METERS.map((m) => {
            const info = limit(m.kind);
            const pct = info.limit ? Math.min(info.used / info.limit, 1) : 0;
            const full = !info.allowed;
            return (
              <View key={m.kind}>
                <View style={styles.meterTop}>
                  <Text style={styles.meterLabel}>{m.label}</Text>
                  <Text style={[styles.meterValue, full && { color: colors.destructive }]}>
                    {info.used} / {info.limit}
                  </Text>
                </View>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      { width: `${pct * 100}%`, backgroundColor: full ? colors.status.overdue.solid : colors.primary },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.actions}>
        {!isPro ? (
          <Button label="Upgrade to Pro" icon="crown" fullWidth onPress={() => openPaywall()} />
        ) : entitlement.willRenew ? (
          <Button label="Cancel subscription" variant="outline" fullWidth onPress={confirmCancel} />
        ) : (
          <Button label="Resume subscription" icon="rotate-ccw" fullWidth onPress={() => resume()} />
        )}
        <Button label="Restore purchase" variant="ghost" size="sm" fullWidth onPress={handleRestore} />
      </View>

      {__DEV__ ? (
        <View style={styles.dev}>
          <Text style={styles.devLabel}>Developer (hidden in release builds)</Text>
          <Button label="Reset to Basic (clears trial)" variant="outline" size="sm" fullWidth onPress={() => reset()} />
        </View>
      ) : null}
    </Card>
  );
}
