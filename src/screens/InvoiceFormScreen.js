import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { useStyles } from "../theme";
import Button from "../components/Button";
import { Card, CardHeader } from "../components/Card";
import { Input, SelectField } from "../components/Input";
import DateField from "../components/DateField";
import SegmentedControl from "../components/SegmentedControl";
import LineItemEditor from "../components/LineItemEditor";
import SelectModal from "../components/SelectModal";
import Alert from "../components/Dialog";
import { CURRENCIES, formatCurrency } from "../utils/currency";
import { computeInvoiceTotals, nextInvoiceNumber } from "../utils/calculations";
import LimitReached from "../components/LimitReached";
import { useSubscription } from "../subscription/SubscriptionContext";
import { openPaywall } from "../subscription/paywall";
import makeId from "../utils/id";

const DISCOUNT_OPTIONS = [
  { label: "Percent (%)", value: "percentage" },
  { label: "Flat amount", value: "flat" },
];

function emptyItem() {
  return { id: makeId("li"), description: "", type: "hourly", quantity: "1", rate: "" };
}

const makeStyles = ({ colors, spacing, type, shadow }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  number: { ...type.label, color: colors.mutedForeground },
  row: { flexDirection: "row", gap: spacing.md },
  half: { flex: 1 },
  sectionTitle: { ...type.subheading, color: colors.foreground, marginTop: spacing.sm },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  summaryLabel: { ...type.body, color: colors.mutedForeground },
  summaryValue: { ...type.bodyMedium, ...type.tabular, color: colors.foreground },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerLabel: { ...type.caption, color: colors.mutedForeground },
  footerTotal: { ...type.amount, color: colors.foreground },
});

