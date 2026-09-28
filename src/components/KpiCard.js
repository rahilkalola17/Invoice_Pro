import React from "react";
import { Pressable, Text, View } from "react-native";
import { useStyles, useTheme } from "../theme";
import Icon from "./Icon";

const makeStyles = ({ colors, radius, spacing, type, shadow }) => ({
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    ...shadow.card,
  },
  pressed: { backgroundColor: colors.accent },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  tile: {
    width: 30,
    height: 30,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { ...type.label, color: colors.mutedForeground, marginBottom: 4 },
  amount: { ...type.amount, color: colors.foreground },
  amountMinor: { ...type.small, ...type.tabular, color: colors.mutedForeground, marginTop: 1 },
  count: { ...type.caption, color: colors.mutedForeground, marginTop: 6 },
});

// tone is a status key (paid | sent | overdue | draft) that picks the colours.
export default function KpiCard({ label, icon, tone, lines, count, onPress }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const palette = colors.status[tone];
  const list = lines && lines.length ? lines : ["—"];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <View style={[styles.tile, { backgroundColor: palette.bg, borderColor: palette.border }]}>
          <Icon name={icon} size={15} color={palette.fg} />
        </View>
        <Icon name="arrow-up-right" size={15} color={colors.mutedForeground} />
      </View>
      <Text style={styles.label}>{label}</Text>
      {list.map((line, i) => (
        <Text key={line + i} style={i === 0 ? styles.amount : styles.amountMinor} numberOfLines={1}>
          {line}
        </Text>
      ))}
      <Text style={styles.count}>
        {count} {count === 1 ? "invoice" : "invoices"}
      </Text>
    </Pressable>
  );
}
