import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-gifted-charts";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { useThemedStyles } from "../../contexts/ThemeContext";
import { apiFetch } from "../../api/client";

const { width } = Dimensions.get("window");
const HIGH_STRESS = 80; // same 0–100 scale the backend's stress estimate uses

export default function BioInsights() {
  const { user } = useAuth();
  const router = useRouter();
  const { styles, colors: BASE } = useThemedStyles(createStyles);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setMetrics(await apiFetch(`/fitbit/data/${user?.id}`));
    } catch (e) {
      console.error("Bio insights load error:", e.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user?.id, fetchData]);

  const series = metrics?.heartRateSeries?.length ? metrics.heartRateSeries : [{ value: 0, label: "" }];
  const showAIAlert = (metrics?.stressLevel ?? 0) > HIGH_STRESS;
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();
  const today = new Date().toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
  const syncedAt = metrics?.syncedAt
    ? new Date(metrics.syncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6B21A8" />
      </View>
    );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bio Insights</Text>
          <Text style={styles.subtitle}>
            {today} · Health Dashboard
          </Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

      {/* AI SUGGESTION - shown when the latest stress estimate is high */}
      {showAIAlert && (
        <LinearGradient colors={["#6B21A8", "#4C1D95"]} style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <MaterialCommunityIcons name="robot" size={20} color="#DDD6FE" />
            <Text style={styles.aiTag}>AI RECOMMENDATION</Text>
          </View>
          <Text style={styles.aiText}>
            High stress detected during your peak hours. Would you like to
            schedule a 15-min talk with a counselor?
          </Text>
          <TouchableOpacity style={styles.aiButton} onPress={() => router.push("/(student)/CounselingBooking")}>
            <Text style={styles.aiButtonText}>Book Appointment</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}

      {/* Metric Grid */}
      <View style={styles.grid}>
        <MetricCard
          icon="heart"
          label="Heart Rate"
          value={metrics?.heartRate ? String(Math.round(metrics.heartRate)) : "–"}
          sub="Resting bpm"
          color="#EF4444"
          glow="rgba(239, 68, 68, 0.2)"
        />
        <MetricCard
          icon="footprint"
          label="Steps"
          value={Math.round(metrics?.steps ?? 0).toLocaleString()}
          sub="Goal: 10k"
          color="#10B981"
          glow="rgba(16, 185, 129, 0.2)"
        />
        <MetricCard
          icon="fire"
          label="Calories"
          value={Math.round(metrics?.calories ?? 0).toLocaleString()}
          sub="kcal today"
          color="#F59E0B"
          glow="rgba(245, 158, 11, 0.2)"
        />
        <MetricCard
          icon="moon-waning-crescent"
          label="Sleep"
          value={`${metrics?.sleep ?? 0}h`}
          sub={`Goal: ${metrics?.sleepTarget ?? 8}h`}
          color="#818CF8"
          glow="rgba(129, 140, 248, 0.2)"
        />
      </View>

      {/* Heart Rate Chart Section */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Heart Rate Trend</Text>
          <View style={styles.liveBadge}>
            <View style={styles.dot} />
            <Text style={styles.liveText}>{syncedAt ? `Synced ${syncedAt}` : "No data yet"}</Text>
          </View>
        </View>
        <LineChart
          data={series}
          areaChart
          hideDataPoints
          isAnimated
          animationDuration={1400}
          animateOnDataChange
          onDataChangeAnimationDuration={600}
          thickness={3}
          color="#EF4444"
          startFillColor="rgba(239, 68, 68, 0.3)"
          endFillColor="rgba(239, 68, 68, 0.01)"
          initialSpacing={0}
          noOfSections={3}
          yAxisTextStyle={{ color: BASE.textMuted, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: BASE.textMuted, fontSize: 10 }}
          rulesColor={BASE.border}
          rulesType="solid"
          yAxisSide="right"
          hideRules
        />
      </View>
    </ScrollView>
  );
}

const MetricCard = ({ icon, label, value, sub, color, glow }) => {
  const { styles } = useThemedStyles(createStyles);
  return (
    <View style={[styles.card, { shadowColor: color, elevation: 5 }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
          <MaterialCommunityIcons name={icon} size={18} color={color} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={[styles.value, { color: color }]}>{value}</Text>
      <Text style={styles.subtitleText}>{sub}</Text>
    </View>
  );
};

const createStyles = (BASE) => StyleSheet.create({
  container: { flex: 1, backgroundColor: BASE.bg },
  loader: { flex: 1, justifyContent: "center", backgroundColor: BASE.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    paddingTop: 60,
  },
  title: { fontSize: 24, fontWeight: "bold", color: BASE.textPrimary },
  subtitle: { fontSize: 12, color: BASE.textMuted, marginTop: 4 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BASE.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BASE.border,
  },
  avatarText: { color: "#818CF8", fontWeight: "bold", fontSize: 12 },
  aiCard: { margin: 20, borderRadius: 24, padding: 20 },
  aiHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  aiTag: {
    color: "#DDD6FE",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 8,
    letterSpacing: 1,
  },
  aiText: { color: "#FFF", fontSize: 14, lineHeight: 20, marginBottom: 15 },
  aiButton: {
    backgroundColor: "#FFF",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  aiButtonText: { color: "#6B21A8", fontWeight: "bold", fontSize: 13 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 15,
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: BASE.surface,
    width: width * 0.44,
    padding: 16,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: BASE.border,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  iconContainer: { padding: 8, borderRadius: 10, marginRight: 8 },
  label: { color: BASE.textSecondary, fontSize: 12, fontWeight: "500" },
  value: { fontSize: 22, fontWeight: "bold" },
  subtitleText: { color: BASE.textMuted, fontSize: 10, marginTop: 4 },
  chartCard: {
    backgroundColor: BASE.surface,
    margin: 20,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BASE.border,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  chartTitle: { color: BASE.textPrimary, fontSize: 16, fontWeight: "bold" },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
    marginRight: 6,
  },
  liveText: { color: "#EF4444", fontSize: 10, fontWeight: "bold" },
});