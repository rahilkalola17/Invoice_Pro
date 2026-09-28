import React from "react";
import { Text, View } from "react-native";
import { useStyles, useTheme } from "../theme";
import { Card } from "./Card";
import Icon from "./Icon";
import Button from "./Button";
import { useSubscription } from "../subscription/SubscriptionContext";
import { describeLimit } from "../subscription/usage";
import { openPaywall } from "../subscription/paywall";

const makeStyles = ({ colors, radius, spacing, type }) => ({
  wrap: { padding: spacing.lg },
  tile: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: { ...type.heading, color: colors.foreground },
  message: { ...type.body, color: colors.mutedForeground, marginTop: 6, marginBottom: spacing.lg },
  actions: { gap: spacing.sm },
});

// Shown in place of a "new ..." form when a Basic user is at their limit.
// kind: "clients" | "invoices" | "receipts"
export default function LimitReached({ kind, onBack }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { limit } = useSubscription();
  const copy = describeLimit(kind, limit(kind));

  return (
    <View style={styles.wrap}>
      <Card>
        <View style={styles.tile}>
          <Icon name="lock" size={20} color={colors.foreground} />
        </View>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.message}>{copy.message}</Text>
        <View style={styles.actions}>
          <Button label="Upgrade to Pro" icon="crown" fullWidth onPress={() => openPaywall({ kind })} />
          {onBack ? <Button label="Go back" variant="outline" fullWidth onPress={onBack} /> : null}
        </View>
      </Card>
    </View>
  );
}
