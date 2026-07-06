import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, ActivityIndicator, Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-gifted-charts";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { useAuth } from "../../contexts/AuthContext";
import FitbitOnboardingModal from "../../components/FitbitOnboardingModal";
import { apiFetch, API_BASE_URL } from "../../api/client";
import { BASE } from "../../utils/orgTheme";

const { width } = Dimensions.get("window");
const FALLBACK_SERIES = [{ value: 0, label: "..." }];

const MOOD_OPTIONS = [
  { icon: "emoticon-excited-outline", label: "Great", value: "GREAT", color: "#10B981" },
  { icon: "emoticon-happy-outline",   label: "Good",  value: "GOOD",  color: "#818CF8" },
  { icon: "emoticon-neutral-outline", label: "Okay",  value: "OKAY",  color: "#F59E0B" },
  { icon: "emoticon-sad-outline",     label: "Low",   value: "LOW",   color: "#EF4444" },
];

export default function HomeScreen() {
  const { user, theme, memberLabel, supportLabel } = useAuth();
  const router = useRouter();

  const [isModalVisible,   setIsModalVisible]   = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [aiInsight,        setAiInsight]        = useState(null);
  const [lastSynced,       setLastSynced]       = useState("Not synced");
  const [selectedMood,     setSelectedMood]     = useState(null);
  const [submittingMood,   setSubmittingMood]   = useState(false);
  const [vitals, setVitals] = useState({
    heartRate: 0, steps: 0, calories: 0, sleep: 0,
    heartRateSeries: FALLBACK_SERIES,
  });

  const mean = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const std  = (arr) => {
    if (arr.length < 2) return 0;
    const m = mean(arr);
    return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
  };

  const fetchVitals = useCallback(async () => {
    try {
      const data = await apiFetch(`/fitbit/data/${user?.id}`);
      setVitals({
        heartRate:       data.heartRate       || 0,
        steps:           data.steps           || 0,
        calories:        data.calories        || 0,
        sleep:           data.sleep           || 0,
        heartRateSeries: data.heartRateSeries || FALLBACK_SERIES,
      });
      setLastSynced(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      try {
        const insight = await apiFetch("/ai/analyze", {
          method: "POST",
          body: JSON.stringify({ userId: user?.id, context: "biometric_summary", inputData: { heartRate: data.heartRate, stressLevel: data.stressLevel } }),
        });
        setAiInsight(insight?.data?.outputJson ?? null);
      } catch {}
    } catch (err) {
      console.error("Error fetching vitals:", err.message);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const check = async () => {
      try {
        const status = await apiFetch(`/fitbit/status/${user.id}`);
        setIsModalVisible(!status.isLinked);
        if (status.isLinked) await fetchVitals();
      } catch {
        setIsModalVisible(true);
      } finally {
        setIsCheckingStatus(false);
      }
    };
    check();
  }, [user?.id, fetchVitals]);

  const submitMood = async () => {
    if (!selectedMood) return;
    setSubmittingMood(true);
    try {
      await apiFetch("/mood-logs", { method: "POST", body: JSON.stringify({ userId: user?.id, mood: selectedMood }) });
      Toast.show({ type: "success", text1: "Mood logged", text2: "Thanks for checking in!" });
      setSelectedMood(null);
    } catch (err) {
      Toast.show({ type: "error", text1: "Couldn't save", text2: err.message });
    } finally {
      setSubmittingMood(false);
    }
  };

  const handleFitbitConnect = async () => {
    const redirectUri = Platform.OS === "web" ? "http://localhost:8081/home" : "limahealth://home";
    try {
      const result = await WebBrowser.openAuthSessionAsync(`${API_BASE_URL}/fitbit/auth?userId=${user?.id}`, redirectUri);
      if (result.type === "success") {
        setIsModalVisible(false);
        setIsCheckingStatus(true);
        setTimeout(fetchVitals, 2000);
      }
    } catch (err) { console.error(err); }
  };

  if (isCheckingStatus) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const isHighStress = aiInsight && aiInsight.riskScore > 60;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>{user?.firstName || memberLabel} 👋</Text>
            <View style={styles.syncRow}>
              <View style={[styles.syncDot, { backgroundColor: BASE.success }]} />
              <Text style={styles.syncText}>Synced {lastSynced}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.avatar}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>
              {user?.firstName?.[0] ?? "U"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── AI INSIGHT HERO ── */}
        {aiInsight && (
          <LinearGradient colors={theme.gradient} style={styles.aiCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.aiBadge}>
              <MaterialCommunityIcons name="auto-fix" size={11} color="rgba(255,255,255,0.8)" />
              <Text style={styles.aiBadgeText}>AI WELLNESS INSIGHT</Text>
            </View>
            <Text style={styles.aiTitle}>{isHighStress ? "Elevated Stress Detected" : "You're Doing Well"}</Text>
            <Text style={styles.aiDesc}>{aiInsight.insights}</Text>
            {isHighStress && (
              <TouchableOpacity style={styles.aiCta} onPress={() => router.push("/(student)/wellness")}>
                <Text style={styles.aiCtaText}>Book a {supportLabel}</Text>
                <MaterialCommunityIcons name="arrow-right" size={14} color={theme.primary} />
              </TouchableOpacity>
            )}
          </LinearGradient>
        )}

        {/* ── VITALS ROW ── */}
        <View style={styles.vitalsRow}>
          {[
            { icon: "walk",                label: "Steps",    val: vitals.steps.toLocaleString(),   sub: "/ 10k",   color: BASE.success },
            { icon: "fire",                label: "Calories", val: vitals.calories.toString(),       sub: "kcal",    color: BASE.warning },
            { icon: "moon-waning-crescent",label: "Sleep",    val: `${vitals.sleep}h`,              sub: "/ 8h",    color: "#818CF8"   },
            { icon: "heart-pulse",         label: "Heart",    val: `${vitals.heartRate}`,            sub: "bpm",     color: BASE.error  },
          ].map((v) => (
            <View key={v.label} style={styles.vitalCard}>
              <View style={[styles.vitalIcon, { backgroundColor: v.color + "18" }]}>
                <MaterialCommunityIcons name={v.icon} size={18} color={v.color} />
              </View>
              <Text style={styles.vitalVal}>{v.val}</Text>
              <Text style={styles.vitalSub}>{v.sub}</Text>
              <Text style={styles.vitalLabel}>{v.label}</Text>
            </View>
          ))}
        </View>

        {/* ── MOOD QUICK LOG ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How are you feeling?</Text>
          <Text style={styles.cardSub}>Quick check-in · takes 5 seconds</Text>
          <View style={styles.moodRow}>
            {MOOD_OPTIONS.map((m) => {
              const active = selectedMood === m.value;
              return (
                <TouchableOpacity
                  key={m.value}
                  onPress={() => setSelectedMood(m.value)}
                  style={[styles.moodBtn, active && { backgroundColor: m.color + "20", borderColor: m.color }]}
                >
                  <MaterialCommunityIcons name={m.icon} size={28} color={active ? m.color : BASE.textMuted} />
                  <Text style={[styles.moodBtnLabel, active && { color: m.color }]}>{m.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedMood && (
            <TouchableOpacity
              style={[styles.moodSubmit, { backgroundColor: theme.primary }]}
              onPress={submitMood}
              disabled={submittingMood}
            >
              {submittingMood ? <ActivityIndicator color="#FFF" /> : <Text style={styles.moodSubmitText}>Log Mood</Text>}
            </TouchableOpacity>
          )}
        </View>

        {/* ── HEART RATE CHART ── */}
        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.cardTitle}>Heart Rate Trend</Text>
              <Text style={styles.cardSub}>{vitals.heartRate} avg bpm today</Text>
            </View>
            <View style={[styles.bpmBadge, { backgroundColor: BASE.error + "15", borderColor: BASE.error + "40" }]}>
              <Text style={[styles.bpmBadgeText, { color: BASE.error }]}>{vitals.heartRate} bpm</Text>
            </View>
          </View>
          <LineChart
            data={vitals.heartRateSeries}
            areaChart curved height={160} hideDataPoints
            color={BASE.error} thickness={2.5}
            startFillColor="rgba(239,68,68,0.25)"
            endFillColor="rgba(239,68,68,0.01)"
            initialSpacing={10}
            xAxisColor="transparent" yAxisColor="transparent"
            yAxisTextStyle={{ color: BASE.textMuted, fontSize: 10 }}
            rulesColor={BASE.border}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <FitbitOnboardingModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onConnect={handleFitbitConnect}
      />
      <Toast />
    </View>
  );
}

