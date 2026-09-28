import React, { useMemo } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { useStyles, useTheme } from "../theme";
import ScreenHeader from "../components/ScreenHeader";
import Button from "../components/Button";
import { Card, CardHeader } from "../components/Card";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import Alert from "../components/Dialog";
import { formatDate } from "../utils/calculations";
import { formatCurrency } from "../utils/currency";

const makeStyles = ({ colors, radius, spacing, type }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  body: { paddingHorizontal: spacing.lg, paddingBottom: 32, gap: spacing.md },
  totalAmount: { ...type.display, color: colors.foreground, marginTop: spacing.md },
  totalMinor: { ...type.amount, color: colors.mutedForeground, marginTop: 2 },
  totalHint: { ...type.caption, color: colors.mutedForeground, marginTop: 6 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  last: { borderBottomWidth: 0 },
  pressed: { backgroundColor: colors.accent },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbImg: { width: 44, height: 44 },
  info: { flex: 1 },
  vendor: { ...type.bodyMedium, color: colors.foreground },
  meta: { ...type.caption, color: colors.mutedForeground, marginTop: 2 },
  amount: { ...type.amountSm, color: colors.foreground },
  footer: { ...type.caption, color: colors.mutedForeground, textAlign: "center" },
});

export default function ReceiptsScreen({ navigation }) {
  const { receipts, deleteReceipt } = useApp();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  const sorted = useMemo(
    () => [...receipts].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [receipts]
  );

  const totals = useMemo(() => {
    const t = {};
    receipts.forEach((r) => {
      const code = r.currency || "USD";
      t[code] = (t[code] || 0) + (Number(r.amount) || 0);
    });
    return Object.keys(t).map((code) => formatCurrency(t[code], code));
  }, [receipts]);

  function confirmDelete(receipt) {
    Alert.alert("Delete receipt", `Remove this expense from ${receipt.vendor || "your log"}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteReceipt(receipt.id) },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScreenHeader
        eyebrow={`${receipts.length} logged`}
        title="Receipts"
        right={<Button label="Capture" icon="camera" onPress={() => navigation.navigate("ReceiptCapture")} style={{ height: 40 }} />}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {receipts.length > 0 ? (
          <Card>
            <CardHeader icon="wallet" title="Total expenses" description="Everything you've logged" />
            {totals.map((line, i) => (
              <Text key={line + i} style={i === 0 ? styles.totalAmount : styles.totalMinor}>
                {line}
              </Text>
            ))}
          </Card>
        ) : null}

        <Card padded={false}>
          {sorted.length === 0 ? (
            <EmptyState
              icon="receipt"
              title="No receipts logged"
              subtitle="Snap a photo of a paper receipt to log a business expense."
              actionLabel="Capture receipt"
              onAction={() => navigation.navigate("ReceiptCapture")}
            />
          ) : (
            sorted.map((item, i) => (
              <Pressable
                key={item.id}
                onLongPress={() => confirmDelete(item)}
                style={({ pressed }) => [styles.row, i === sorted.length - 1 && styles.last, pressed && styles.pressed]}
              >
                <View style={styles.thumb}>
                  {item.imageUri ? (
                    <Image source={{ uri: item.imageUri }} style={styles.thumbImg} />
                  ) : (
                    <Icon name="receipt" size={18} color={colors.mutedForeground} />
                  )}
                </View>
                <View style={styles.info}>
                  <Text style={styles.vendor} numberOfLines={1}>
                    {item.vendor || "Untitled expense"}
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {item.category} · {formatDate(item.date)}
                  </Text>
                </View>
                <Text style={styles.amount}>{formatCurrency(item.amount, item.currency)}</Text>
              </Pressable>
            ))
          )}
        </Card>
        {sorted.length > 0 ? <Text style={styles.footer}>Long-press a receipt to delete it</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
