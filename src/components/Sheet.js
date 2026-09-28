import React, { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, Text, View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStyles } from "../theme";
import Icon from "./Icon";
import { useOverlay } from "./overlay";

const makeStyles = ({ colors, radius, spacing, type }) => ({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleAbsolute(), backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border,
    maxHeight: "82%",
    paddingHorizontal: spacing.lg,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: 8,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  title: { ...type.heading, color: colors.foreground },
  close: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.muted,
  },
});

function StyleAbsolute() {
  return { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 };
}

function SheetContent({ title, onClose, children }) {
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    const native = Platform.OS !== "web";
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: native }),
      Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: native }),
    ]).start();
  }, [fade, slide]);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={[
          styles.sheet,
          { opacity: fade, transform: [{ translateY: slide }], paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} style={styles.close} hitSlop={8}>
            <Icon name="x" size={16} />
          </Pressable>
        </View>
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

// <Sheet id="x" visible title onClose>{children}</Sheet> — renders nothing
// itself; the content is presented through the app-level overlay host.
export default function Sheet({ id, visible, title, onClose, children }) {
  useOverlay(
    id,
    visible,
    <SheetContent title={title} onClose={onClose}>
      {children}
    </SheetContent>
  );
  return null;
}