export default function InvoiceFormScreen({ navigation, route }) {
  const { invoices, clients, settings, upsertInvoice, getClientById } = useApp();
  const styles = useStyles(makeStyles);
  const editingId = route.params?.invoiceId || null;
  const existing = editingId ? invoices.find((i) => i.id === editingId) : null;

  const [clientId, setClientId] = useState(existing?.clientId || null);
  const [invoiceNumber] = useState(existing?.invoiceNumber || nextInvoiceNumber(invoices));
  const [issueDate, setIssueDate] = useState(existing?.issueDate || new Date().toISOString());
  const [dueDate, setDueDate] = useState(
    existing?.dueDate || new Date(Date.now() + 14 * 86400000).toISOString()
  );
  const [currency, setCurrency] = useState(existing?.currency || settings.defaultCurrency);
  const [taxRate, setTaxRate] = useState(String(existing?.taxRate ?? settings.defaultTaxRate ?? 0));
  const [discountType, setDiscountType] = useState(existing?.discount?.type || "percentage");
  const [discountValue, setDiscountValue] = useState(String(existing?.discount?.value || ""));
  const [notes, setNotes] = useState(existing?.notes || "");
  const [items, setItems] = useState(existing?.items?.length ? existing.items : [emptyItem()]);
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false);
  const { limit } = useSubscription();
  // See ClientFormScreen: decided on open to avoid a flash after saving.
  const [lockedOnOpen] = useState(() => !existing && !limit("invoices").allowed);

  const selectedClient = clientId ? getClientById(clientId) : null;

  const totals = useMemo(
    () =>
      computeInvoiceTotals({
        items,
        discount: { type: discountType, value: Number(discountValue) || 0 },
        taxRate: Number(taxRate) || 0,
      }),
    [items, discountType, discountValue, taxRate]
  );

  const updateItem = (index, next) => setItems((prev) => prev.map((it, i) => (i === index ? next : it)));
  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  function handleSave() {
    if (!existing && !limit("invoices").allowed) {
      openPaywall({ kind: "invoices" });
      return;
    }
    if (!clientId) {
      Alert.alert("Select a client", "Choose who this invoice is for.");
      return;
    }
    const cleanItems = items
      .filter((it) => it.description.trim().length > 0)
      .map((it) => ({ ...it, quantity: Number(it.quantity) || 0, rate: Number(it.rate) || 0 }));
    if (cleanItems.length === 0) {
      Alert.alert("Add a line item", "Every invoice needs at least one item with a description.");
      return;
    }
    const invoice = {
      ...(existing || {}),
      id: existing?.id || makeId("inv"),
      invoiceNumber,
      clientId,
      issueDate,
      dueDate,
      currency,
      taxRate: Number(taxRate) || 0,
      discount: { type: discountType, value: Number(discountValue) || 0 },
      notes,
      items: cleanItems,
      status: existing?.status || "draft",
      payments: existing?.payments || [],
    };
    upsertInvoice(invoice);
    navigation.replace("InvoiceDetail", { invoiceId: invoice.id });
  }

  const clientOptions = clients.map((c) => ({ label: c.name, value: c.id, subtitle: c.email }));
  const currencyOptions = CURRENCIES.map((c) => ({
    label: `${c.name} (${c.code})`,
    value: c.code,
    subtitle: c.symbol,
  }));

  if (lockedOnOpen && !limit("invoices").allowed) {
    return (
      <SafeAreaView style={styles.screen} edges={["bottom"]}>
        <LimitReached kind="invoices" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.number}>{invoiceNumber}</Text>

          <Card>
            <CardHeader icon="user" title="Client" description="Who is this invoice for?" />
            <View style={{ height: 14 }} />
            <SelectField
              value={selectedClient ? selectedClient.name : null}
              placeholder={clients.length ? "Select a client" : "No clients yet — add one in Clients"}
              onPress={() => setClientPickerOpen(true)}
              hint={selectedClient?.email}
            />
          </Card>

          <Card>
            <CardHeader icon="calendar" title="Details" />
            <View style={{ height: 14 }} />
            <View style={styles.row}>
              <View style={styles.half}>
                <DateField label="Issue date" value={issueDate} onChange={setIssueDate} />
              </View>
              <View style={styles.half}>
                <DateField label="Due date" value={dueDate} onChange={setDueDate} />
              </View>
            </View>
            <SelectField
              label="Currency"
              value={currency}
              icon="banknote"
              onPress={() => setCurrencyPickerOpen(true)}
            />
          </Card>

          <Text style={styles.sectionTitle}>Line items</Text>
          {items.map((item, index) => (
            <LineItemEditor
              key={item.id}
              item={item}
              currency={currency}
              onChange={(next) => updateItem(index, next)}
              onRemove={() => removeItem(index)}
            />
          ))}
          <Button
            label="Add line item"
            icon="plus"
            variant="outline"
            fullWidth
            onPress={() => setItems((prev) => [...prev, emptyItem()])}
          />

          <Card>
            <CardHeader icon="percent" title="Discount & tax" />
            <View style={{ height: 14 }} />
            <SegmentedControl options={DISCOUNT_OPTIONS} value={discountType} onChange={setDiscountType} />
            <View style={{ height: 14 }} />
            <View style={styles.row}>
              <View style={styles.half}>
                <Input
                  label={discountType === "percentage" ? "Discount (%)" : "Discount"}
                  value={discountValue}
                  onChangeText={(t) => setDiscountValue(t.replace(/[^0-9.]/g, ""))}
                  placeholder="0"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.half}>
                <Input
                  label="Tax rate (%)"
                  value={taxRate}
                  onChangeText={(t) => setTaxRate(t.replace(/[^0-9.]/g, ""))}
                  placeholder="0"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </Card>

          <Card>
            <Input
              label="Notes to client"
              value={notes}
              onChangeText={setNotes}
              placeholder="Payment terms, thank-you note, bank details…"
              multiline
            />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totals.subtotal, currency)}</Text>
            </View>
            {totals.discount > 0 ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={styles.summaryValue}>−{formatCurrency(totals.discount, currency)}</Text>
              </View>
            ) : null}
            {Number(taxRate) > 0 ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax ({taxRate}%)</Text>
                <Text style={styles.summaryValue}>{formatCurrency(totals.tax, currency)}</Text>
              </View>
            ) : null}
          </Card>
        </ScrollView>

        <View style={styles.footer}>
          <View>
            <Text style={styles.footerLabel}>Total</Text>
            <Text style={styles.footerTotal}>{formatCurrency(totals.total, currency)}</Text>
          </View>
          <Button label={existing ? "Save changes" : "Save invoice"} onPress={handleSave} style={{ minWidth: 150 }} />
        </View>
      </KeyboardAvoidingView>

      <SelectModal
        visible={clientPickerOpen}
        title="Choose a client"
        options={clientOptions}
        selectedValue={clientId}
        onSelect={(value) => {
          setClientId(value);
          setClientPickerOpen(false);
        }}
        onClose={() => setClientPickerOpen(false)}
        emptyLabel="No clients yet. Add one from the Clients tab first."
      />
      <SelectModal
        visible={currencyPickerOpen}
        title="Choose a currency"
        options={currencyOptions}
        selectedValue={currency}
        onSelect={(value) => {
          setCurrency(value);
          setCurrencyPickerOpen(false);
        }}
        onClose={() => setCurrencyPickerOpen(false)}
      />
    </SafeAreaView>
  );
}
