import React, { useEffect, useReducer } from "react";
import { StyleSheet, View } from "react-native";

// Sheets and dialogs are rendered by a single <OverlayHost /> mounted at
// the app root instead of React Native's <Modal>. That keeps them inside
// the app frame on every platform (including the web preview) and lets
// them share the app's theme.

let items = [];
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

export function setOverlay(id, element) {
  items = items.filter((item) => item.id !== id);
  if (element) items = [...items, { id, element }];
  emit();
}

// Declarative helper: show `element` while `visible` is true.
export function useOverlay(id, visible, element) {
  useEffect(() => {
    setOverlay(id, visible ? element : null);
  });
  useEffect(() => () => setOverlay(id, null), [id]);
}

export function OverlayHost() {
  const [, rerender] = useReducer((n) => n + 1, 0);
  useEffect(() => {
    listeners.add(rerender);
    return () => listeners.delete(rerender);
  }, []);

  if (items.length === 0) return null;
  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "box-none" }]}>
      {items.map((item) => (
        <React.Fragment key={item.id}>{item.element}</React.Fragment>
      ))}
    </View>
  );
}
