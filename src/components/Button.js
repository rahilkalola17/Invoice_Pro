import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import { useTheme } from "../theme";
import Icon from "./Icon";

const SIZES = {
  default: { height: 44, paddingHorizontal: 16, fontSize: 14, icon: 16 },
  sm: { height: 36, paddingHorizontal: 12, fontSize: 13, icon: 14 },
  lg: { height: 50, paddingHorizontal: 22, fontSize: 15, icon: 18 },
  icon: { height: 40, width: 40, paddingHorizontal: 0, fontSize: 14, icon: 18 },
};

// variant: default | secondary | outline | ghost | destructive | destructive-outline
export default function Button({
  label,
  onPress,
  variant = "default",
  size = "default",
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}) {
  const { colors, radius, type, shadow } = useTheme();

  const palette = {
    default: { bg: colors.primary, fg: colors.primaryForeground, border: colors.primary },
    secondary: { bg: colors.secondary, fg: colors.secondaryForeground, border: colors.secondary },
    outline: { bg: colors.card, fg: colors.foreground, border: colors.input },
    ghost: { bg: "transparent", fg: colors.foreground, border: "transparent" },
    destructive: { bg: colors.destructive, fg: "#FFFFFF", border: colors.destructive },
    "destructive-outline": { bg: colors.card, fg: colors.destructive, border: colors.input },
  }[variant];
  const dim = SIZES[size];
  const filled = variant === "default" || variant === "destructive";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          height: dim.height,
          width: fullWidth ? "100%" : dim.width,
          paddingHorizontal: dim.paddingHorizontal,
          borderRadius: radius.md,
          borderWidth: 1,
          backgroundColor:
            pressed && !filled ? colors.accent : palette.bg,
          borderColor: palette.border,
          opacity: disabled ? 0.5 : pressed && filled ? 0.88 : 1,
        },
        variant === "outline" && !disabled ? shadow.card : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={dim.icon} color={palette.fg} /> : null}
          {label ? (
            <Text
              style={{
                fontFamily: type.fonts.medium,
                fontSize: dim.fontSize,
                color: palette.fg,
              }}
              numberOfLines={1}
            >
              {label}
            </Text>
          ) : null}
          {iconRight ? <Icon name={iconRight} size={dim.icon} color={palette.fg} /> : null}
        </>
      )}
    </Pressable>
  );
}
