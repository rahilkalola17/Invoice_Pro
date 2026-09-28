import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { useStyles, useTheme } from "../theme";
import ScreenHeader from "../components/ScreenHeader";
import { Card, CardHeader } from "../components/Card";
import { Input, SelectField } from "../components/Input";
import Button from "../components/Button";
import SegmentedControl from "../components/SegmentedControl";
import SelectModal from "../components/SelectModal";
import Alert from "../components/Dialog";
import PlanCard from "../components/PlanCard";
import { CURRENCIES } from "../utils/currency";

const MODE_OPTIONS = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

const makeStyles = ({ colors, spacing, type }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 40, gap: spacing.md },
  hint: { ...type.caption, color: colors.mutedForeground, marginTop: 10 },
  footnote: { ...type.caption, color: colors.mutedForeground, textAlign: "center", marginTop: spacing.sm },
});

export default function SettingsScreen() {
  const { settings, updateSettings } = useApp();
  const { mode, setMode } = useTheme();
  const styles = useStyles(makeStyles);

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [businessEmail, setBusinessEmail] = useState(settings.businessEmail);
  const [businessAddress, setBusinessAddress] = useState(settings.businessAddress);
  const [businessTaxNumber, setBusinessTaxNumber] = useState(settings.businessTaxNumber);
  const [defaultCurrency, setDefaultCurrency] = useState(settings.defaultCurrency);
  const [defaultTaxRate, setDefaultTaxRate] = useState(String(settings.defaultTaxRate));
  const [currencyOpen, setCurrencyOpen] = useState(false);

  function handleSave() {
    updateSettings({
      businessName: businessName.trim(),
      businessEmail: businessEmail.trim(),
      businessAddress: businessAddress.trim(),
      businessTaxNumber: businessTaxNumber.trim(),
      defaultCurrency,
      defaultTaxRate: Number(defaultTaxRate) || 0,
    });
    Alert.alert("Settings saved", "Your business profile and defaults have been updated.");
  }

  const currencyOptions = CURRENCIES.map((c) => ({
    label: `${c.name} (${c.code})`,
    value: c.code,
    subtitle: c.symbol,
  }));

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScreenHeader eyebrow="Preferences" title="Settings" />
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <PlanCard />

          <Card>
            <CardHeader icon="palette" title="Appearance" description="Choose how the app looks" />
            <View style={{ height: 14 }} />
            <SegmentedControl options={MODE_OPTIONS} value={mode} onChange={setMode} />
            <Text style={styles.hint}>System follows your phone's light or dark setting.</Text>
          </Card>

          <Card>
            <CardHeader icon="building-2" title="Business profile" description="Shown on every PDF invoice" />
            <View style={{ height: 14 }} />
            <Input label="Business or your name" value={businessName} onChangeText={setBusinessName} placeholder="e.g. Alex Rivera Design" />
            <Input label="Email" value={businessEmail} onChangeText={setBusinessEmail} placeholder="you@studio.com" keyboardType="email-address" autoCapitalize="none" />
            <Input label="Address" value={businessAddress} onChangeText={setBusinessAddress} placeholder="Street, city, state, ZIP" multiline />
            <Input label="Tax / GST / VAT registration number" value={businessTaxNumber} onChangeText={setBusinessTaxNumber} placeholder="Optional" />
          </Card>

          <Card>
            <CardHeader icon="percent" title="Tax & currency" description="Defaults for new invoices" />
            <View style={{ height: 14 }} />
            <SelectField label="Default currency" value={defaultCurrency} icon="banknote" onPress={() => setCurrencyOpen(true)} />
            <Input
              label="Default tax rate (GST / VAT %)"
              value={defaultTaxRate}
              onChangeText={(t) => setDefaultTaxRate(t.replace(/[^0-9.]/g, ""))}
              placeholder="0"
              keyboardType="decimal-pad"
              hint="You can still change the tax rate on each invoice."
            />
          </Card>

          <Button label="Save settings" fullWidth onPress={handleSave} />
          <Text style={styles.footnote}>All data is stored locally on this device.</Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <SelectModal
        visible={currencyOpen}
        title="Default currency"
        options={currencyOptions}
        selectedValue={defaultCurrency}
        onSelect={(value) => {
          setDefaultCurrency(value);
          setCurrencyOpen(false);
        }}
        onClose={() => setCurrencyOpen(false)}
      />
    </SafeAreaView>
  );
}
