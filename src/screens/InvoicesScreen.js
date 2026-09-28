import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { useStyles } from "../theme";
import ScreenHeader from "../components/ScreenHeader";
import Button from "../components/Button";
import { Card } from "../components/Card";
import InvoiceRow from "../components/InvoiceRow";
import EmptyState from "../components/EmptyState";
import { effectiveStatus } from "../utils/calculations";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "sent", label: "Sent" },
  { key: "overdue", label: "Overdue" },
  { key: "paid", label: "Paid" },
];

const makeStyles = ({ colors, radius, spacing, type }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  chips: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.lg },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.input,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...type.label, color: colors.foreground },
  chipTextActive: { color: colors.primaryForeground },
  chipCount: { ...type.caption, color: colors.mutedForeground },
  chipCountActive: { color: colors.primaryForeground, opacity: 0.7 },
  body: { paddingHorizontal: spacing.lg, paddingBottom: 32 },
});

export default function InvoicesScreen({ navigation, route }) {
  const { invoices, clients } = useApp();
  const styles = useStyles(makeStyles);
  const [filter, setFilter] = useState(route.params?.statusFilter || "all");

  useEffect(() => {
    if (route.params?.statusFilter) setFilter(route.params.statusFilter);
  }, [route.params?.statusFilter]);

  const clientMap = useMemo(() => {
    const map = {};
    clients.forEach((c) => (map[c.id] = c));
    return map;
  }, [clients]);

  const sorted = useMemo(
    () => [...invoices].sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate)),
    [invoices]
  );

  const counts = useMemo(() => {
    const c = { all: invoices.length, draft: 0, sent: 0, overdue: 0, paid: 0 };
    invoices.forEach((inv) => {
      c[effectiveStatus(inv)] += 1;
    });
    return c;
  }, [invoices]);

  const filtered = filter === "all" ? sorted : sorted.filter((inv) => effectiveStatus(inv) === filter);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScreenHeader
        eyebrow={`${invoices.length} total`}
        title="Invoices"
        right={<Button label="New" icon="plus" onPress={() => navigation.navigate("InvoiceForm")} style={{ height: 40 }} />}
      />

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
                <Text style={[styles.chipCount, active && styles.chipCountActive]}>{counts[f.key]}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Card padded={false}>
          {filtered.length === 0 ? (
            <EmptyState
              icon="file-text"
              title={filter === "all" ? "No invoices yet" : `No ${filter} invoices`}
              subtitle="Create an invoice and it will show up here."
              actionLabel="New invoice"
              onAction={() => navigation.navigate("InvoiceForm")}
            />
          ) : (
            filtered.map((inv, i) => (
              <InvoiceRow
                key={inv.id}
                invoice={inv}
                client={clientMap[inv.clientId]}
                last={i === filtered.length - 1}
                onPress={() => navigation.navigate("InvoiceDetail", { invoiceId: inv.id })}
              />
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
