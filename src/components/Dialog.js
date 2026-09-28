import React from "react";
import { Pressable, Text, View } from "react-native";
import { useStyles } from "../theme";
import Button from "./Button";
import { setOverlay } from "./overlay";

const makeStyles = ({ colors, radius, spacing, type, shadow }) => ({
  root: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg + 4,
    ...shadow.raised,
  },
  title: { ...type.heading, color: colors.foreground },
  message: { ...type.body, color: colors.mutedForeground, marginTop: 6 },
  footer: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg + 4 },
});

function AlertDialog({ title, message, buttons, onDismiss }) {
  const styles = useStyles(makeStyles);
  const list = buttons && buttons.length ? buttons : [{ text: "OK" }];
  const cancel = list.find((b) => b.style === "cancel");

  function press(button) {
    onDismiss();
    if (button.onPress) button.onPress();
  }

  return (
    <View style={styles.root}>
      <Pressable
        style={styles.backdrop}
        onPress={() => (cancel ? press(cancel) : onDismiss())}
      />
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <View style={styles.footer}>
          {list.map((button, i) => (
            <View key={i} style={{ flex: 1 }}>
              <Button
                label={button.text}
                variant={
                  button.style === "destructive"
                    ? "destructive"
                    : button.style === "cancel"
                    ? "outline"
                    : "default"
                }
                onPress={() => press(button)}
                fullWidth
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// Drop-in replacement for react-native's Alert:  Alert.alert(title, msg, buttons)
export const Alert = {
  alert(title, message, buttons) {
    const dismiss = () => setOverlay("alert-dialog", null);
    setOverlay(
      "alert-dialog",
      <AlertDialog
        title={title}
        message={message}
        buttons={buttons}
        onDismiss={dismiss}
      />
    );
  },
};

export default Alert;
