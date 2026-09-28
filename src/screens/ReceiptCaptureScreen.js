import React, { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useApp } from "../context/AppContext";
import { useStyles, useTheme } from "../theme";
import { Card } from "../components/Card";
import { Input, SelectField } from "../components/Input";
import DateField from "../components/DateField";
import Button from "../components/Button";
import Icon from "../components/Icon";
import SelectModal from "../components/SelectModal";
import Alert from "../components/Dialog";
import LimitReached from "../components/LimitReached";
import { useSubscription } from "../subscription/SubscriptionContext";
import { openPaywall } from "../subscription/paywall";

const CATEGORIES = [
  "Meals & entertainment",
  "Travel",
  "Software & subscriptions",
  "Office supplies",
  "Equipment",
  "Marketing",
  "Professional fees",
  "Other",
];

const makeStyles = ({ colors, radius, spacing, type }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: 40, gap: spacing.md },
  captureRow: { flexDirection: "row", gap: spacing.md },
  captureBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 26,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.input,
    backgroundColor: colors.card,
  },
  captureIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  captureLabel: { ...type.label, color: colors.foreground },
  preview: { width: "100%", height: 220, borderRadius: radius.lg, backgroundColor: colors.muted },
  previewWrap: { gap: spacing.sm },
});

export default function ReceiptCaptureScreen({ navigation }) {
  const { addReceipt, settings } = useApp();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [imageUri, setImageUri] = useState(null);
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString());
  const [note, setNote] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const { limit } = useSubscription();
  // See ClientFormScreen: decided on open to avoid a flash after saving.
  const [lockedOnOpen] = useState(() => !limit("receipts").allowed);

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Camera access needed", "Allow camera access to photograph a paper receipt.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true });
    if (!result.canceled && result.assets?.[0]?.uri) setImageUri(result.assets[0].uri);
  }

  async function pickFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Photo access needed", "Allow photo library access to attach an existing receipt image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.6,
      allowsEditing: true,
      mediaTypes: ["images"],
    });
    if (!result.canceled && result.assets?.[0]?.uri) setImageUri(result.assets[0].uri);
  }

  function handleSave() {
    if (!limit("receipts").allowed) {
      openPaywall({ kind: "receipts" });
      return;
    }
    if (!amount || Number(amount) <= 0) {
      Alert.alert("Add an amount", "Enter what the receipt was for.");
      return;
    }
    addReceipt({
      vendor: vendor.trim() || "Untitled expense",
      amount: Number(amount),
      currency: settings.defaultCurrency,
      category,
      date,
      note: note.trim(),
      imageUri,
    });
    navigation.goBack();
  }

  if (lockedOnOpen && !limit("receipts").allowed) {
    return (
      <SafeAreaView style={styles.screen} edges={["bottom"]}>
        <LimitReached kind="receipts" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {imageUri ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: imageUri }} style={styles.preview} />
              <Button label="Remove photo" icon="trash-2" variant="destructive-outline" size="sm" fullWidth onPress={() => setImageUri(null)} />
            </View>
          ) : (
            <View style={styles.captureRow}>
              <Pressable style={styles.captureBtn} onPress={takePhoto}>
                <View style={styles.captureIcon}>
                  <Icon name="camera" size={20} color={colors.foreground} />
                </View>
                <Text style={styles.captureLabel}>Take photo</Text>
              </Pressable>
              <Pressable style={styles.captureBtn} onPress={pickFromLibrary}>
                <View style={styles.captureIcon}>
                  <Icon name="image-plus" size={20} color={colors.foreground} />
                </View>
                <Text style={styles.captureLabel}>Choose photo</Text>
              </Pressable>
            </View>
          )}

          <Card>
            <Input label="Vendor / merchant" value={vendor} onChangeText={setVendor} placeholder="e.g. Blue Bottle Coffee" />
            <Input
              label="Amount"
              value={amount}
              onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ""))}
              placeholder="0.00"
              keyboardType="decimal-pad"
              prefix={settings.defaultCurrency}
              required
            />
            <SelectField label="Category" value={category} onPress={() => setCategoryOpen(true)} />
            <DateField label="Date" value={date} onChange={setDate} />
            <Input label="Note (optional)" value={note} onChangeText={setNote} placeholder="What was this for?" multiline />
            <Button label="Save expense" fullWidth onPress={handleSave} />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      <SelectModal
        visible={categoryOpen}
        title="Choose a category"
        options={CATEGORIES.map((c) => ({ label: c, value: c }))}
        selectedValue={category}
        onSelect={(value) => {
          setCategory(value);
          setCategoryOpen(false);
        }}
        onClose={() => setCategoryOpen(false)}
      />
    </SafeAreaView>
  );
}
