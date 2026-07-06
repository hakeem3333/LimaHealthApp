import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, ActivityIndicator,
  RefreshControl, Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../api/client";
import { BASE } from "../../utils/orgTheme";

const { width } = Dimensions.get("window");

const MOODS = [
  { icon: "emoticon-excited", label: "Great", value: "GREAT", color: "#10B981" },
  { icon: "emoticon-happy",   label: "Good",  value: "GOOD",  color: "#818CF8" },
  { icon: "emoticon-neutral", label: "Okay",  value: "OKAY",  color: "#F59E0B" },
  { icon: "emoticon-sad",     label: "Low",   value: "LOW",   color: "#EF4444" },
  { icon: "emoticon-dead",    label: "Awful", value: "AWFUL", color: "#DC2626" },
];

const MOOD_COLOR = { GREAT: "#10B981", GOOD: "#818CF8", OKAY: "#F59E0B", LOW: "#EF4444", AWFUL: "#DC2626" };

export default function MoodScreen() {
  const { user, theme } = useAuth();
  const [selected,  setSelected]  = useState(null);
  const [note,      setNote]      = useState("");
  const [history,   setHistory]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [noteFocus, setNoteFocus] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/mood-logs?userId=${user?.id}`);
      setHistory(Array.isArray(data) ? data : data?.data ?? []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { if (user?.id) fetchHistory(); }, [user?.id]);

  const handleSubmit = async () => {
    if (!selected) { Toast.show({ type: "error", text1: "Select a mood first" }); return; }
    setSaving(true);
    try {
      await apiFetch("/mood-logs", {
        method: "POST",
        body: JSON.stringify({ userId: user?.id, mood: selected, notes: note }),
      });
      Toast.show({ type: "success", text1: "Reflection saved", text2: "Keep checking in!" });
      setSelected(null); setNote("");
      await fetchHistory();
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed", text2: err.message });
    } finally { setSaving(false); }
  };

  // Compute weekly mood breakdown
  const moodCounts = MOODS.reduce((acc, m) => ({ ...acc, [m.value]: 0 }), {});
  history.slice(0, 7).forEach((h) => { if (h.mood && moodCounts[h.mood] !== undefined) moodCounts[h.mood]++; });

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchHistory} tintColor={theme.primary} />}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Reflections</Text>
        <Text style={styles.sub}>How are you feeling right now?</Text>
      </View>

      {/* MOOD PICKER */}
      <View style={styles.moodRow}>
        {MOODS.map((m) => {
          const active = selected === m.value;
          return (
            <TouchableOpacity
              key={m.value}
              onPress={() => setSelected(m.value)}
              style={[styles.moodCard, active && { borderColor: m.color, backgroundColor: m.color + "12" }]}
            >
              <MaterialCommunityIcons name={m.icon} size={30} color={active ? m.color : BASE.textMuted} />
              <Text style={[styles.moodLabel, active && { color: m.color }]}>{m.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* NOTES */}
      <View style={[styles.card, noteFocus && { borderColor: theme.primary }]}>
        <Text style={styles.cardLabel}>What's on your mind?</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Optional — write freely..."
          placeholderTextColor={BASE.textMuted}
          multiline numberOfLines={4}
          value={note} onChangeText={setNote}
          onFocus={() => setNoteFocus(true)}
          onBlur={() => setNoteFocus(false)}
        />
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.primary }, (!selected || saving) && styles.saveBtnDisabled]}
          onPress={handleSubmit}
          disabled={!selected || saving}
        >
          {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Log Reflection</Text>}
        </TouchableOpacity>
      </View>

      {/* WEEKLY BREAKDOWN */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>This Week</Text>
      </View>
      <View style={styles.card}>
        {MOODS.map((m) => {
          const count = moodCounts[m.value] || 0;
          const max   = Math.max(...Object.values(moodCounts), 1);
          const pct   = count / max;
          return (
            <View key={m.value} style={styles.barRow}>
              <Text style={[styles.barLabel, { color: m.color }]}>{m.label}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: m.color }]} />
              </View>
              <Text style={styles.barCount}>{count}x</Text>
            </View>
          );
        })}
      </View>

      {/* HISTORY TIMELINE */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Logs</Text>
      </View>
      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: 20 }} />
      ) : history.length === 0 ? (
        <Text style={styles.emptyText}>No reflections yet. Log your first one above!</Text>
      ) : (
        <View style={styles.timeline}>
          {history.slice(0, 10).map((item, i) => {
            const color = MOOD_COLOR[item.mood] || BASE.textSecondary;
            const date  = new Date(item.createdAt);
            const day   = date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
            const time  = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return (
              <View key={item.id || i} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.dot, { backgroundColor: color }]} />
                  {i < history.length - 1 && <View style={styles.line} />}
                </View>
                <View style={[styles.timelineCard, { borderLeftColor: color }]}>
                  <View style={styles.timelineTop}>
                    <Text style={[styles.moodValue, { color }]}>{item.mood}</Text>
                    <Text style={styles.timelineTime}>{time}</Text>
                  </View>
                  <Text style={styles.timelineDay}>{day}</Text>
                  {item.notes ? <Text style={styles.timelineNote}>{item.notes}</Text> : null}
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={{ height: 40 }} />
      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BASE.bg, paddingHorizontal: 20 },
  header:    { marginTop: 60, marginBottom: 24 },
  title:     { color: BASE.textPrimary, fontSize: 28, fontWeight: "800" },
  sub:       { color: BASE.textMuted,   fontSize: 15, marginTop: 4 },

  moodRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  moodCard: {
    width: (width - 60) / 5, paddingVertical: 14,
    alignItems: "center", borderRadius: 18,
    borderWidth: 1, borderColor: BASE.border,
    backgroundColor: BASE.surface,
  },
  moodLabel: { color: BASE.textMuted, fontSize: 9, fontWeight: "700", marginTop: 7 },

  card: {
    backgroundColor: BASE.surface, borderRadius: 22,
    padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: BASE.border,
  },
  cardLabel: { color: BASE.textPrimary, fontSize: 15, fontWeight: "600", marginBottom: 12 },
  textArea: {
    color: BASE.textPrimary, fontSize: 14, lineHeight: 22,
    minHeight: 80, textAlignVertical: "top",
  },
  saveBtn:         { borderRadius: 14, paddingVertical: 13, alignItems: "center", marginTop: 14 },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText:     { color: "#FFF", fontWeight: "700", fontSize: 15 },

  sectionHeader: { marginBottom: 12 },
  sectionTitle:  { color: BASE.textPrimary, fontSize: 17, fontWeight: "700" },

  barRow:   { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  barLabel: { width: 40, fontSize: 11, fontWeight: "700" },
  barTrack: { flex: 1, height: 6, backgroundColor: BASE.border, borderRadius: 3, marginHorizontal: 10 },
  barFill:  { height: 6, borderRadius: 3 },
  barCount: { color: BASE.textMuted, fontSize: 11, width: 24, textAlign: "right" },

  emptyText: { color: BASE.textMuted, textAlign: "center", marginTop: 24 },

  timeline:    { paddingLeft: 6 },
  timelineRow: { flexDirection: "row", marginBottom: 12 },
  timelineLeft:{ alignItems: "center", width: 18, marginRight: 14 },
  dot:         { width: 10, height: 10, borderRadius: 5 },
  line:        { width: 2, flex: 1, backgroundColor: BASE.border, marginTop: 4 },
  timelineCard:{ flex: 1, backgroundColor: BASE.surface, borderRadius: 16, padding: 14, borderLeftWidth: 3, borderWidth: 1, borderColor: BASE.border },
  timelineTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  moodValue:   { fontWeight: "700", fontSize: 14 },
  timelineTime:{ color: BASE.textMuted, fontSize: 11 },
  timelineDay: { color: BASE.textSecondary, fontSize: 12 },
  timelineNote:{ color: BASE.textMuted, fontSize: 12, marginTop: 6, lineHeight: 18 },
});
