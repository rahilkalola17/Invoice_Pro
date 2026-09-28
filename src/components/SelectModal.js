import React from "react";
import { Pressable, Text, View } from "react-native";
import { useStyles } from "../theme";
import Sheet from "./Sheet";
import Icon from "./Icon";

const makeStyles = ({ colors, radius, spacing, type }) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: 2,
  },
  rowActive: { backgroundColor: colors.accent },
  rowPressed: { backgroundColor: colors.muted },
  label: { ...type.bodyMedium, color: colors.foreground },
  subtitle: { ...type.caption, color: colors.mutedForeground, marginTop: 2 },
  empty: {
    ...type.body,
    color: colors.mutedForeground,
    textAlign: "center",
    paddingVertical: spacing.xl,
  },
});

let counter = 0;

export default function SelectModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  emptyLabel = "Nothing to choose from yet.",
}) {
  const styles = useStyles(makeStyles);
  const idRef = React.useRef(`select-${++counter}`);

  return (
    <Sheet id={idRef.current} visible={visible} title={title} onClose={onClose}>
      {options.length === 0 ? (
        <Text style={styles.empty}>{emptyLabel}</Text>
      ) : (
        options.map((item) => {
          const active = item.value === selectedValue;
          return (
            <Pressable
              key={String(item.value)}
              onPress={() => onSelect(item.value)}
              style={({ pressed }) => [
                styles.row,
                active && styles.rowActive,
                pressed && styles.rowPressed,
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{item.label}</Text>
                {item.subtitle ? (
                  <Text style={styles.subtitle}>{item.subtitle}</Text>
                ) : null}
              </View>
              {active ? <Icon name="check" size={16} /> : null}
            </Pressable>
          );
        })
      )}
    </Sheet>
  );
}
