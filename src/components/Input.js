import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useStyles, useTheme } from "../theme";
import Icon from "./Icon";

const makeStyles = ({ colors, radius, spacing, type }) => ({
  wrap: { marginBottom: spacing.lg },
  label: { ...type.label, color: colors.foreground, marginBottom: 6 },
  required: { color: colors.destructive },
  field: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.input,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: 8,
  },
  fieldFocused: { borderColor: colors.foreground },
  fieldError: { borderColor: colors.destructive },
  fieldMultiline: { alignItems: "flex-start", paddingVertical: 4 },
  prefix: { ...type.bodyMedium, color: colors.mutedForeground },
  input: {
    ...type.body,
    flex: 1,
    color: colors.foreground,
    paddingVertical: 10,
    outlineWidth: 0,
  },
  inputMultiline: { minHeight: 84, textAlignVertical: "top", paddingTop: 8 },
  hint: { ...type.caption, color: colors.mutedForeground, marginTop: 6 },
  error: { ...type.caption, color: colors.destructive, marginTop: 6 },
  selectValue: { ...type.body, flex: 1, color: colors.foreground },
  selectPlaceholder: { ...type.body, flex: 1, color: colors.mutedForeground },
});

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
  required = false,
  prefix,
  editable = true,
  error,
  hint,
  autoCapitalize,
}) {
  const styles = useStyles(makeStyles);
  const [focused, setFocused] = useState(false);
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          focused && styles.fieldFocused,
          error && styles.fieldError,
        ]}
      >
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          keyboardType={keyboardType}
          multiline={multiline}
          editable={editable}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, multiline && styles.inputMultiline]}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

// A field that looks like an input but opens a picker sheet.
export function SelectField({ label, value, placeholder, onPress, icon, iconRight = "chevron-down", hint }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable onPress={onPress} style={styles.field} accessibilityRole="button">
        {icon ? <Icon name={icon} size={16} color={colors.mutedForeground} /> : null}
        <Text style={value ? styles.selectValue : styles.selectPlaceholder} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Icon name={iconRight} size={16} color={colors.mutedForeground} />
      </Pressable>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export default Input;
