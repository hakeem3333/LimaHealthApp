import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-gifted-charts";
import * as WebBrowser from "expo-web-browser";

// Context & Components
import { useAuth } from "../../contexts/AuthContext";
import FitbitOnboardingModal from "../../components/FitbitOnboardingModal";

const { width } = Dimensions.get("window");

const USE_MOCK_DATA = true;

const MOCK_HEALTH_DATA = {
  heartRate: 74,
  steps: 8432,
  calories: 1840,
  sleep: 7.2,
  heartRateSeries: [
    { value: 62, label: "6am" },
    { value: 75, label: "9am" },
    { value: 92, label: "12pm" },
    { value: 115, label: "3pm" },
    { value: 85, label: "6pm" },
    { value: 70, label: "9pm" },
    { value: 65, label: "12am" },
  ],
};

// UPDATED ICON NAMES FOR MATERIAL COMMUNITY ICONS
const MOOD_OPTIONS = [
  { emoji: "emoticon-excited-outline", label: "Great", color: "#10B981" },
  { emoji: "emoticon-happy-outline", label: "Good", color: "#8B5CF6" },
  { emoji: "emoticon-neutral-outline", label: "Okay", color: "#F59E0B" },
  { emoji: "emoticon-sad-outline", label: "Low", color: "#EF4444" },
];

