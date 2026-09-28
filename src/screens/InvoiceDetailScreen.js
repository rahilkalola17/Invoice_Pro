import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import { useApp } from "../context/AppContext";
import { useStyles, useTheme } from "../theme";
import Button from "../components/Button";
import { Card, CardHeader, Separator } from "../components/Card";
import { StatusBadge } from "../components/Badge";
import Avatar from "../components/Avatar";
import Icon from "../components/Icon";
import SelectModal from "../components/SelectModal";
import PaymentRow from "../components/PaymentRow";
import Alert from "../components/Dialog";
import {
  computeInvoiceTotals,
  computeInvoiceBalance,
  effectiveStatus,
  formatDate,
  lineItemAmount,
} from "../utils/calculations";
import { formatCurrency } from "../utils/currency";
import { buildInvoiceHtml, generateInvoicePdf } from "../utils/pdfGenerator";
import { useSubscription } from "../subscription/SubscriptionContext";

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft", subtitle: "Not sent to the client yet" },
  { label: "Sent", value: "sent", subtitle: "Waiting for payment" },
  { label: "Paid", value: "paid", subtitle: "Payment received in full" },
];

const makeStyles = ({ colors, radius, spacing, type }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: 40, gap: spacing.md },
  head: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  headInfo: { flex: 1 },
  number: { ...type.label, color: colors.mutedForeground },
  client: { ...type.title, color: colors.foreground, marginTop: 2 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  meta: { flexDirection: "row" },
  metaCell: { flex: 1, paddingVertical: 14, paddingHorizontal: spacing.md },
  metaLabel: { ...type.caption, color: colors.mutedForeground, marginBottom: 3 },
  metaValue: { ...type.label, color: colors.foreground },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemDesc: { ...type.bodyMedium, color: colors.foreground },
  itemMeta: { ...type.caption, color: colors.mutedForeground, marginTop: 2 },
  itemAmount: { ...type.amountSm, color: colors.foreground },
  totals: { paddingTop: spacing.md },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalLabel: { ...type.body, color: colors.mutedForeground },
  totalValue: { ...type.bodyMedium, ...type.tabular, color: colors.foreground },
  grand: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: "center",
  },
  grandLabel: { ...type.subheading, color: colors.foreground },
  grandValue: { ...type.amount, color: colors.foreground },
  paySummary: { flexDirection: "row", marginTop: spacing.md, marginBottom: spacing.xs },
  payCell: { flex: 1 },
  payLabel: { ...type.caption, color: colors.mutedForeground, marginBottom: 2 },
  payValue: { ...type.amount },
  paidNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: spacing.md,
  },
  paidNoteText: { ...type.label, color: colors.status.paid.fg },
  hint: { ...type.caption, color: colors.mutedForeground, marginTop: 6 },
  notes: { ...type.body, color: colors.foreground, marginTop: spacing.md },
  actions: { gap: spacing.sm, marginTop: spacing.xs },
  actionRow: { flexDirection: "row", gap: spacing.sm },
});

