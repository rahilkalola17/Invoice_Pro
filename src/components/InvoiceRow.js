import React from "react";
import { Pressable, Text, View } from "react-native";
import { useStyles } from "../theme";
import Avatar from "./Avatar";
import { StatusBadge } from "./Badge";
import {
  computeInvoiceTotals,
  effectiveStatus,
  formatDate,
} from "../utils/calculations";
import { formatCurrency } from "../utils/currency";

const makeStyles = ({ colors, spacing, type }) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  last: { borderBottomWidth: 0 },
  pressed: { backgroundColor: colors.accent },
  middle: { flex: 1 },
  name: { ...type.bodyMedium, color: colors.foreground },
  meta: { ...type.caption, color: colors.mutedForeground, marginTop: 2 },
  right: { alignItems: "flex-end", gap: 5 },
  amount: { ...type.amountSm, color: colors.foreground },
});

export default function InvoiceRow({ invoice, client, onPress, last }) {
  const styles = useStyles(makeStyles);
  const { total } = computeInvoiceTotals(invoice);
  const status = effectiveStatus(invoice);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, last && styles.last, pressed && styles.pressed]}
    >
      <Avatar name={client ? client.name : "?"} />
      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={1}>
          {client ? client.name : "No client"}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {invoice.invoiceNumber} · Due {formatDate(invoice.dueDate)}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{formatCurrency(total, invoice.currency)}</Text>
        <StatusBadge status={status} />
      </View>
    </Pressable>
  );
}
