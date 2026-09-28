import React, { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { useStyles, useTheme } from "../theme";
import ScreenHeader from "../components/ScreenHeader";
import Button from "../components/Button";
import { Card, CardHeader, Separator } from "../components/Card";
import KpiCard from "../components/KpiCard";
import InvoiceRow from "../components/InvoiceRow";
import EmptyState from "../components/EmptyState";
import SegmentedControl from "../components/SegmentedControl";
import Icon from "../components/Icon";
import {
  effectiveStatus,
  groupTotalsByCurrency,
  groupBalanceDueByCurrency,
  computeProfitAndLoss,
} from "../utils/calculations";
import { formatCurrency } from "../utils/currency";

const KPIS = [
  { key: "overdue", label: "Overdue", icon: "circle-alert" },
  { key: "sent", label: "Awaiting payment", icon: "send" },
  { key: "paid", label: "Paid", icon: "circle-check" },
  { key: "draft", label: "Drafts", icon: "file-text" },
];

const PERIOD_OPTIONS = [
  { label: "This month", value: "month" },
  { label: "All time", value: "all" },
];

function linesFromTotals(totals) {
  const codes = Object.keys(totals);
  if (codes.length === 0) return [];
  return codes
    .sort((a, b) => totals[b] - totals[a])
    .map((code) => formatCurrency(totals[code], code));
}

// Sent/Overdue show what is still owed; Draft/Paid show the invoice value.
function bucketLines(key, invoices) {
  const totals =
    key === "sent" || key === "overdue"
      ? groupBalanceDueByCurrency(invoices)
      : groupTotalsByCurrency(invoices);
  return linesFromTotals(totals);
}

const makeStyles = ({ colors, radius, spacing, type, shadow }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 32 },
  body: { paddingHorizontal: spacing.lg, gap: spacing.md },
  hero: {
    backgroundColor: colors.heroBg,
    borderColor: colors.heroBorder,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg + 4,
    overflow: "hidden",
    ...shadow.raised,
  },
  ringA: {
    position: "absolute",
    right: -40,
    top: -50,
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 26,
    borderColor: "rgba(255,255,255,0.05)",
  },
  ringB: {
    position: "absolute",
    right: 34,
    top: 42,
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 14,
    borderColor: "rgba(255,255,255,0.04)",
  },
  heroLabel: { ...type.label, color: colors.heroMuted },
  heroAmount: { ...type.display, color: colors.heroForeground, marginTop: 6 },
  heroMinor: { ...type.amount, color: colors.heroMuted, marginTop: 2 },
  heroSub: { ...type.small, color: colors.heroMuted, marginTop: 6 },
  bar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: spacing.lg,
    backgroundColor: "rgba(255,255,255,0.08)",
    gap: 2,
  },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { ...type.caption, color: colors.heroMuted },
  grid: { gap: spacing.md },
  gridRow: { flexDirection: "row", gap: spacing.md },
  pnlToggle: { marginTop: spacing.md, marginBottom: spacing.xs },
  pnlEmpty: { ...type.small, color: colors.mutedForeground, marginTop: spacing.md },
  pnlBlock: { marginTop: spacing.md },
  pnlCode: { ...type.tiny, color: colors.mutedForeground, marginBottom: 2 },
  pnlRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  pnlLabelWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  pnlLabel: { ...type.body, color: colors.mutedForeground },
  pnlValue: { ...type.bodyMedium, ...type.tabular, color: colors.foreground },
  pnlNetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pnlNetLabel: { ...type.subheading, color: colors.foreground },
  pnlNetValue: { ...type.amount },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.input,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
});

