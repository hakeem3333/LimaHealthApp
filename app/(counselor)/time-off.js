import React, { useState, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { useThemedStyles } from "../../contexts/ThemeContext";
import { confirmAction, showMessage } from "../../utils/confirm";

const WEEKDAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"];

// Dates travel as "yyyy-MM-dd" calendar days in this device's zone.
const toYmd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fromYmd = (ymd) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const formatDay = (ymd) =>
  fromYmd(ymd).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
const formatRange = (start, end) => (start === end ? formatDay(start) : `${formatDay(start)} – ${formatDay(end)}`);
const formatSession = (iso) =>
  new Date(iso).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

// The weeks of a month as rows of 7 cells (null = padding outside the month).
function monthGrid(year, month) {
  const first = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: first }, () => null),
    ...Array.from({ length: count }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
}

export default function TimeOffScreen() {
  const router = useRouter();
  const { theme } = useAuth();
  const { styles, colors: BASE } = useThemedStyles(createStyles);
  const accent = theme?.primary ?? BASE.success;

  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const today = toYmd(new Date());
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd]     = useState(null);
  const [note, setNote]             = useState("");

  const fetchEntries = async () => {
    try {
      const res = await apiFetch("/appointments/availability/time-off");
      setEntries(res.data || []);
    } catch (err) {
      console.error("Fetch time off error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchEntries(); }, []));

  const weeks = useMemo(() => monthGrid(visibleMonth.year, visibleMonth.month), [visibleMonth]);
  const monthLabel = new Date(visibleMonth.year, visibleMonth.month, 1)
    .toLocaleDateString([], { month: "long", year: "numeric" });
  const isCurrentMonth =
    visibleMonth.year === new Date().getFullYear() && visibleMonth.month === new Date().getMonth();

  const shiftMonth = (delta) => {
    setVisibleMonth(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  // First tap picks the start; the second picks the end (or restarts if it's
  // earlier than the start); a third tap starts a new range.
  const pickDay = (ymd) => {
    if (!rangeStart || rangeEnd) {
      setRangeStart(ymd);
      setRangeEnd(null);
    } else if (ymd < rangeStart) {
      setRangeStart(ymd);
    } else {
      setRangeEnd(ymd);
    }
  };

  const selectedEnd = rangeEnd ?? rangeStart;

  const warnAboutSessions = (sessions, title) => {
    if (!sessions?.length) return;
    const lines = sessions
      .slice(0, 6)
      .map((s) => `• ${formatSession(s.startTime)} — ${s.student?.firstName ?? ""} ${s.student?.lastName ?? ""}`.trim());
    if (sessions.length > 6) lines.push(`…and ${sessions.length - 6} more`);
    showMessage(
      title,
      `These sessions are still booked during your time off. Cancel or reschedule them from Sessions:\n\n${lines.join("\n")}`,
    );
  };

  const save = async () => {
    if (!rangeStart) return;
    setSaving(true);
    try {
      const res = await apiFetch("/appointments/availability/time-off", {
        method: "POST",
        body: JSON.stringify({
          startDate: rangeStart,
          endDate: selectedEnd,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          note: note.trim() || undefined,
        }),
      });
      Toast.show({ type: "success", text1: "Time off added", text2: formatRange(rangeStart, selectedEnd) });
      setRangeStart(null);
      setRangeEnd(null);
      setNote("");
      fetchEntries();
      warnAboutSessions(res.data?.affectedSessions, "Sessions to move");
    } catch (err) {
      Toast.show({ type: "error", text1: "Could not add time off", text2: err?.data?.error || err.message });
    } finally {
      setSaving(false);
    }
  };

  const remove = (entry) => {
    confirmAction({
      title: "Remove time off?",
      message: `${formatRange(entry.startDate, entry.endDate)} will be bookable again.`,
      confirmText: "Remove",
      cancelText: "Keep it",
      destructive: true,
      onConfirm: async () => {
        setRemovingId(entry.id);
        try {
          await apiFetch(`/appointments/availability/time-off/${entry.id}`, { method: "DELETE" });
          setEntries((prev) => prev.filter((e) => e.id !== entry.id));
          Toast.show({ type: "success", text1: "Time off removed" });
        } catch (err) {
          Toast.show({ type: "error", text1: "Could not remove", text2: err?.data?.error || err.message });
        } finally {
          setRemovingId(null);
        }
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={accent} />
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
          <Text style={styles.title}>Time Off</Text>
          <Text style={styles.subtitle}>Nobody can book or be offered a time on these days</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* UPCOMING TIME OFF */}
          <Text style={styles.sectionLabel}>Upcoming</Text>
          {entries.length === 0 ? (
            <Text style={styles.emptyText}>No time off planned.</Text>
          ) : (
            entries.map((entry) => {
              const affected = entry.affectedSessions?.length ?? 0;
              return (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryRow}>
                    <MaterialCommunityIcons name="calendar-remove" size={20} color={BASE.warning} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.entryDates}>{formatRange(entry.startDate, entry.endDate)}</Text>
                      {entry.note ? <Text style={styles.entryNote}>{entry.note}</Text> : null}
                    </View>
                    {removingId === entry.id ? (
                      <ActivityIndicator size="small" color={BASE.error} />
                    ) : (
                      <TouchableOpacity onPress={() => remove(entry)} hitSlop={8}>
                        <Text style={[styles.removeText, { color: BASE.error }]}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {affected > 0 && (
                    <TouchableOpacity
                      style={[styles.affectedBox, { backgroundColor: BASE.warning + "15", borderColor: BASE.warning + "40" }]}
                      onPress={() => warnAboutSessions(entry.affectedSessions, "Sessions still booked")}
                    >
                      <MaterialCommunityIcons name="alert-outline" size={16} color={BASE.warning} />
                      <Text style={[styles.affectedText, { color: BASE.warning }]}>
                        {affected} session{affected === 1 ? "" : "s"} still booked — tap to see
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}

          {/* ADD TIME OFF */}
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Add time off</Text>
          <View style={styles.calendarCard}>
            <View style={styles.monthRow}>
              <TouchableOpacity onPress={() => shiftMonth(-1)} disabled={isCurrentMonth} hitSlop={8}>
                <MaterialCommunityIcons name="chevron-left" size={24} color={isCurrentMonth ? BASE.border : BASE.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>{monthLabel}</Text>
              <TouchableOpacity onPress={() => shiftMonth(1)} hitSlop={8}>
                <MaterialCommunityIcons name="chevron-right" size={24} color={BASE.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAY_HEADERS.map((d, i) => (
                <Text key={i} style={styles.weekHeader}>{d}</Text>
              ))}
            </View>

            {weeks.map((week, wi) => (
              <View key={wi} style={styles.weekRow}>
                {week.map((date, di) => {
                  if (!date) return <View key={di} style={styles.dayCell} />;
                  const ymd = toYmd(date);
                  const isPast = ymd < today;
                  const inRange = rangeStart && ymd >= rangeStart && ymd <= selectedEnd;
                  const isEdge = ymd === rangeStart || ymd === selectedEnd;
                  const alreadyOff = entries.some((e) => ymd >= e.startDate && ymd <= e.endDate);
                  return (
                    <TouchableOpacity
                      key={di}
                      style={styles.dayCell}
                      disabled={isPast}
                      onPress={() => pickDay(ymd)}
                    >
                      <View
                        style={[
                          styles.dayInner,
                          inRange && { backgroundColor: accent + "22" },
                          isEdge && { backgroundColor: accent },
                          !inRange && alreadyOff && { backgroundColor: BASE.warning + "22" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            isPast && { color: BASE.border },
                            ymd === today && !isEdge && { color: accent, fontWeight: "800" },
                            isEdge && { color: "#FFF", fontWeight: "800" },
                          ]}
                        >
                          {date.getDate()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            <Text style={styles.selectionText}>
              {rangeStart
                ? formatRange(rangeStart, selectedEnd)
                : "Tap a start date, then an end date"}
            </Text>
          </View>

          <TextInput
            style={styles.noteInput}
            placeholder="Note (optional) — e.g. Annual leave"
            placeholderTextColor={BASE.textMuted}
            value={note}
            onChangeText={setNote}
            maxLength={200}
          />

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: accent }, (!rangeStart || saving) && styles.saveBtnDisabled]}
          onPress={save}
          disabled={!rangeStart || saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Add Time Off</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (BASE) => StyleSheet.create({
  container: { flex: 1, backgroundColor: BASE.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: BASE.bg },

  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8 },
  backBtn: { padding: 8 },
  title: { color: BASE.textPrimary, fontSize: 22, fontWeight: "800" },
  subtitle: { color: BASE.textSecondary, fontSize: 12, marginTop: 3, maxWidth: 280 },

  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  sectionLabel: { color: BASE.textMuted, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 },
  emptyText: { color: BASE.textMuted, fontSize: 14 },

  entryCard: { backgroundColor: BASE.surface, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: BASE.border },
  entryRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  entryDates: { color: BASE.textPrimary, fontSize: 14, fontWeight: "700" },
  entryNote: { color: BASE.textSecondary, fontSize: 12, marginTop: 2 },
  removeText: { fontSize: 12, fontWeight: "700" },
  affectedBox: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, padding: 10, borderRadius: 10, borderWidth: 1 },
  affectedText: { fontSize: 12, fontWeight: "700", flex: 1 },

  calendarCard: { backgroundColor: BASE.surface, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: BASE.border },
  monthRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  monthLabel: { color: BASE.textPrimary, fontSize: 15, fontWeight: "800" },
  weekRow: { flexDirection: "row" },
  weekHeader: { flex: 1, textAlign: "center", color: BASE.textMuted, fontSize: 11, fontWeight: "800", paddingVertical: 6 },
  dayCell: { flex: 1, aspectRatio: 1, padding: 2 },
  dayInner: { flex: 1, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  dayText: { color: BASE.textPrimary, fontSize: 13, fontWeight: "600" },
  selectionText: { color: BASE.textSecondary, fontSize: 13, fontWeight: "600", textAlign: "center", marginTop: 10 },

  noteInput: {
    marginTop: 12, backgroundColor: BASE.surface, borderRadius: 14, borderWidth: 1, borderColor: BASE.border,
    paddingHorizontal: 14, paddingVertical: 12, color: BASE.textPrimary, fontSize: 14,
  },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: BASE.border },
  saveBtn: { borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#FFF", fontSize: 14, fontWeight: "800" },
});
