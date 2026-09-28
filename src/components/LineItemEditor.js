import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useStyles, useTheme } from "../theme";
import { Card } from "./Card";
import SegmentedControl from "./SegmentedControl";
import Icon from "./Icon";
import { lineItemAmount } from "../utils/calculations";
import { formatCurrency } from "../utils/currency";

const TYPE_OPTIONS = [
  { label: "Hourly", value: "hourly" },
  { label: "Flat fee", value: "flat" },
];

const makeStyles = ({ colors, radius, spacing, type }) => ({
  card: { marginBottom: spacing.md },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: 6,
  },
  descLabel: { ...type.label, color: colors.foreground },
  required: { color: colors.destructive },
  desc: {
    ...type.body,
    minHeight: 44,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.input,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingTop: 11,
    paddingBottom: 11,
    marginBottom: spacing.md,
    color: colors.foreground,
    textAlignVertical: "top",
    outlineWidth: 0,
  },
  descFocused: { borderColor: colors.foreground },
  remove: {
    width: 30,
    height: 30,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.muted,
  },
  numRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
  numField: { flex: 1 },
  numLabel: { ...type.caption, color: colors.mutedForeground, marginBottom: 4 },
  numInput: {
    ...type.body,
    ...type.tabular,
    height: 40,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.input,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    color: colors.foreground,
    outlineWidth: 0,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  amountLabel: { ...type.small, color: colors.mutedForeground },
  amount: { ...type.amountSm, color: colors.foreground },
});

function NumberField({ label, value, onChange, styles, colors }) {
  return (
    <View style={styles.numField}>
      <Text style={styles.numLabel}>{label}</Text>
      <TextInput
        value={String(value ?? "")}
        onChangeText={(text) => onChange(text.replace(/[^0-9.]/g, ""))}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={colors.mutedForeground}
        style={styles.numInput}
      />
    </View>
  );
}

export default function LineItemEditor({ item, currency, onChange, onRemove }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const amount = lineItemAmount(item);
  const [focused, setFocused] = useState(false);

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.descLabel}>
          Description<Text style={styles.required}> *</Text>
        </Text>
        <Pressable onPress={onRemove} hitSlop={8} style={styles.remove} accessibilityLabel="Remove item">
          <Icon name="trash-2" size={14} color={colors.mutedForeground} />
        </Pressable>
      </View>
      <TextInput
        value={item.description}
        onChangeText={(text) => onChange({ ...item, description: text })}
        placeholder="e.g. Logo design, 3 revision rounds"
        placeholderTextColor={colors.mutedForeground}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.desc, focused && styles.descFocused]}
        accessibilityLabel="Line item description (required)"
        multiline
      />

      <SegmentedControl
        options={TYPE_OPTIONS}
        value={item.type}
        onChange={(value) => onChange({ ...item, type: value })}
      />

      {item.type === "hourly" ? (
        <View style={styles.numRow}>
          <NumberField
            label="Hours"
            value={item.quantity}
            onChange={(v) => onChange({ ...item, quantity: v })}
            styles={styles}
            colors={colors}
          />
          <NumberField
            label="Rate per hour"
            value={item.rate}
            onChange={(v) => onChange({ ...item, rate: v })}
            styles={styles}
            colors={colors}
          />
        </View>
      ) : (
        <View style={styles.numRow}>
          <NumberField
            label="Flat amount"
            value={item.rate}
            onChange={(v) => onChange({ ...item, rate: v })}
            styles={styles}
            colors={colors}
          />
        </View>
      )}

      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Line total</Text>
        <Text style={styles.amount}>{formatCurrency(amount, currency)}</Text>
      </View>
    </Card>
  );
}
