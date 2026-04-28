// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Alert,
//   Dimensions,
// } from "react-native";
// import { MaterialCommunityIcons } from "@expo/vector-icons";
// import { useAuth } from "../../contexts/AuthContext";

// const { width } = Dimensions.get("window");

// export default function Insights() {
//   const { user } = useAuth();
//   const [logs, setLogs] = useState([]);
//   const [isAnalyzing, setIsAnalyzing] = useState(true);

//   const BASE_URL = "https://766c-102-89-82-128.ngrok-free.app";

//   useEffect(() => {
//     fetchBiometrics();
//   }, []);

//   const fetchBiometrics = async () => {
//     try {
//       const response = await fetch(
//         `${BASE_URL}/api/v1/biometrics?userId=${user.id}`,
//         {
//           headers: { "ngrok-skip-browser-warning": "true" },
//         },
//       );
//       const data = await response.json();
//       setLogs(data);
//       runAISuggestionLogic(data);
//     } catch (e) {
//       console.error("Failed to load logs", e);
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   const runAISuggestionLogic = (data) => {
//     // Logic: If last 3 entries are high stress
//     const recentStress = data
//       .slice(-3)
//       .filter((log) => log.stressLevelScore > 80);
//     if (recentStress.length >= 2) {
//       // Trigger AI recommendation UI
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Health Insights</Text>
//         <Text style={styles.subtitle}>AI-powered analysis of your vitals</Text>
//       </View>

//       {/* AI SUGGESTION CARD */}
//       <View style={styles.aiCard}>
//         <View style={styles.aiHeader}>
//           <MaterialCommunityIcons name="robot-mimo" size={24} color="#FFF" />
//           <Text style={styles.aiTag}>AI RECOMMENDATION</Text>
//         </View>
//         <Text style={styles.aiText}>
//           Your stress levels were 15% higher this week than last. We recommend a
//           10-minute mindfulness session or booking a talk with a counselor.
//         </Text>
//         <TouchableOpacity style={styles.aiButton}>
//           <Text style={styles.aiButtonText}>Book Appointment</Text>
//         </TouchableOpacity>
//       </View>

//       {/* VITALS GRID */}
//       <View style={styles.grid}>
//         <InsightCard
//           icon="heart-pulse"
//           label="Avg Heart Rate"
//           value="74"
//           unit="bpm"
//           trend="+2%"
//           color="#EF4444"
//         />
//         <InsightCard
//           icon="lightning-bolt"
//           label="GSR (Stress)"
//           value="0.45"
//           unit="μS"
//           trend="-5%"
//           color="#F59E0B"
//         />
//         <InsightCard
//           icon="thermometer"
//           label="Skin Temp"
//           value="36.4"
//           unit="°C"
//           trend="Stable"
//           color="#3B82F6"
//         />
//         <InsightCard
//           icon="run"
//           label="Movement"
//           value="12k"
//           unit="steps"
//           trend="+12%"
//           color="#10B981"
//         />
//       </View>
//     </ScrollView>
//   );
// }

// // Sub-component for clean design
// const InsightCard = ({ icon, label, value, unit, trend, color }) => (
//   <View style={styles.card}>
//     <View style={[styles.iconBox, { backgroundColor: color + "15" }]}>
//       <MaterialCommunityIcons name={icon} size={22} color={color} />
//     </View>
//     <Text style={styles.label}>{label}</Text>
//     <View style={styles.valueRow}>
//       <Text style={styles.value}>{value}</Text>
//       <Text style={styles.unit}>{unit}</Text>
//     </View>
//     <Text
//       style={[
//         styles.trend,
//         { color: trend.includes("+") ? "#10B981" : "#6B7280" },
//       ]}
//     >
//       {trend} vs last week
//     </Text>
//   </View>
// );

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F8F9FE" },
//   header: { padding: 24, paddingTop: 60 },
//   title: { fontSize: 28, fontWeight: "800", color: "#1E1B4B" },
//   subtitle: { fontSize: 16, color: "#64748B", marginTop: 4 },
//   aiCard: {
//     margin: 20,
//     padding: 20,
//     borderRadius: 24,
//     backgroundColor: "#6B21A8",
//     shadowColor: "#6B21A8",
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.3,
//     shadowRadius: 20,
//     elevation: 10,
//   },
//   aiHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
//   aiTag: {
//     color: "#E9D5FF",
//     fontSize: 12,
//     fontWeight: "bold",
//     marginLeft: 8,
//     letterSpacing: 1,
//   },
//   aiText: { color: "#FFF", fontSize: 15, lineHeight: 22, marginBottom: 16 },
//   aiButton: {
//     backgroundColor: "#FFF",
//     padding: 12,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   aiButtonText: { color: "#6B21A8", fontWeight: "bold" },
//   grid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     padding: 10,
//     justifyContent: "space-around",
//   },
//   card: {
//     backgroundColor: "#FFF",
//     width: width * 0.43,
//     padding: 16,
//     borderRadius: 20,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: "#F1F5F9",
//   },
//   iconBox: {
//     width: 40,
//     height: 40,
//     borderRadius: 10,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   label: { color: "#64748B", fontSize: 13, fontWeight: "600" },
//   valueRow: { flexDirection: "row", alignItems: "baseline", marginVertical: 4 },
//   value: { fontSize: 22, fontWeight: "bold", color: "#1E1B4B" },
//   unit: { fontSize: 12, color: "#94A3B8", marginLeft: 4 },
//   trend: { fontSize: 11, fontWeight: "500" },
// });

import React, { useState, useEffect } from "react";
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
import { useAuth } from "../../contexts/AuthContext";

const { width } = Dimensions.get("window");

export default function BioInsights() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [showAIAlert, setShowAIAlert] = useState(false);

  const BASE_URL = "https://3466-102-89-84-114.ngrok-free.app";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // In a real scenario, this fetches the synced Fitbit data from your backend
      const response = await fetch(
        `${BASE_URL}/api/v1/fitbit/metrics/${user.id}`,
      );
      const data = await response.json();
      setMetrics(data);

      // AI Logic: If stressLevelScore > 80 from your biometric controller logic
      if (data.stressScore > 80) setShowAIAlert(true);
    } catch (e) {
      console.error("Sync Error", e);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for the Gifted Chart (Replaces Recharts)
  const ptData = [
    { value: 60, label: "12am" },
    { value: 55, label: "4am" },
    { value: 85, label: "8am" },
    { value: 92, label: "12pm" },
    { value: 75, label: "4pm" },
    { value: 110, label: "8pm" },
  ];

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
            Wednesday, Feb 18 · Health Dashboard
          </Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JS</Text>
        </View>
      </View>

      {/* AI SUGGESTION - Triggered by your backend stress logic */}
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
          <TouchableOpacity style={styles.aiButton}>
            <Text style={styles.aiButtonText}>Book Appointment</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}

      {/* Metric Grid */}
      <View style={styles.grid}>
        <MetricCard
          icon="heart"
          label="Heart Rate"
          value="72"
          sub="Resting: 58"
          color="#EF4444"
          glow="rgba(239, 68, 68, 0.2)"
        />
        <MetricCard
          icon="footprint"
          label="Steps"
          value="8,432"
          sub="Goal: 10k"
          color="#10B981"
          glow="rgba(16, 185, 129, 0.2)"
        />
        <MetricCard
          icon="fire"
          label="Calories"
          value="2,070"
          sub="Goal: 2.5k"
          color="#F59E0B"
          glow="rgba(245, 158, 11, 0.2)"
        />
        <MetricCard
          icon="moon-waning-crescent"
          label="Sleep"
          value="7.2h"
          sub="Quality: 85%"
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
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>
        <LineChart
          data={ptData}
          areaChart
          hideDataPoints
          thickness={3}
          color="#EF4444"
          startFillColor="rgba(239, 68, 68, 0.3)"
          endFillColor="rgba(239, 68, 68, 0.01)"
          initialSpacing={0}
          noOfSections={3}
          yAxisTextStyle={{ color: "#64748B", fontSize: 10 }}
          xAxisLabelTextStyle={{ color: "#64748B", fontSize: 10 }}
          rulesColor="#334155"
          rulesType="solid"
          yAxisSide="right"
          hideRules
        />
      </View>
    </ScrollView>
  );
}

const MetricCard = ({ icon, label, value, sub, color, glow }) => (
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  loader: { flex: 1, justifyContent: "center", backgroundColor: "#020617" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    paddingTop: 60,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#F8FAFC" },
  subtitle: { fontSize: 12, color: "#64748B", marginTop: 4 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
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
    backgroundColor: "#0F172A",
    width: width * 0.44,
    padding: 16,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  iconContainer: { padding: 8, borderRadius: 10, marginRight: 8 },
  label: { color: "#94A3B8", fontSize: 12, fontWeight: "500" },
  value: { fontSize: 22, fontWeight: "bold" },
  subtitleText: { color: "#475569", fontSize: 10, marginTop: 4 },
  chartCard: {
    backgroundColor: "#0F172A",
    margin: 20,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  chartTitle: { color: "#F8FAFC", fontSize: 16, fontWeight: "bold" },
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