import React from "react";
import { Pressable, Text, View } from "react-native";
import { useStyles } from "../theme";

const makeStyles = ({ colors, radius, type, shadow, isDark }) => ({
  track: {
    flexDirection: "row",
    backgroundColor: colors.muted,
    borderRadius: radius.lg,
    padding: 3,
  },
  tab: {
    flex: 1,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  tabActive: { backgroundColor: isDark ? colors.accent : colors.card, ...shadow.raised },
  text: { ...type.label, color: colors.mutedForeground },
  textActive: { color: colors.foreground },
});

export default function SegmentedControl({ options, value, onChange }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.track}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.tab, active && styles.tabActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.text, active && styles.textActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
