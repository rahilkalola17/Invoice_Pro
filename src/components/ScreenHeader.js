import React from "react";
import { Text, View } from "react-native";
import { useStyles } from "../theme";

const makeStyles = ({ colors, spacing, type }) => ({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  left: { flex: 1 },
  eyebrow: { ...type.small, color: colors.mutedForeground, marginBottom: 2 },
  title: { ...type.title, color: colors.foreground },
  right: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
});

export default function ScreenHeader({ title, eyebrow, right }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        {eyebrow ? <Text style={styles.eyebrow} numberOfLines={1}>{eyebrow}</Text> : null}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}