export default function BioInsightsScreen() {
  const { user } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isStressed, setIsStressed] = useState(true);
  const [lastSynced, setLastSynced] = useState("Checking...");
  const [selectedMood, setSelectedMood] = useState(null);

  const [vitals, setVitals] = useState({
    heartRate: 0,
    steps: 0,
    calories: 0,
    sleep: 0,
    heartRateSeries: [{ value: 0, label: "..." }],
  });

  const BASE_URL = "https://3466-102-89-84-114.ngrok-free.app";

  const fetchVitals = async () => {
    try {
      let healthData;
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        healthData = MOCK_HEALTH_DATA;
      } else {
        const response = await fetch(
          `${BASE_URL}/api/v1/fitbit/data/${user?.id}`,
          {
            headers: {
              Accept: "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          },
        );
        healthData = await response.json();
      }

      setVitals({
        heartRate: healthData.heartRate || 0,
        steps: healthData.steps || 0,
        calories: healthData.calories || 0,
        sleep: healthData.sleep || 0,
        heartRateSeries:
          healthData.heartRateSeries || MOCK_HEALTH_DATA.heartRateSeries,
      });

      setLastSynced(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } catch (err) {
      console.error("Error fetching vitals:", err);
    }
  };

  useEffect(() => {
    const checkFitbitStatus = async () => {
      if (!user?.id && !USE_MOCK_DATA) return;
      try {
        let statusData = USE_MOCK_DATA ? { isLinked: true } : null;
        if (!USE_MOCK_DATA) {
          const response = await fetch(
            `${BASE_URL}/api/v1/fitbit/status/${user.id}`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
              },
            },
          );
          statusData = await response.json();
        }
        setIsModalVisible(!statusData.isLinked);
        if (statusData.isLinked) await fetchVitals();
      } catch (error) {
        console.error("Failed to check Fitbit status", error);
      } finally {
        setIsCheckingStatus(false);
      }
    };
    checkFitbitStatus();
  }, [user?.id]);

  const handleFitbitConnect = async () => {
    if (USE_MOCK_DATA) {
      setIsModalVisible(false);
      setIsCheckingStatus(true);
      setTimeout(fetchVitals, 1000);
      return;
    }
    const redirectUri =
      Platform.OS === "web"
        ? "http://localhost:8081/home"
        : "limahealth://home";
    try {
      const authUrl = `${BASE_URL}/api/v1/fitbit/auth?userId=${user?.id}`;
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri,
      );
      if (result.type === "success") {
        setIsModalVisible(false);
        setIsCheckingStatus(true);
        setTimeout(fetchVitals, 2000);
      }
    } catch (error) {
      console.error("Fitbit Auth Error:", error);
    }
  };

  if (isCheckingStatus) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#6D28D9" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>
              Hi, {user?.firstName || "Student"}
            </Text>
            <View style={styles.syncRow}>
              <MaterialCommunityIcons name="cached" size={14} color="#10B981" />
              <Text style={styles.syncText}>Fitbit synced {lastSynced}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.profileCircle}>
            <MaterialCommunityIcons name="account" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* AI HERO */}
        {isStressed && (
          <TouchableOpacity activeOpacity={0.9}>
            <LinearGradient
              colors={["#6D28D9", "#4C1D95"]}
              style={styles.aiHero}
            >
              <View style={styles.aiBadge}>
                <MaterialCommunityIcons
                  name="auto-fix"
                  size={12}
                  color="#DDD6FE"
                />
                <Text style={styles.aiBadgeText}>AI INSIGHT</Text>
              </View>
              <Text style={styles.aiTitle}>High Stress Detected</Text>
              <Text style={styles.aiDesc}>
                Your heart rate was elevated during your study block. Want to
                try a 5-min breathing exercise?
              </Text>
              <View style={styles.aiActionRow}>
                <View style={styles.aiBtnPrimary}>
                  <TouchableOpacity
                    style={styles.aiBtnPrimary}
                    onPress={() => navigation.navigate("CounselingBooking")}
                  >
                    <Text style={styles.aiBtnText}>Book Now</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.aiBtnSecondary}>Dismiss</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* RESPONSIVE MOOD LOG SECTION */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Daily Reflection</Text>
          <Text style={styles.sectionSub}>How are you feeling right now?</Text>
          <View style={styles.moodGrid}>
            {MOOD_OPTIONS.map((mood, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedMood(mood.label)}
                style={[
                  styles.moodItem,
                  selectedMood === mood.label && {
                    backgroundColor: mood.color + "25",
                    borderColor: mood.color,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={mood.emoji}
                  size={32}
                  color={selectedMood === mood.label ? mood.color : "#475569"}
                />
                <Text
                  style={[
                    styles.moodLabel,
                    selectedMood === mood.label && { color: "#FFF" },
                  ]}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* PROGRESS RINGS */}
        <View style={styles.ringsContainer}>
          <View style={styles.ringCard}>
            <ProgressRing
              percentage={Math.min(
                Math.round((vitals.steps / 10000) * 100),
                100,
              )}
              color="#10B981"
              icon="walk"
              label="Steps"
            />
            <ProgressRing
              percentage={Math.min(
                Math.round((vitals.calories / 2500) * 100),
                100,
              )}
              color="#F59E0B"
              icon="fire"
              label="Kcal"
            />
            <ProgressRing
              percentage={Math.min(Math.round((vitals.sleep / 8) * 100), 100)}
              color="#6366F1"
              icon="moon-waning-crescent"
              label="Sleep"
            />
          </View>
        </View>

        {/* CHART */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Heart Rate Trend</Text>
            <Text style={styles.chartSub}>{vitals.heartRate} avg bpm</Text>
          </View>
          <LineChart
            data={vitals.heartRateSeries}
            areaChart
            curved
            height={180}
            hideDataPoints
            color="#EF4444"
            thickness={3}
            startFillColor="rgba(239, 68, 68, 0.3)"
            endFillColor="rgba(239, 68, 68, 0.01)"
            initialSpacing={10}
            xAxisColor="transparent"
            yAxisColor="transparent"
            yAxisTextStyle={{ color: "#64748B", fontSize: 10 }}
            rulesColor="#1E293B"
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <FitbitOnboardingModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onConnect={handleFitbitConnect}
      />
    </View>
  );
}

const ProgressRing = ({ percentage, color, icon, label }) => (
  <View style={styles.ringItem}>
    <View style={[styles.ringOuter, { borderColor: color + "30" }]}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.ringVal}>{percentage}%</Text>
    <Text style={styles.ringLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617", paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 60,
    marginBottom: 25,
  },
  welcomeText: { color: "#F8FAFC", fontSize: 22, fontWeight: "800" },
  syncRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  syncText: {
    color: "#10B981",
    fontSize: 12,
    marginLeft: 5,
    fontWeight: "600",
  },
  profileCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  aiHero: { padding: 20, borderRadius: 28, marginBottom: 25 },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  aiBadgeText: {
    color: "#DDD6FE",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 5,
  },
  aiTitle: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
  aiDesc: { color: "#E9D5FF", fontSize: 14, marginTop: 8, lineHeight: 20 },
  aiActionRow: { flexDirection: "row", alignItems: "center", marginTop: 18 },
  aiBtnPrimary: {
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  aiBtnText: { color: "#4C1D95", fontWeight: "bold", fontSize: 14 },
  aiBtnSecondary: {
    color: "#FFF",
    marginLeft: 20,
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.8,
  },

  sectionCard: {
    backgroundColor: "#0F172A",
    padding: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 25,
  },
  sectionTitle: { color: "#F8FAFC", fontSize: 18, fontWeight: "bold" },
  sectionSub: {
    color: "#475569",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 15,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  moodItem: {
    width: "23%",
    aspectRatio: 1,
    backgroundColor: "#1E293B",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  moodLabel: {
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 8,
    fontWeight: "600",
  },

  ringsContainer: { marginBottom: 25 },
  ringCard: {
    backgroundColor: "#0F172A",
    padding: 20,
    borderRadius: 28,
    flexDirection: "row",
    justifyContent: "space-around",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  ringItem: { alignItems: "center" },
  ringOuter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  ringVal: { color: "#F8FAFC", fontWeight: "bold", fontSize: 14 },
  ringLabel: { color: "#64748B", fontSize: 11, marginTop: 2 },
  chartCard: {
    backgroundColor: "#0F172A",
    padding: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  chartHeader: { marginBottom: 20 },
  chartTitle: { color: "#F8FAFC", fontSize: 18, fontWeight: "bold" },
  chartSub: { color: "#64748B", fontSize: 13, marginTop: 2 },
});
