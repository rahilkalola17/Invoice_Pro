import React, { useMemo } from "react";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "../theme";
import Icon from "../components/Icon";

import DashboardScreen from "../screens/DashboardScreen";
import InvoicesScreen from "../screens/InvoicesScreen";
import InvoiceFormScreen from "../screens/InvoiceFormScreen";
import InvoiceDetailScreen from "../screens/InvoiceDetailScreen";
import RecordPaymentScreen from "../screens/RecordPaymentScreen";
import ClientsScreen from "../screens/ClientsScreen";
import ClientFormScreen from "../screens/ClientFormScreen";
import ReceiptsScreen from "../screens/ReceiptsScreen";
import ReceiptCaptureScreen from "../screens/ReceiptCaptureScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator();
const InvoicesStack = createNativeStackNavigator();
const ClientsStack = createNativeStackNavigator();
const ReceiptsStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

function useStackOptions() {
  const { colors, type } = useTheme();
  return useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.background },
      headerShadowVisible: false,
      headerTitleStyle: { fontFamily: type.fonts.semibold, fontSize: 16, color: colors.foreground },
      headerTintColor: colors.foreground,
      headerBackButtonDisplayMode: "minimal",
      contentStyle: { backgroundColor: colors.background },
    }),
    [colors, type]
  );
}

const invoiceFormTitle = ({ route }) => ({
  title: route.params?.invoiceId ? "Edit invoice" : "New invoice",
});

function DashboardStackScreen() {
  const options = useStackOptions();
  return (
    <DashboardStack.Navigator screenOptions={options}>
      <DashboardStack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <DashboardStack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} options={{ title: "Invoice" }} />
      <DashboardStack.Screen name="InvoiceForm" component={InvoiceFormScreen} options={invoiceFormTitle} />
      <DashboardStack.Screen name="RecordPayment" component={RecordPaymentScreen} options={{ title: "Record payment" }} />
    </DashboardStack.Navigator>
  );
}

function InvoicesStackScreen() {
  const options = useStackOptions();
  return (
    <InvoicesStack.Navigator screenOptions={options}>
      <InvoicesStack.Screen name="Invoices" component={InvoicesScreen} options={{ headerShown: false }} />
      <InvoicesStack.Screen name="InvoiceForm" component={InvoiceFormScreen} options={invoiceFormTitle} />
      <InvoicesStack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} options={{ title: "Invoice" }} />
      <InvoicesStack.Screen name="RecordPayment" component={RecordPaymentScreen} options={{ title: "Record payment" }} />
    </InvoicesStack.Navigator>
  );
}

function ClientsStackScreen() {
  const options = useStackOptions();
  return (
    <ClientsStack.Navigator screenOptions={options}>
      <ClientsStack.Screen name="Clients" component={ClientsScreen} options={{ headerShown: false }} />
      <ClientsStack.Screen
        name="ClientForm"
        component={ClientFormScreen}
        options={({ route }) => ({ title: route.params?.clientId ? "Edit client" : "New client" })}
      />
    </ClientsStack.Navigator>
  );
}

function ReceiptsStackScreen() {
  const options = useStackOptions();
  return (
    <ReceiptsStack.Navigator screenOptions={options}>
      <ReceiptsStack.Screen name="Receipts" component={ReceiptsScreen} options={{ headerShown: false }} />
      <ReceiptsStack.Screen name="ReceiptCapture" component={ReceiptCaptureScreen} options={{ title: "Log expense" }} />
    </ReceiptsStack.Navigator>
  );
}

function SettingsStackScreen() {
  const options = useStackOptions();
  return (
    <SettingsStack.Navigator screenOptions={options}>
      <SettingsStack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
    </SettingsStack.Navigator>
  );
}

const TAB_ICON = {
  DashboardTab: "layout-dashboard",
  InvoicesTab: "file-text",
  ClientsTab: "users",
  ReceiptsTab: "receipt",
  SettingsTab: "settings",
};

export default function AppNavigator() {
  const { colors, isDark, type } = useTheme();

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.foreground,
        background: colors.background,
        card: colors.card,
        text: colors.foreground,
        border: colors.border,
        notification: colors.destructive,
      },
    };
  }, [colors, isDark]);

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.foreground,
          tabBarInactiveTintColor: colors.mutedForeground,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            borderTopWidth: 1,
          },
          tabBarLabelStyle: { fontFamily: type.fonts.medium, fontSize: 10.5 },
          tabBarIcon: ({ color, focused }) => (
            <Icon name={TAB_ICON[route.name]} size={21} color={color} strokeWidth={focused ? 2.3 : 1.9} />
          ),
        })}
      >
        <Tab.Screen name="DashboardTab" component={DashboardStackScreen} options={{ title: "Dashboard" }} />
        <Tab.Screen name="InvoicesTab" component={InvoicesStackScreen} options={{ title: "Invoices" }} />
        <Tab.Screen name="ClientsTab" component={ClientsStackScreen} options={{ title: "Clients" }} />
        <Tab.Screen name="ReceiptsTab" component={ReceiptsStackScreen} options={{ title: "Receipts" }} />
        <Tab.Screen name="SettingsTab" component={SettingsStackScreen} options={{ title: "Settings" }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
