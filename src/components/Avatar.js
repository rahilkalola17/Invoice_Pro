import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../theme";

export function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ name, size = 36 }) {
  const { colors, type } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.muted,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontFamily: type.fonts.semibold,
          fontSize: size * 0.34,
          color: colors.mutedForeground,
        }}
      >
        {initials(name)}
      </Text>
    </View>
  );
}