export default function DashboardScreen({ navigation }) {
  const { invoices, clients, receipts, settings, ready } = useApp();
  const { colors, isDark, mode, setMode } = useTheme();
  const styles = useStyles(makeStyles);
  const [period, setPeriod] = useState("month");

  const grouped = useMemo(() => {
    const byStatus = { draft: [], sent: [], overdue: [], paid: [] };
    invoices.forEach((inv) => {
      const status = effectiveStatus(inv);
      if (byStatus[status]) byStatus[status].push(inv);
    });
    return byStatus;
  }, [invoices]);

  const open = useMemo(() => [...grouped.sent, ...grouped.overdue], [grouped]);
  const outstanding = useMemo(() => linesFromTotals(groupBalanceDueByCurrency(open)), [open]);
  const pnl = useMemo(
    () => computeProfitAndLoss(invoices, receipts, period),
    [invoices, receipts, period]
  );
  const recent = useMemo(
    () =>
      [...invoices]
        .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
        .slice(0, 5),
    [invoices]
  );
  const clientMap = useMemo(() => {
    const map = {};
    clients.forEach((c) => (map[c.id] = c));
    return map;
  }, [clients]);

  if (!ready) return null;

  const total = invoices.length;
  const segments = ["paid", "sent", "overdue", "draft"].filter((k) => grouped[k].length > 0);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          eyebrow={settings.businessName || "Welcome back"}
          title="Dashboard"
          right={
            <>
              <Button
                variant="outline"
                size="icon"
                icon={isDark ? "sun" : "moon"}
                onPress={() => setMode(isDark ? "light" : "dark")}
              />
              <Button
                label="New"
                icon="plus"
                onPress={() => navigation.navigate("InvoiceForm")}
                style={{ height: 40 }}
              />
            </>
          }
        />

        <View style={styles.body}>
          <View style={styles.hero}>
            <View style={styles.ringA} />
            <View style={styles.ringB} />
            <Text style={styles.heroLabel}>Outstanding balance</Text>
            {outstanding.length === 0 ? (
              <Text style={styles.heroAmount}>—</Text>
            ) : (
              outstanding.map((line, i) => (
                <Text key={line + i} style={i === 0 ? styles.heroAmount : styles.heroMinor}>
                  {line}
                </Text>
              ))
            )}
            <Text style={styles.heroSub}>
              Across {open.length} open {open.length === 1 ? "invoice" : "invoices"}
            </Text>

            {total > 0 ? (
              <>
                <View style={styles.bar}>
                  {segments.map((key) => (
                    <View
                      key={key}
                      style={{
                        flex: grouped[key].length,
                        backgroundColor: colors.status[key].solid,
                      }}
                    />
                  ))}
                </View>
                <View style={styles.legend}>
                  {segments.map((key) => (
                    <View key={key} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: colors.status[key].solid }]} />
                      <Text style={styles.legendText}>
                        {grouped[key].length} {key}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}
          </View>

          <View style={styles.grid}>
            {[KPIS.slice(0, 2), KPIS.slice(2, 4)].map((pair, rowIndex) => (
              <View key={rowIndex} style={styles.gridRow}>
                {pair.map((kpi) => (
                  <KpiCard
                    key={kpi.key}
                    label={kpi.label}
                    icon={kpi.icon}
                    tone={kpi.key}
                    lines={bucketLines(kpi.key, grouped[kpi.key])}
                    count={grouped[kpi.key].length}
                    onPress={() =>
                      navigation.navigate("InvoicesTab", {
                        screen: "Invoices",
                        params: { statusFilter: kpi.key },
                      })
                    }
                  />
                ))}
              </View>
            ))}
          </View>

          <Card>
            <CardHeader
              icon="trending-up"
              title="Profit & loss"
              description="Payments received minus expenses"
            />
            <View style={styles.pnlToggle}>
              <SegmentedControl options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
            </View>
            {pnl.length === 0 ? (
              <Text style={styles.pnlEmpty}>
                Record a payment or log an expense to see your profit and loss here.
              </Text>
            ) : (
              pnl.map((row) => (
                <View key={row.code} style={styles.pnlBlock}>
                  {pnl.length > 1 ? <Text style={styles.pnlCode}>{row.code}</Text> : null}
                  <View style={styles.pnlRow}>
                    <View style={styles.pnlLabelWrap}>
                      <Icon name="arrow-down-right" size={15} color={colors.status.paid.fg} />
                      <Text style={styles.pnlLabel}>Income</Text>
                    </View>
                    <Text style={styles.pnlValue}>{formatCurrency(row.income, row.code)}</Text>
                  </View>
                  <View style={styles.pnlRow}>
                    <View style={styles.pnlLabelWrap}>
                      <Icon name="arrow-up-right" size={15} color={colors.status.overdue.fg} />
                      <Text style={styles.pnlLabel}>Expenses</Text>
                    </View>
                    <Text style={styles.pnlValue}>−{formatCurrency(row.expenses, row.code)}</Text>
                  </View>
                  <View style={styles.pnlNetRow}>
                    <Text style={styles.pnlNetLabel}>Net profit</Text>
                    <Text
                      style={[
                        styles.pnlNetValue,
                        { color: row.profit >= 0 ? colors.status.paid.fg : colors.destructive },
                      ]}
                    >
                      {formatCurrency(row.profit, row.code)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </Card>

          <Card padded={false}>
            <View style={{ padding: 16, paddingBottom: 12 }}>
              <CardHeader
                title="Recent invoices"
                description="Your latest billing activity"
                right={
                  <Button
                    label="View all"
                    variant="ghost"
                    size="sm"
                    iconRight="chevron-right"
                    onPress={() => navigation.navigate("InvoicesTab", { screen: "Invoices" })}
                  />
                }
              />
            </View>
            <Separator />
            {recent.length === 0 ? (
              <EmptyState
                icon="file-plus"
                title="No invoices yet"
                subtitle="Create your first invoice to see it tracked here."
                actionLabel="New invoice"
                onAction={() => navigation.navigate("InvoiceForm")}
              />
            ) : (
              recent.map((inv, i) => (
                <InvoiceRow
                  key={inv.id}
                  invoice={inv}
                  client={clientMap[inv.clientId]}
                  last={i === recent.length - 1}
                  onPress={() => navigation.navigate("InvoiceDetail", { invoiceId: inv.id })}
                />
              ))
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
