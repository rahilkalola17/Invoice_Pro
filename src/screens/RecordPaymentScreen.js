import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { useStyles } from "../theme";
import { Card } from "../components/Card";
import { Input, SelectField } from "../components/Input";
import DateField from "../components/DateField";
import Button from "../components/Button";
import SelectModal from "../components/SelectModal";
import Alert from "../components/Dialog";
import { computeInvoiceBalance } from "../utils/calculations";
import { formatCurrency } from "../utils/currency";
import { PAYMENT_METHODS } from "../utils/paymentMethods";
import makeId from "../utils/id";

const makeStyles = ({ colors, radius, spacing, type }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: 40, gap: spacing.md },
  balance: {
    backgroundColor: colors.muted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  balanceLabel: { ...type.label, color: colors.mutedForeground },
  balanceAmount: { ...type.display, color: colors.foreground, marginTop: 4 },
});

export default function RecordPaymentScreen({ navigation, route }) {
  const { invoiceId } = route.params;
  const { invoices, addPayment } = useApp();
  const styles = useStyles(makeStyles);
  const invoice = invoices.find((i) => i.id === invoiceId);
  const { balanceDue } = invoice ? computeInvoiceBalance(invoice) : { balanceDue: 0 };

  const [amount, setAmount] = useState(balanceDue > 0 ? balanceDue.toFixed(2) : "");
  const [date, setDate] = useState(new Date().toISOString());
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [note, setNote] = useState("");
  const [methodOpen, setMethodOpen] = useState(false);

  if (!invoice) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={{ padding: 16 }}>This invoice no longer exists.</Text>
      </SafeAreaView>
    );
  }

  function handleSave() {
    const value = Number(amount);
    if (!value || value <= 0) {
      Alert.alert("Add an amount", "Enter how much the client paid.");
      return;
    }
    addPayment(invoice.id, { id: makeId("pmt"), amount: value, date, method, note: note.trim() });
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.screen} edges={["bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.balance}>
            <Text style={styles.balanceLabel}>Balance due on {invoice.invoiceNumber}</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(balanceDue, invoice.currency)}</Text>
          </View>

          <Card>
            <Input
              label="Amount received"
              value={amount}
              onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ""))}
              placeholder="0.00"
              keyboardType="decimal-pad"
              prefix={invoice.currency}
              required
              hint="Enter less than the balance to record a partial payment."
            />
            <DateField label="Payment date" value={date} onChange={setDate} />
            <SelectField label="Payment method" value={method} icon="credit-card" onPress={() => setMethodOpen(true)} />
            <Input
              label="Note (optional)"
              value={note}
              onChangeText={setNote}
              placeholder="e.g. Reference number"
              multiline
            />
            <Button label="Save payment" fullWidth onPress={handleSave} />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      <SelectModal
        visible={methodOpen}
        title="Payment method"
        options={PAYMENT_METHODS.map((m) => ({ label: m, value: m }))}
        selectedValue={method}
        onSelect={(value) => {
          setMethod(value);
          setMethodOpen(false);
        }}
        onClose={() => setMethodOpen(false)}
      />
    </SafeAreaView>
  );
}
