import React from "react";
import { Pressable, Text, View } from "react-native";
import { useStyles, useTheme } from "../theme";
import Icon from "./Icon";
import { formatDate } from "../utils/calculations";
import { formatCurrency } from "../utils/currency";

const makeStyles = ({ colors, radius, spacing, type }) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pressed: { backgroundColor: colors.accent },
  tile: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.status.paid.bg,
    borderColor: colors.status.paid.border,
  },
  info: { flex: 1 },
  method: { ...type.bodyMedium, color: colors.foreground },
  meta: { ...type.caption, color: colors.mutedForeground, marginTop: 1 },
  amount: { ...type.amountSm, color: colors.status.paid.fg },
});

// Long-press a payment to delete it.
export default function PaymentRow({ payment, currency, onLongPress }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <Pressable
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.tile}>
        <Icon name="banknote" size={15} color={colors.status.paid.fg} />
      </View>
      <View style={styles.info}>
        <Text style={styles.method}>{payment.method}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {formatDate(payment.date)}
          {payment.note ? ` · ${payment.note}` : ""}
        </Text>
      </View>
      <Text style={styles.amount}>+{formatCurrency(payment.amount, currency)}</Text>
    </Pressable>
  );
}
