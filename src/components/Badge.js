import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../theme";

const STATUS_LABEL = { draft: "Draft", sent: "Sent", overdue: "Overdue", paid: "Paid" };

// variant: default | secondary | outline | destructive | paid | sent | overdue | draft
export function Badge({ label, variant = "secondary", dot = false }) {
  const { colors, type } = useTheme();
  const statusPalette = colors.status[variant];
  const palette = statusPalette
    ? { bg: statusPalette.bg, fg: statusPalette.fg, border: statusPalette.border, dot: statusPalette.solid }
    : {
        default: { bg: colors.primary, fg: colors.primaryForeground, border: colors.primary },
        secondary: { bg: colors.secondary, fg: colors.secondaryForeground, border: colors.secondary },
        outline: { bg: "transparent", fg: colors.foreground, border: colors.border },
        destructive: { bg: colors.destructive, fg: "#FFFFFF", border: colors.destructive },
      }[variant];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 5,
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 999,
        borderWidth: 1,
        backgroundColor: palette.bg,
        borderColor: palette.border,
      }}
    >
      {dot ? (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: palette.dot || palette.fg,
          }}
        />
      ) : null}
      <Text style={{ fontFamily: type.fonts.medium, fontSize: 12, lineHeight: 16, color: palette.fg }}>
        {label}
      </Text>
    </View>
  );
}

export function StatusBadge({ status }) {
  return <Badge variant={status} label={STATUS_LABEL[status] || status} dot />;
}

export default StatusBadge;
