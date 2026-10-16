import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { useThemedStyles } from "../../contexts/ThemeContext";

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const HOUR_CHIPS = Array.from({ length: 16 }, (_, i) => {
  const hour = 6 + i; // 06:00 .. 21:00
  return `${String(hour).padStart(2, "0")}:00`;
});

const DEFAULT_WINDOW = { startTime: "09:00", endTime: "17:00" };
const MAX_WINDOWS_PER_DAY = 3;

const emptyWeek = () => DAYS.reduce((acc, d) => ({ ...acc, [d.value]: [] }), {});

// A sensible next window after the day's last one: an hour's gap, two hours long.
function nextWindow(windows) {
  const last = windows[windows.length - 1];
  const lastEnd = last ? Number(last.endTime.slice(0, 2)) : 8;
  const start = Math.min(lastEnd + 1, 20);
  const end = Math.min(start + 2, 21);
  const fmt = (h) => `${String(h).padStart(2, "0")}:00`;
  return { startTime: fmt(start), endTime: fmt(end) };
}

// First problem with a day's windows, or null.
function windowProblem(windows) {
  const sorted = [...windows].sort((a, b) => a.startTime.localeCompare(b.startTime));
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].endTime <= sorted[i].startTime) return "End time must be after start time.";
    if (i > 0 && sorted[i].startTime < sorted[i - 1].endTime) return "Time windows on the same day can't overlap.";
  }
  return null;
}