const CARD_W = (width - 56) / 4;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BASE.bg, paddingHorizontal: 20 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: Platform.OS === "ios" ? 60 : 50, marginBottom: 24 },
  greeting: { color: BASE.textSecondary, fontSize: 14 },
  name:     { color: BASE.textPrimary, fontSize: 24, fontWeight: "800", marginTop: 2 },
  syncRow:  { flexDirection: "row", alignItems: "center", marginTop: 6 },
  syncDot:  { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  syncText: { color: BASE.success, fontSize: 12, fontWeight: "600" },
  avatar:   { width: 46, height: 46, borderRadius: 16, backgroundColor: BASE.surface, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: BASE.border },
  avatarText: { fontSize: 18, fontWeight: "800" },

  aiCard:     { borderRadius: 24, padding: 22, marginBottom: 20 },
  aiBadge:    { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: "flex-start", marginBottom: 12 },
  aiBadgeText:{ color: "rgba(255,255,255,0.85)", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  aiTitle:    { color: "#FFF", fontSize: 20, fontWeight: "800" },
  aiDesc:     { color: "rgba(255,255,255,0.78)", fontSize: 13, marginTop: 8, lineHeight: 20 },
  aiCta:      { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFF", alignSelf: "flex-start", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginTop: 16 },
  aiCtaText:  { fontWeight: "700", fontSize: 13 },

  vitalsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  vitalCard: { flex: 1, backgroundColor: BASE.surface, borderRadius: 20, padding: 14, alignItems: "center", borderWidth: 1, borderColor: BASE.border },
  vitalIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  vitalVal:  { color: BASE.textPrimary, fontSize: 16, fontWeight: "800" },
  vitalSub:  { color: BASE.textMuted,   fontSize: 10 },
  vitalLabel:{ color: BASE.textSecondary, fontSize: 10, fontWeight: "600", marginTop: 4 },

  card:       { backgroundColor: BASE.surface, borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: BASE.border },
  cardTitle:  { color: BASE.textPrimary, fontSize: 17, fontWeight: "700" },
  cardSub:    { color: BASE.textMuted, fontSize: 12, marginTop: 3, marginBottom: 16 },

  moodRow:       { flexDirection: "row", justifyContent: "space-between" },
  moodBtn:       { width: CARD_W, paddingVertical: 14, alignItems: "center", borderRadius: 18, borderWidth: 1, borderColor: BASE.border, backgroundColor: BASE.bg },
  moodBtnLabel:  { color: BASE.textMuted, fontSize: 10, fontWeight: "600", marginTop: 6 },
  moodSubmit:    { borderRadius: 16, paddingVertical: 13, alignItems: "center", marginTop: 14 },
  moodSubmitText:{ color: "#FFF", fontWeight: "700", fontSize: 15 },

  chartHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  bpmBadge:      { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  bpmBadgeText:  { fontWeight: "700", fontSize: 13 },
});
