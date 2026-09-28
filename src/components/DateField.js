import React, { useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useStyles } from "../theme";
import { SelectField } from "./Input";
import Sheet from "./Sheet";
import Icon from "./Icon";
import Button from "./Button";
import { formatDate } from "../utils/calculations";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const makeStyles = ({ colors, radius, spacing, type }) => ({
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.input,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: { ...type.subheading, color: colors.foreground },
  weekRow: { flexDirection: "row", marginBottom: 4 },
  weekday: { ...type.caption, flex: 1, textAlign: "center", color: colors.mutedForeground },
  row: { flexDirection: "row" },
  cell: { flex: 1, height: 42, alignItems: "center", justifyContent: "center" },
  day: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  dayToday: { backgroundColor: colors.accent },
  daySelected: { backgroundColor: colors.primary },
  dayText: { ...type.bodyMedium, color: colors.foreground },
  dayTextSelected: { color: colors.primaryForeground },
  footer: { marginTop: spacing.md },
});

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

let counter = 0;

// value / onChange use ISO strings so they drop straight into invoice
// and receipt objects.
export default function DateField({ label, value, onChange }) {
  const styles = useStyles(makeStyles);
  const idRef = useRef(`date-${++counter}`);
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(value) : new Date();
  const [view, setView] = useState({ y: selected.getFullYear(), m: selected.getMonth() });
  const today = new Date();

  function openPicker() {
    setView({ y: selected.getFullYear(), m: selected.getMonth() });
    setOpen(true);
  }

  function shiftMonth(delta) {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  }

  function pick(day) {
    // Noon local time keeps the date stable across timezones.
    onChange(new Date(view.y, view.m, day, 12).toISOString());
    setOpen(false);
  }

  const firstWeekday = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <>
      <SelectField
        label={label}
        value={formatDate(value)}
        iconRight="calendar"
        onPress={openPicker}
      />
      <Sheet id={idRef.current} visible={open} title={label} onClose={() => setOpen(false)}>
        <View style={styles.nav}>
          <Pressable style={styles.navBtn} onPress={() => shiftMonth(-1)} accessibilityLabel="Previous month">
            <Icon name="chevron-left" size={16} />
          </Pressable>
          <Text style={styles.monthLabel}>
            {MONTHS[view.m]} {view.y}
          </Text>
          <Pressable style={styles.navBtn} onPress={() => shiftMonth(1)} accessibilityLabel="Next month">
            <Icon name="chevron-right" size={16} />
          </Pressable>
        </View>
        <View style={styles.weekRow}>
          {WEEKDAYS.map((w) => (
            <Text key={w} style={styles.weekday}>{w}</Text>
          ))}
        </View>
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.row}>
            {week.map((day, di) => {
              if (!day) return <View key={di} style={styles.cell} />;
              const date = new Date(view.y, view.m, day);
              const isSelected = sameDay(date, selected);
              const isToday = sameDay(date, today);
              return (
                <View key={di} style={styles.cell}>
                  <Pressable
                    onPress={() => pick(day)}
                    style={[styles.day, isToday && styles.dayToday, isSelected && styles.daySelected]}
                  >
                    <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))}
        <View style={styles.footer}>
          <Button
            label="Today"
            variant="outline"
            fullWidth
            onPress={() => {
              onChange(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12).toISOString());
              setOpen(false);
            }}
          />
        </View>
      </Sheet>
    </>
  );
}
