import React from "react";
import { Pressable, Text, View } from "react-native";
import { useStyles, useTheme } from "../theme";
import Avatar from "./Avatar";
import Icon from "./Icon";

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
  info: { flex: 1 },
  name: { ...type.bodyMedium, color: colors.foreground },
  meta: { ...type.caption, color: colors.mutedForeground, marginTop: 2 },
});

export default function ClientRow({ client, onPress, last }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, last && styles.last, pressed && styles.pressed]}
    >
      <Avatar name={client.name} size={40} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{client.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {client.email || client.phone || "No contact details"}
        </Text>
      </View>
      <Icon name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}
