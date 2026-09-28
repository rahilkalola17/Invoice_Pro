import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { Platform, StyleSheet, useColorScheme, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { palettes, radius, spacing, shadows, type } from "./tokens";

const STORAGE_KEY = "@fip/theme-mode";
const ThemeContext = createContext(null);

// mode: "system" follows the phone's appearance; "light" / "dark" force it.
export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState("system");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === "light" || saved === "dark" || saved === "system") {
          setModeState(saved);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const setMode = useCallback((next) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  // Preview hook: lets the web preview page switch themes from outside
  // the app. Harmless (and inert) on phones.
  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.__fipSetTheme = setMode;
    }
  }, [setMode]);

  const scheme = mode === "system" ? systemScheme || "light" : mode;
  const isDark = scheme === "dark";

  const theme = useMemo(
    () => ({
      mode,
      setMode,
      isDark,
      colors: isDark ? palettes.dark : palettes.light,
      shadow: isDark ? shadows.dark : shadows.light,
      radius,
      spacing,
      type,
    }),
    [mode, setMode, isDark]
  );

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: "#09090B" }} />;
  }

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

// Builds a StyleSheet from the current theme and re-creates it only when
// the theme changes: const styles = useStyles(makeStyles);
export function useStyles(factory) {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [theme, factory]);
}