export default function AvailabilityScreen() {
  const router = useRouter();
  const { theme } = useAuth();
  const { styles, colors: BASE } = useThemedStyles(createStyles);

  // day value -> list of { startTime, endTime }; an empty list means closed.
  const [days, setDays] = useState(emptyWeek);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchHours = async () => {
    try {
      const res = await apiFetch("/appointments/availability/hours");
      const next = emptyWeek();
      for (const row of res.data || []) {
        next[row.dayOfWeek].push({ startTime: row.startTime, endTime: row.endTime });
      }
      setDays(next);
    } catch (err) {
      console.error("Fetch hours error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchHours(); }, []));

  const toggleDay = (dayValue, on) => {
    setDays((prev) => ({ ...prev, [dayValue]: on ? [DEFAULT_WINDOW] : [] }));
  };

  const updateWindow = (dayValue, index, field, value) => {
    setDays((prev) => ({
      ...prev,
      [dayValue]: prev[dayValue].map((w, i) => (i === index ? { ...w, [field]: value } : w)),
    }));
  };

  const addWindow = (dayValue) => {
    setDays((prev) => {
      const windows = prev[dayValue];
      if (windows.length >= MAX_WINDOWS_PER_DAY) return prev;
      return { ...prev, [dayValue]: [...windows, nextWindow(windows)] };
    });
  };

  const removeWindow = (dayValue, index) => {
    setDays((prev) => ({ ...prev, [dayValue]: prev[dayValue].filter((_, i) => i !== index) }));
  };

  const save = async () => {
    for (const d of DAYS) {
      const problem = windowProblem(days[d.value]);
      if (problem) {
        Toast.show({ type: "error", text1: `Check ${d.label}`, text2: problem });
        return;
      }
    }

    const hours = DAYS.flatMap((d) =>
      days[d.value].map((w) => ({ dayOfWeek: d.value, startTime: w.startTime, endTime: w.endTime })),
    );

    setSaving(true);
    try {
      await apiFetch("/appointments/availability/hours", {
        method: "PUT",
        // Hours are wall-clock times in this device's zone; the server checks
        // bookings against them in that zone rather than its own.
        body: JSON.stringify({ hours, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
      });
      Toast.show({ type: "success", text1: "Weekly hours saved" });
      router.back();
    } catch (err) {
      Toast.show({ type: "error", text1: "Could not save hours", text2: err?.data?.error || err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme?.primary ?? BASE.success} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={BASE.textSecondary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Weekly Hours</Text>
          <Text style={styles.subtitle}>Set when students can book or be offered a time</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.timeOffLink} onPress={() => router.push("/(counselor)/time-off")}>
          <MaterialCommunityIcons name="calendar-remove-outline" size={18} color={BASE.warning} />
          <View style={{ flex: 1 }}>
            <Text style={styles.timeOffTitle}>Time off</Text>
            <Text style={styles.timeOffSub}>Block holidays, sick days or conferences</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color={BASE.textMuted} />
        </TouchableOpacity>

        {DAYS.map((day) => {
          const windows = days[day.value];
          const isOn = windows.length > 0;
          return (
            <View key={day.value} style={styles.dayCard}>
              <View style={styles.dayRow}>
                <Text style={styles.dayLabel}>{day.label}</Text>
                <Switch
                  value={isOn}
                  onValueChange={(val) => toggleDay(day.value, val)}
                  trackColor={{ false: BASE.border, true: (theme?.primary ?? BASE.success) + "88" }}
                  thumbColor="#FFF"
                />
              </View>

              {windows.map((w, index) => (
                <View key={index} style={index > 0 && styles.windowDivider}>
                  {windows.length > 1 && (
                    <View style={styles.windowHeader}>
                      <Text style={styles.windowLabel}>
                        Window {index + 1} · {w.startTime}–{w.endTime}
                      </Text>
                      <TouchableOpacity onPress={() => removeWindow(day.value, index)} hitSlop={8}>
                        <Text style={[styles.removeText, { color: BASE.error }]}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  <TimeRow
                    label="Start"
                    value={w.startTime}
                    onSelect={(v) => updateWindow(day.value, index, "startTime", v)}
                    theme={theme}
                  />
                  <TimeRow
                    label="End"
                    value={w.endTime}
                    onSelect={(v) => updateWindow(day.value, index, "endTime", v)}
                    theme={theme}
                  />
                </View>
              ))}

              {isOn && windows.length < MAX_WINDOWS_PER_DAY && (
                <TouchableOpacity style={styles.addWindowBtn} onPress={() => addWindow(day.value)}>
                  <MaterialCommunityIcons name="plus" size={16} color={theme?.primary ?? BASE.success} />
                  <Text style={[styles.addWindowText, { color: theme?.primary ?? BASE.success }]}>
                    Add another time window
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme?.primary ?? BASE.success }, saving && styles.saveBtnDisabled]}
          onPress={save}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveBtnText}>Save Weekly Hours</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function TimeRow({ label, value, onSelect, theme }) {
  const { styles, colors: BASE } = useThemedStyles(createStyles);
  return (
    <View style={styles.timeRow}>
      <Text style={styles.timeLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {HOUR_CHIPS.map((time) => {
          const active = value === time;
          return (
            <TouchableOpacity
              key={time}
              style={[
                styles.chip,
                active && { backgroundColor: (theme?.primary ?? BASE.success) + "22", borderColor: theme?.primary ?? BASE.success },
              ]}
              onPress={() => onSelect(time)}
            >
              <Text style={[styles.chipText, active && { color: theme?.primary ?? BASE.success }]}>{time}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (BASE) => StyleSheet.create({
  container: { flex: 1, backgroundColor: BASE.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: BASE.bg },

  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8 },
  backBtn: { padding: 8 },
  title: { color: BASE.textPrimary, fontSize: 22, fontWeight: "800" },
  subtitle: { color: BASE.textSecondary, fontSize: 12, marginTop: 3, maxWidth: 260 },

  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },

  dayCard: {
    backgroundColor: BASE.surface, borderRadius: 18, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: BASE.border,
  },
  dayRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dayLabel: { color: BASE.textPrimary, fontSize: 15, fontWeight: "700" },

  timeOffLink: {
    flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: BASE.surface,
    borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: BASE.border,
  },
  timeOffTitle: { color: BASE.textPrimary, fontSize: 15, fontWeight: "700" },
  timeOffSub: { color: BASE.textSecondary, fontSize: 12, marginTop: 2 },

  windowDivider: { marginTop: 16, paddingTop: 2, borderTopWidth: 1, borderTopColor: BASE.border },
  windowHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14 },
  windowLabel: { color: BASE.textPrimary, fontSize: 13, fontWeight: "700" },
  removeText: { fontSize: 12, fontWeight: "700" },
  addWindowBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14, alignSelf: "flex-start" },
  addWindowText: { fontSize: 13, fontWeight: "700" },

  timeRow: { marginTop: 14 },
  timeLabel: { color: BASE.textMuted, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: BASE.border, backgroundColor: BASE.surfaceAlt,
  },
  chipText: { color: BASE.textSecondary, fontSize: 12, fontWeight: "700" },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: BASE.border },
  saveBtn: { borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#FFF", fontSize: 14, fontWeight: "800" },
});
