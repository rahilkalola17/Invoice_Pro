import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { useStyles } from "../theme";
import { Card, CardHeader } from "../components/Card";
import { Input } from "../components/Input";
import Button from "../components/Button";
import Alert from "../components/Dialog";
import LimitReached from "../components/LimitReached";
import { useSubscription } from "../subscription/SubscriptionContext";
import { openPaywall } from "../subscription/paywall";
import makeId from "../utils/id";

const makeStyles = ({ colors, spacing }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: 40, gap: spacing.md },
});

export default function ClientFormScreen({ navigation, route }) {
  const { clients, upsertClient, deleteClient } = useApp();
  const styles = useStyles(makeStyles);
  const clientId = route.params?.clientId || null;
  const existing = clientId ? clients.find((c) => c.id === clientId) : null;

  const [name, setName] = useState(existing?.name || "");
  const [email, setEmail] = useState(existing?.email || "");
  const [phone, setPhone] = useState(existing?.phone || "");
  const [address, setAddress] = useState(existing?.address || "");
  const [taxNumber, setTaxNumber] = useState(existing?.taxNumber || "");
  const { limit } = useSubscription();
  // Decided when the screen opens, so saving the last allowed client doesn't
  // flash the locked card on the way out. Upgrading unlocks it live.
  const [lockedOnOpen] = useState(() => !existing && !limit("clients").allowed);

  function handleSave() {
    if (!name.trim()) {
      Alert.alert("Add a name", "A client needs at least a name.");
      return;
    }
    if (!existing && !limit("clients").allowed) {
      openPaywall({ kind: "clients" });
      return;
    }
    upsertClient({
      ...(existing || {}),
      id: existing?.id || makeId("cli"),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      taxNumber: taxNumber.trim(),
    });
    navigation.goBack();
  }

  function handleDelete() {
    Alert.alert(
      "Delete client",
      `Remove ${existing.name}? Their past invoices keep this info, but you won't be able to select them for new ones.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteClient(existing.id);
            navigation.goBack();
          },
        },
      ]
    );
  }

  if (lockedOnOpen && !limit("clients").allowed) {
    return (
      <SafeAreaView style={styles.screen} edges={["bottom"]}>
        <LimitReached kind="clients" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Card>
            <CardHeader icon="building-2" title="Client details" />
            <View style={{ height: 14 }} />
            <Input label="Client or company name" value={name} onChangeText={setName} placeholder="e.g. Marlowe & Finch Studio" required />
            <Input label="Email" value={email} onChangeText={setEmail} placeholder="billing@client.com" keyboardType="email-address" autoCapitalize="none" />
            <Input label="Phone" value={phone} onChangeText={setPhone} placeholder="+1 555 000 0000" keyboardType="phone-pad" />
          </Card>

          <Card>
            <CardHeader icon="landmark" title="Billing" />
            <View style={{ height: 14 }} />
            <Input label="Billing address" value={address} onChangeText={setAddress} placeholder="Street, city, state, ZIP" multiline />
            <Input label="Tax / GST / VAT number" value={taxNumber} onChangeText={setTaxNumber} placeholder="Optional" />
          </Card>

          <Button label={existing ? "Save changes" : "Add client"} fullWidth onPress={handleSave} />
          {existing ? (
            <Button label="Delete client" icon="trash-2" variant="destructive-outline" fullWidth onPress={handleDelete} />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
