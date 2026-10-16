import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, ActivityIndicator, Platform, RefreshControl,
} from "react-native";
import * as Linking from "expo-linking";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-gifted-charts";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { useAuth } from "../../contexts/AuthContext";
import FitbitOnboardingModal from "../../components/FitbitOnboardingModal";
import { apiFetch, API_ORIGIN } from "../../api/client";
import { useThemedStyles } from "../../contexts/ThemeContext";

const { width } = Dimensions.get("window");
const FALLBACK_SERIES = [{ value: 0, label: "..." }];
const FITBIT_SKIP_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const fitbitSkipKey = (userId) => `fitbit_skip_${userId}`;

// "14:32" for today's readings, "Mon 14:32" for older ones.
const formatSyncedAt = (iso) => {
  if (!iso) return "Not synced";
  const d = new Date(iso);
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toDateString() === new Date().toDateString()
    ? time
    : `${d.toLocaleDateString([], { weekday: "short" })} ${time}`;
};

const getFitbitSkippedAt = async (userId) => {
  const key = fitbitSkipKey(userId);
  const val =
    Platform.OS === "web"
      ? localStorage.getItem(key)
      : await SecureStore.getItemAsync(key);
  return val ? Number(val) : null;
};

const setFitbitSkippedNow = async (userId) => {
  const key = fitbitSkipKey(userId);
  const val = String(Date.now());
  if (Platform.OS === "web") localStorage.setItem(key, val);
  else await SecureStore.setItemAsync(key, val);
};

// Toast for the backend's ?success= / ?error= on the Fitbit return URL.
// Returns true when the link succeeded.
const showFitbitLinkResult = (queryParams) => {
  if (queryParams?.error) {
    const msg = {
      fitbit_already_linked_to_other: "This Fitbit is already linked to another account.",
      missing_permissions: "Please allow access to all the listed data on the Google screen.",
    }[queryParams.error] ?? "Fitbit linking didn't complete. Please try again.";
    Toast.show({ type: "error", text1: "Couldn't connect Fitbit", text2: msg });
    return false;
  }
  Toast.show({ type: "success", text1: "Fitbit connected", text2: "Pulling your latest data…" });
  return true;
};

const MOOD_OPTIONS = [
  { icon: "emoticon-excited-outline", label: "Great", value: "GREAT", color: "#10B981" },
  { icon: "emoticon-happy-outline",   label: "Good",  value: "GOOD",  color: "#818CF8" },
  { icon: "emoticon-neutral-outline", label: "Okay",  value: "OKAY",  color: "#F59E0B" },
  { icon: "emoticon-sad-outline",     label: "Low",   value: "LOW",   color: "#EF4444" },
];

