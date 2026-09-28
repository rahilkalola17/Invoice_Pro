import React from "react";
import { Text, View } from "react-native";
import { useStyles } from "../theme";
import Icon from "./Icon";

const makeStyles = ({ colors, radius, spacing, type, shadow }) => ({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  inner: { overflow: "hidden", borderRadius: radius.lg - 1 },
  padded: { padding: spacing.lg },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { ...type.subheading, color: colors.cardForeground },
  description: { ...type.caption, color: colors.mutedForeground, marginTop: 1 },
  separator: { height: 1, backgroundColor: colors.border },
  separatorV: { width: 1, backgroundColor: colors.border, alignSelf: "stretch" },
});

// padded=false is for cards that hold full-bleed rows (lists, tables).
export function Card({ children, padded = true, style }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.inner, padded && styles.padded]}>{children}</View>
    </View>
  );
}

export function CardHeader({ title, description, icon, right, style }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerLeft}>
        {icon ? (
          <View style={styles.iconBox}>
            <Icon name={icon} size={16} />
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
      </View>
      {right}
    </View>
  );
}

export function Separator({ vertical = false, style }) {
  const styles = useStyles(makeStyles);
  return <View style={[vertical ? styles.separatorV : styles.separator, style]} />;
}
