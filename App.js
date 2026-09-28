import React from "react";
import { Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
// Each Google Font weight is its own subpath export (much lighter than
// bundling the whole family).
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";

import { AppProvider } from "./src/context/AppContext";
import { SubscriptionProvider } from "./src/subscription/SubscriptionContext";
import { ThemeProvider, useTheme } from "./src/theme";
import AppNavigator from "./src/navigation/AppNavigator";
import { OverlayHost } from "./src/components/overlay";

function Shell() {
  const { colors, isDark } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <AppNavigator />
      {/* Sheets and dialogs render here, above the tab bar */}
      <OverlayHost />
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Never hang on a font problem; on web the preview page supplies the
  // fonts itself.
  const ready = fontsLoaded || fontError || Platform.OS === "web";
  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: "#09090B" }} />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppProvider>
          <SubscriptionProvider>
            <Shell />
          </SubscriptionProvider>
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
