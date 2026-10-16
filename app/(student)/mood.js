import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, ActivityIndicator,
  RefreshControl, Animated, PanResponder,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../api/client";
import { useThemedStyles } from "../../contexts/ThemeContext";

const MOODS = [
  { icon: "emoticon-excited", label: "Great", value: "GREAT", color: "#10B981" },
  { icon: "emoticon-happy",   label: "Good",  value: "GOOD",  color: "#818CF8" },
  { icon: "emoticon-neutral", label: "Okay",  value: "OKAY",  color: "#F59E0B" },
  { icon: "emoticon-sad",     label: "Low",   value: "LOW",   color: "#EF4444" },
  { icon: "emoticon-dead",    label: "Awful", value: "AWFUL", color: "#DC2626" },
];

const MOOD_COLOR = { GREAT: "#10B981", GOOD: "#818CF8", OKAY: "#F59E0B", LOW: "#EF4444", AWFUL: "#DC2626" };

const THUMB_SIZE = 54;

function MoodSlider({ value, onChange }) {
  const { styles, colors: BASE } = useThemedStyles(createStyles);
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef(null);
  const trackPageX = useRef(0);
  const anim = useRef(new Animated.Value(2)).current;
  const [liveIndex, setLiveIndex] = useState(
    value ? Math.max(MOODS.findIndex((m) => m.value === value), 0) : 2
  );
  const [touched, setTouched] = useState(!!value);

  const usable = Math.max(trackWidth - THUMB_SIZE, 1);

  const indexFromPageX = (pageX) => {
    const localX = pageX - trackPageX.current - THUMB_SIZE / 2;
    const clamped = Math.min(Math.max(localX, 0), usable);
    return (clamped / usable) * (MOODS.length - 1);
  };

  const commit = (idx) => {
    const rounded = Math.round(Math.min(Math.max(idx, 0), MOODS.length - 1));
    Animated.spring(anim, { toValue: rounded, useNativeDriver: false, friction: 7, tension: 60 }).start();
    setLiveIndex(rounded);
    setTouched(true);
    onChange(MOODS[rounded].value);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setTouched(true);
        const idx = indexFromPageX(evt.nativeEvent.pageX);
        anim.setValue(idx);
        setLiveIndex(Math.round(idx));
      },
      onPanResponderMove: (_evt, gesture) => {
        const idx = indexFromPageX(gesture.moveX);
        anim.setValue(idx);
        const rounded = Math.round(idx);
        setLiveIndex((prev) => (prev !== rounded ? rounded : prev));
      },
      onPanResponderRelease: () => {
        anim.stopAnimation((current) => commit(current));
      },
      onPanResponderTerminate: () => {
        anim.stopAnimation((current) => commit(current));
      },
    })
  ).current;

  const translateX = anim.interpolate({
    inputRange: [0, MOODS.length - 1],
    outputRange: [0, usable],
    extrapolate: "clamp",
  });
  const bgColor = anim.interpolate({
    inputRange: MOODS.map((_, i) => i),
    outputRange: MOODS.map((m) => m.color),
  });

  const activeMood = MOODS[liveIndex];

  return (
    <View style={styles.sliderWrap}>
      <View
        ref={trackRef}
        style={styles.sliderTrack}
        onLayout={(e) => {
          setTrackWidth(e.nativeEvent.layout.width);
          requestAnimationFrame(() => {
            trackRef.current?.measure?.((x, y, w, h, pageX) => { trackPageX.current = pageX; });
          });
        }}
        {...panResponder.panHandlers}
      >
        <View style={styles.sliderTrackBg} />
        {trackWidth > 0 && (
          <Animated.View
            style={[
              styles.sliderThumb,
              {
                transform: [{ translateX }],
                backgroundColor: touched ? bgColor : BASE.border,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={activeMood.icon}
              size={28}
              color={touched ? "#fff" : BASE.textMuted}
            />
          </Animated.View>
        )}
      </View>
      <View style={styles.sliderLabels}>
        {MOODS.map((m, i) => {
          const active = touched && i === liveIndex;
          return (
            <TouchableOpacity
              key={m.value}
              style={styles.sliderLabelHit}
              onPress={() => commit(i)}
            >
              <Text style={[styles.sliderLabelText, active && { color: m.color, fontWeight: "800" }]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function MoodScreen() {
  const { user, theme } = useAuth();
  const { styles, colors: BASE } = useThemedStyles(createStyles);
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
      <MoodSlider value={selected} onChange={setSelected} />

      {/* NOTES */}
      <View style={[styles.card, noteFocus && { borderColor: theme.primary }]}>
        <Text style={styles.cardLabel}>What&apos;s on your mind?</Text>
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
    </ScrollView>
  );
}

const createStyles = (BASE) => StyleSheet.create({
  container: { flex: 1, backgroundColor: BASE.bg, paddingHorizontal: 20 },
  header:    { marginTop: 60, marginBottom: 24 },
  title:     { color: BASE.textPrimary, fontSize: 28, fontWeight: "800" },
  sub:       { color: BASE.textMuted,   fontSize: 15, marginTop: 4 },

  sliderWrap: { marginBottom: 22 },
  sliderTrack: { height: THUMB_SIZE, justifyContent: "center" },
  sliderTrackBg: {
    position: "absolute",
    left: THUMB_SIZE / 2, right: THUMB_SIZE / 2,
    height: 8, borderRadius: 4,
    backgroundColor: BASE.border,
  },
  sliderThumb: {
    position: "absolute", top: 0, left: 0,
    width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: THUMB_SIZE / 2,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  sliderLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  sliderLabelHit: { flex: 1, alignItems: "center", paddingVertical: 4 },
  sliderLabelText: { color: BASE.textMuted, fontSize: 11, fontWeight: "600" },

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
