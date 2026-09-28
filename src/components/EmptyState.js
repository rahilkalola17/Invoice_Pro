import React from "react";
import { Text, View } from "react-native";
import { useStyles } from "../theme";
import Icon from "./Icon";
import Button from "./Button";

const makeStyles = ({ colors, radius, spacing, type }) => ({
  wrap: { alignItems: "center", paddingHorizontal: spacing.xl, paddingVertical: 40 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: { ...type.subheading, color: colors.foreground, textAlign: "center" },
  subtitle: { ...type.small, color: colors.mutedForeground, textAlign: "center", marginTop: 4, maxWidth: 280 },
  action: { marginTop: spacing.lg },
});

export default function EmptyState({ icon = "inbox", title, subtitle, actionLabel, onAction }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.wrap}>
      <View style={styles.iconBox}>
        <Icon name={icon} size={22} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {actionLabel ? (
        <View style={styles.action}>
          <Button label={actionLabel} icon="plus" size="sm" onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
