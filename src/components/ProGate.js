import React from "react";
import { Text, View } from "react-native";
import { useStyles, useTheme } from "../theme";
import { Card } from "./Card";
import Icon from "./Icon";
import Button from "./Button";
import { useSubscription } from "../subscription/SubscriptionContext";
import { FEATURES } from "../subscription/plans";
import { openPaywall } from "../subscription/paywall";

const makeStyles = ({ colors, spacing, type }) => ({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: 6 },
  eyebrow: { ...type.tiny, color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.6 },
  title: { ...type.subheading, color: colors.foreground },
  body: { ...type.small, color: colors.mutedForeground, marginTop: 4, marginBottom: spacing.md },
});

// Wrap any Pro-only UI:  <ProGate feature="taxExport"> ... </ProGate>
// Pro users see the children; Basic users see an upgrade card (or `fallback`).
export default function ProGate({ feature, children, fallback }) {
  const { can } = useSubscription();
  if (can(feature)) return children;
  if (fallback !== undefined) return fallback;
  return <LockedFeature feature={feature} />;
}

export function LockedFeature({ feature }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const info = FEATURES[feature];
  return (
    <Card>
      <View style={styles.row}>
        <Icon name="lock" size={13} color={colors.mutedForeground} />
        <Text style={styles.eyebrow}>Pro feature</Text>
      </View>
      <Text style={styles.title}>{info ? info.label : "Pro feature"}</Text>
      <Text style={styles.body}>Upgrade to Pro to unlock this.</Text>
      <Button label="See Pro" icon="crown" variant="outline" size="sm" onPress={() => openPaywall({ feature })} />
    </Card>
  );
}
