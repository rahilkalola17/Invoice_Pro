import AsyncStorage from "@react-native-async-storage/async-storage";

// Keys for the four local "tables". Everything is stored as plain
// JSON arrays/objects — plenty for a single freelancer's own data,
// and it keeps the app dependency-light (no SQLite build step).
export const KEYS = {
  CLIENTS: "@fip/clients",
  INVOICES: "@fip/invoices",
  RECEIPTS: "@fip/receipts",
  SETTINGS: "@fip/settings",
  SEEDED: "@fip/seeded",
};

export async function loadJSON(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Failed to load ${key}`, err);
    return fallback;
  }
}

export async function saveJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to save ${key}`, err);
  }
}
