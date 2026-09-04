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
import { BASE } from "../../utils/orgTheme";

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

export default function AvailabilityScreen() {
  const router = useRouter();
  const { theme } = useAuth();

  const [days, setDays] = useState(() =>
    DAYS.reduce((acc, d) => ({ ...acc, [d.value]: null }), {})
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchHours = async () => {
    try {
      const res = await apiFetch("/appointments/availability/hours");
      const next = DAYS.reduce((acc, d) => ({ ...acc, [d.value]: null }), {});
      for (const row of res.data || []) {
        next[row.dayOfWeek] = { startTime: row.startTime, endTime: row.endTime };
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
    setDays((prev) => ({ ...prev, [dayValue]: on ? DEFAULT_WINDOW : null }));
  };

  const updateWindow = (dayValue, field, value) => {
    setDays((prev) => ({ ...prev, [dayValue]: { ...prev[dayValue], [field]: value } }));
  };

  const save = async () => {
    const hours = DAYS
      .filter((d) => days[d.value])
      .map((d) => ({ dayOfWeek: d.value, ...days[d.value] }));

    const invalid = hours.find((h) => h.endTime <= h.startTime);
    if (invalid) {
      Toast.show({ type: "error", text1: "Check your hours", text2: "End time must be after start time." });
      return;
    }

    setSaving(true);
    try {
      await apiFetch("/appointments/availability/hours", {
        method: "PUT",
        body: JSON.stringify({ hours }),
      });
      Toast.show({ type: "success", text1: "Weekly hours saved" });
      router.back();
    } catch (err) {
      Toast.show({ type: "error", text1: "Could not save hours", text2: err.message });
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
        {DAYS.map((day) => {
          const window = days[day.value];
          const isOn = Boolean(window);
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

              {isOn && (
                <>
                  <TimeRow
                    label="Start"
                    value={window.startTime}
                    onSelect={(v) => updateWindow(day.value, "startTime", v)}
                    theme={theme}
                  />
                  <TimeRow
                    label="End"
                    value={window.endTime}
                    onSelect={(v) => updateWindow(day.value, "endTime", v)}
                    theme={theme}
                  />
                </>
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

const styles = StyleSheet.create({
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