export default function InvoiceDetailScreen({ navigation, route }) {
  const { invoiceId } = route.params;
  const { invoices, getClientById, settings, setInvoiceStatus, deleteInvoice, deletePayment } = useApp();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const invoice = invoices.find((i) => i.id === invoiceId);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { can } = useSubscription();
  const pdfOptions = { branding: !can("noBranding") };

  const client = invoice ? getClientById(invoice.clientId) : null;
  const totals = useMemo(() => (invoice ? computeInvoiceTotals(invoice) : null), [invoice]);
  const balance = useMemo(() => (invoice ? computeInvoiceBalance(invoice) : null), [invoice]);

  if (!invoice) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={[styles.itemDesc, { padding: 16 }]}>This invoice was deleted.</Text>
      </SafeAreaView>
    );
  }

  const status = effectiveStatus(invoice);
  const payments = invoice.payments || [];

  async function withPdf(action) {
    try {
      setBusy(true);
      const uri = await generateInvoicePdf(invoice, client, settings, pdfOptions);
      await action(uri);
    } catch (err) {
      Alert.alert("Something went wrong", "Could not generate the PDF.");
    } finally {
      setBusy(false);
    }
  }

  async function handlePreview() {
    try {
      setBusy(true);
      await Print.printAsync({ html: buildInvoiceHtml(invoice, client, settings, pdfOptions) });
    } catch (err) {
      // Closing the print dialog also lands here on some platforms.
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    await withPdf(async (uri) => {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert("Sharing unavailable", "This device can't share files.");
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Invoice ${invoice.invoiceNumber}`,
        UTI: "com.adobe.pdf",
      });
      if (status === "draft") setInvoiceStatus(invoice.id, "sent");
    });
  }

  function handleDelete() {
    Alert.alert("Delete invoice", `Delete ${invoice.invoiceNumber}? This can't be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteInvoice(invoice.id);
          navigation.goBack();
        },
      },
    ]);
  }

  function handleDeletePayment(payment) {
    Alert.alert(
      "Delete payment",
      `Remove the ${formatCurrency(payment.amount, invoice.currency)} payment from ${formatDate(payment.date)}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deletePayment(invoice.id, payment.id) },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Avatar name={client ? client.name : "?"} size={48} />
          <View style={styles.headInfo}>
            <Text style={styles.number}>{invoice.invoiceNumber}</Text>
            <Text style={styles.client} numberOfLines={1}>
              {client ? client.name : "No client"}
            </Text>
          </View>
          <Pressable onPress={() => setStatusModalOpen(true)} style={styles.statusRow} accessibilityLabel="Change status">
            <StatusBadge status={status} />
            <Icon name="chevron-down" size={14} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <Card padded={false}>
          <View style={styles.meta}>
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>Issued</Text>
              <Text style={styles.metaValue}>{formatDate(invoice.issueDate)}</Text>
            </View>
            <Separator vertical />
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>Due</Text>
              <Text style={styles.metaValue}>{formatDate(invoice.dueDate)}</Text>
            </View>
            <Separator vertical />
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>Currency</Text>
              <Text style={styles.metaValue}>{invoice.currency}</Text>
            </View>
          </View>
        </Card>

        <Card>
          <CardHeader icon="receipt-text" title="Line items" />
          <View style={{ marginTop: 6 }}>
            {invoice.items.map((item, idx) => (
              <View
                key={item.id || idx}
                style={[styles.itemRow, idx === invoice.items.length - 1 && { borderBottomWidth: 0 }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                  <Text style={styles.itemMeta}>
                    {item.type === "flat"
                      ? "Flat fee"
                      : `${item.quantity} hrs × ${formatCurrency(item.rate, invoice.currency)}`}
                  </Text>
                </View>
                <Text style={styles.itemAmount}>{formatCurrency(lineItemAmount(item), invoice.currency)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatCurrency(totals.subtotal, invoice.currency)}</Text>
            </View>
            {totals.discount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={styles.totalValue}>−{formatCurrency(totals.discount, invoice.currency)}</Text>
              </View>
            ) : null}
            {invoice.taxRate > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%)</Text>
                <Text style={styles.totalValue}>{formatCurrency(totals.tax, invoice.currency)}</Text>
              </View>
            ) : null}
            <View style={[styles.totalRow, styles.grand]}>
              <Text style={styles.grandLabel}>Total</Text>
              <Text style={styles.grandValue}>{formatCurrency(totals.total, invoice.currency)}</Text>
            </View>
          </View>
        </Card>

        <Card>
          <CardHeader
            icon="wallet"
            title="Payments"
            description={payments.length ? "Long-press a payment to delete it" : "No payments recorded yet"}
          />
          <View style={styles.paySummary}>
            <View style={styles.payCell}>
              <Text style={styles.payLabel}>Received</Text>
              <Text style={[styles.payValue, { color: colors.status.paid.fg }]}>
                {formatCurrency(balance.amountPaid, invoice.currency)}
              </Text>
            </View>
            <View style={[styles.payCell, { alignItems: "flex-end" }]}>
              <Text style={styles.payLabel}>Balance due</Text>
              <Text
                style={[
                  styles.payValue,
                  { color: balance.balanceDue > 0 ? colors.foreground : colors.status.paid.fg },
                ]}
              >
                {formatCurrency(balance.balanceDue, invoice.currency)}
              </Text>
            </View>
          </View>

          {payments.map((payment, idx) => (
            <PaymentRow
              key={payment.id || idx}
              payment={payment}
              currency={invoice.currency}
              onLongPress={() => handleDeletePayment(payment)}
            />
          ))}

          {balance.balanceDue > 0 ? (
            <View style={{ marginTop: spacing0(payments.length) }}>
              <Button
                label="Record payment"
                icon="plus"
                variant="outline"
                fullWidth
                onPress={() => navigation.navigate("RecordPayment", { invoiceId: invoice.id })}
              />
            </View>
          ) : payments.length > 0 ? (
            <View style={styles.paidNote}>
              <Icon name="circle-check" size={16} color={colors.status.paid.fg} />
              <Text style={styles.paidNoteText}>Paid in full</Text>
            </View>
          ) : null}
        </Card>

        {invoice.notes ? (
          <Card>
            <CardHeader icon="file-text" title="Notes" />
            <Text style={styles.notes}>{invoice.notes}</Text>
          </Card>
        ) : null}

        <View style={styles.actions}>
          <Button label="Share invoice" icon="share-2" fullWidth loading={busy} onPress={handleShare} />
          <View style={styles.actionRow}>
            <View style={{ flex: 1 }}>
              <Button label="Preview" icon="printer" variant="outline" fullWidth disabled={busy} onPress={handlePreview} />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Edit"
                icon="pencil"
                variant="outline"
                fullWidth
                onPress={() => navigation.navigate("InvoiceForm", { invoiceId: invoice.id })}
              />
            </View>
          </View>
          <Button label="Delete invoice" icon="trash-2" variant="destructive-outline" fullWidth onPress={handleDelete} />
        </View>
      </ScrollView>

      <SelectModal
        visible={statusModalOpen}
        title="Invoice status"
        options={STATUS_OPTIONS}
        selectedValue={invoice.status}
        onSelect={(value) => {
          setInvoiceStatus(invoice.id, value);
          setStatusModalOpen(false);
        }}
        onClose={() => setStatusModalOpen(false)}
      />
    </SafeAreaView>
  );
}

// Adds breathing room above the button only when a payment list sits above it.
function spacing0(count) {
  return count > 0 ? 12 : 16;
}