export default function HomeScreen() {
  const { styles, colors: BASE } = useThemedStyles(createStyles);
  const { user, theme, memberLabel, supportLabel } = useAuth();
  const router = useRouter();

  const [isModalVisible,   setIsModalVisible]   = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [aiInsight,        setAiInsight]        = useState(null);
  const [lastSynced,       setLastSynced]       = useState("Not synced");
  const [isLinked,         setIsLinked]         = useState(false);
  const [refreshing,       setRefreshing]       = useState(false);
  const [selectedMood,     setSelectedMood]     = useState(null);
  const [submittingMood,   setSubmittingMood]   = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [vitals, setVitals] = useState({
    heartRate: 0, steps: 0, calories: 0, sleep: 0, sleepTarget: 8,
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
        sleepTarget:     data.sleepTarget     || 8, // org's sleep target
        heartRateSeries: data.heartRateSeries?.length ? data.heartRateSeries : FALLBACK_SERIES,
      });
      setLastSynced(formatSyncedAt(data.syncedAt));
      if (!data.syncedAt) return; // nothing stored yet — no vitals to analyse
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

  // Ask the backend to pull fresh data from Fitbit, then reload what's stored.
  // The server throttles syncs, so calling this on every visit is cheap.
  const syncAndLoad = useCallback(async (force = false) => {
    try {
      await apiFetch(`/fitbit/sync${force ? "?force=true" : ""}`, { method: "POST" });
    } catch (err) {
      if (err.status === 409 || err.status === 404) {
        // Link was revoked on Fitbit's side — prompt to reconnect.
        setIsLinked(false);
        setIsModalVisible(true);
      } else if (force) {
        Toast.show({ type: "error", text1: "Couldn't sync Fitbit", text2: "Showing your last saved data." });
      }
    }
    await fetchVitals();
  }, [fetchVitals]);

  useEffect(() => {
    if (!user?.id) return;
    const check = async () => {
      try {
        const status = await apiFetch(`/fitbit/status/${user.id}`);
        setIsLinked(!!status.isLinked);
        if (status.isLinked) {
          setIsModalVisible(false);
          await fetchVitals();          // show stored data immediately…
          syncAndLoad();                // …then refresh from Fitbit in the background
        } else {
          fetchVitals();                // readings from before an unlink are still stored
          const skippedAt = await getFitbitSkippedAt(user.id);
          const onCooldown = skippedAt && Date.now() - skippedAt < FITBIT_SKIP_COOLDOWN_MS;
          setIsModalVisible(!onCooldown);
        }
      } catch (err) {
        // Status check failed (e.g. network error) — don't nag with the
        // onboarding modal for something unrelated to the user's Fitbit link.
        console.error("Fitbit status check error:", err.message);
      } finally {
        setIsCheckingStatus(false);
      }
    };
    check();
  }, [user?.id, fetchVitals, syncAndLoad]);

  // Web: if the browser opened the Fitbit flow in this tab instead of a popup
  // (popup blocked, or opened as a tab), we land back here with the result in
  // the URL and openAuthSessionAsync never resolves — report it from the URL.
  const { success: linkSuccess, error: linkError } = useLocalSearchParams();
  useEffect(() => {
    if (Platform.OS !== "web" || window.opener) return;
    if (!linkSuccess && !linkError) return;
    showFitbitLinkResult({ success: linkSuccess, error: linkError });
    // Drop the query so a reload doesn't repeat the toast. Done without a
    // navigation (which would hide the toast), once the router has written
    // its own URL.
    setTimeout(() => window.history.replaceState(window.history.state, "", window.location.pathname), 1000);
  }, [linkSuccess, linkError]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    const checkUnread = async () => {
      try {
        const res = await apiFetch("/messages");
        const total = (res.data || []).reduce((sum, c) => sum + c.unreadCount, 0);
        if (!cancelled) setHasUnreadMessages(total > 0);
      } catch (err) {
        console.error("Unread messages check error:", err.message);
      }
    };
    checkUnread();
    const interval = setInterval(checkUnread, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user?.id]);

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

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (isLinked) await syncAndLoad(true);
      else await fetchVitals();
    } finally {
      setRefreshing(false);
    }
  };

  const handleFitbitConnect = async () => {
    // Where the backend sends the browser back to after Fitbit consent:
    // limahealth://home in builds, exp://… in Expo Go, http://…/home on web.
    const redirectUri = Linking.createURL("/home");
    try {
      const { url } = await apiFetch(`/fitbit/auth-url?redirect=${encodeURIComponent(redirectUri)}`);
      const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);
      if (result.type !== "success") return;

      const { queryParams } = Linking.parse(result.url);
      if (!showFitbitLinkResult(queryParams)) return;

      setIsModalVisible(false);
      setIsLinked(true);
      await syncAndLoad(true);
    } catch (err) {
      console.error("Fitbit connect error:", err.message);
      Toast.show({ type: "error", text1: "Couldn't connect Fitbit", text2: err.message });
    }
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
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>{user?.firstName || memberLabel} 👋</Text>
            <View style={styles.syncRow}>
              <View style={[styles.syncDot, { backgroundColor: isLinked ? BASE.success : BASE.textMuted }]} />
              <Text style={[styles.syncText, !isLinked && { color: BASE.textMuted }]}>
                {isLinked
                  ? `Synced ${lastSynced}`
                  : lastSynced === "Not synced" ? "Fitbit not connected" : `Fitbit not connected · last data ${lastSynced}`}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.messageIconBtn} onPress={() => router.push("/(student)/messages")}>
              <MaterialCommunityIcons name="message-text-outline" size={20} color={BASE.textSecondary} />
              {hasUnreadMessages && <View style={styles.unreadIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatar} onPress={() => router.push("/(student)/profile")}>
              {user?.profileImage ? (
                <Image
                  source={{ uri: `${API_ORIGIN}${user.profileImage}` }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <Text style={[styles.avatarText, { color: theme.primary }]}>
                  {user?.firstName?.[0] ?? "U"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
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
            { icon: "moon-waning-crescent",label: "Sleep",    val: `${vitals.sleep}h`,              sub: `/ ${vitals.sleepTarget}h`, color: "#818CF8"   },
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
            isAnimated animationDuration={1400}
            // No animateOnDataChange: it interpolates between old/new SVG path
            // strings, which crashes ("All elements of output range should have
            // the same number of components") when a curved series changes length.
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
        onClose={() => {
          setIsModalVisible(false);
          setFitbitSkippedNow(user?.id);
        }}
        onConnect={handleFitbitConnect}
      />
    </View>
  );
}

const createStyles = (BASE) => StyleSheet.create({
  container: { flex: 1, backgroundColor: BASE.bg, paddingHorizontal: 20 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: Platform.OS === "ios" ? 60 : 50, marginBottom: 24 },
  greeting: { color: BASE.textSecondary, fontSize: 14 },
  name:     { color: BASE.textPrimary, fontSize: 24, fontWeight: "800", marginTop: 2 },
  syncRow:  { flexDirection: "row", alignItems: "center", marginTop: 6 },
  syncDot:  { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  syncText: { color: BASE.success, fontSize: 12, fontWeight: "600" },
  avatar:   { width: 46, height: 46, borderRadius: 16, backgroundColor: BASE.surface, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: BASE.border, overflow: "hidden" },
  avatarText: { fontSize: 18, fontWeight: "800" },
  avatarImage: { width: "100%", height: "100%" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  messageIconBtn: { width: 46, height: 46, borderRadius: 16, backgroundColor: BASE.surface, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: BASE.border, position: "relative" },
  unreadIndicator: { position: "absolute", top: 9, right: 9, width: 9, height: 9, borderRadius: 4.5, backgroundColor: "#EF4444", borderWidth: 1.5, borderColor: BASE.surface },

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

  moodRow:       { flexDirection: "row", gap: 8 },
  moodBtn:       { flex: 1, paddingVertical: 14, alignItems: "center", borderRadius: 18, borderWidth: 1, borderColor: BASE.border, backgroundColor: BASE.bg },
  moodBtnLabel:  { color: BASE.textMuted, fontSize: 10, fontWeight: "600", marginTop: 6 },
  moodSubmit:    { borderRadius: 16, paddingVertical: 13, alignItems: "center", marginTop: 14 },
  moodSubmitText:{ color: "#FFF", fontWeight: "700", fontSize: 15 },

  chartHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  bpmBadge:      { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  bpmBadgeText:  { fontWeight: "700", fontSize: 13 },
});
