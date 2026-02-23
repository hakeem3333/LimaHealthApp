// import React, { useState, useEffect } from "react";
// import {
//   Platform,
//   View,
//   StyleSheet,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
// } from "react-native";
// import * as WebBrowser from "expo-web-browser";
// import { MaterialCommunityIcons } from "@expo/vector-icons";
// import FitbitOnboardingModal from "../../components/FitbitOnboardingModal";
// import { useAuth } from "../../contexts/AuthContext";

// export default function Home() {
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const { user } = useAuth();

//   const BASE_URL = "https://766c-102-89-82-128.ngrok-free.app";

//   /**
//    * 1. PERSISTENT CHECK
//    * Runs on mount to see if the user has already linked Fitbit in the DB.
//    */
//   useEffect(() => {
//     const checkFitbitStatus = async () => {
//       if (!user?.id) return;

//       try {
//         console.log("Checking status for user:", user.id);
//         const response = await fetch(
//           `${BASE_URL}/api/v1/fitbit/status/${user.id}`,
//           {
//             method: "GET",
//             headers: {
//               Accept: "application/json",
//               "Content-Type": "application/json",
//               "ngrok-skip-browser-warning": "true",
//             },
//           },
//         );

//         // Read body once as text to prevent "stream already read" error
//         const rawText = await response.text();
//         const data = JSON.parse(rawText);

//         console.log("Status Check Result:", data);

//         // Hide modal if linked, show if not
//         setIsModalVisible(!data.isLinked);
//       } catch (error) {
//         console.error("Failed to check Fitbit status", error);
//         setIsModalVisible(true); // Fallback to showing modal
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkFitbitStatus();
//   }, [user?.id]);

//   /**
//    * 2. OAUTH FLOW
//    * Triggered when user clicks "Connect Fitbit" in the modal.
//    */
//   const handleFitbitConnect = async () => {
//     const redirectUri =
//       Platform.OS === "web"
//         ? "http://localhost:8081/home"
//         : "limahealth://home";

//     try {
//       const authUrl = `${BASE_URL}/api/v1/fitbit/auth?userId=${user?.id}`;

//       // Opens the Fitbit Login in a secure popup/browser
//       const result = await WebBrowser.openAuthSessionAsync(
//         authUrl,
//         redirectUri,
//       );

//       // If they finished or are on web, hide modal.
//       // The useEffect will handle the persistent state on the next refresh.
//       if (result.type === "success" || Platform.OS === "web") {
//         setIsModalVisible(false);
//       }
//     } catch (error) {
//       console.error("Fitbit Auth Error:", error);
//     }
//   };

//   if (isLoading) {
//     return (
//       <View style={[styles.container, { justifyContent: "center" }]}>
//         <ActivityIndicator size="large" color="#6B21A8" />
//       </View>
//     );
//   }

//   // --- UI Components ---
//   const StatCard = ({ title, value, unit, icon, color }) => (
//     <View style={styles.card}>
//       <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
//         <MaterialCommunityIcons name={icon} size={28} color={color} />
//       </View>
//       <View>
//         <Text style={styles.cardTitle}>{title}</Text>
//         <Text style={styles.cardValue}>
//           {value}
//           <Text style={styles.cardUnit}> {unit}</Text>
//         </Text>
//       </View>
//     </View>
//   );

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.welcomeText}>Welcome back,</Text>
//         <Text style={styles.nameText}>{user?.firstName || "Student"} 👋</Text>
//       </View>

//       <View style={styles.statsGrid}>
//         <StatCard
//           title="Heart Rate"
//           value="72"
//           unit="bpm"
//           icon="heart-pulse"
//           color="#EF4444"
//         />
//         <StatCard
//           title="Sleep"
//           value="7.5"
//           unit="hrs"
//           icon="moon-waning-crescent"
//           color="#8B5CF6"
//         />
//         <StatCard
//           title="Steps"
//           value="8,432"
//           unit="steps"
//           icon="walk"
//           color="#10B981"
//         />
//         <StatCard
//           title="Stress Level"
//           value="Low"
//           unit=""
//           icon="brain"
//           color="#3B82F6"
//         />
//       </View>

//       <TouchableOpacity style={styles.syncButton}>
//         <MaterialCommunityIcons name="cached" size={20} color="#6B21A8" />
//         <Text style={styles.syncButtonText}>Sync Fitbit Data</Text>
//       </TouchableOpacity>

//       <FitbitOnboardingModal
//         isVisible={isModalVisible}
//         onClose={() => setIsModalVisible(false)}
//         onConnect={handleFitbitConnect}
//       />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#FAF5FF" },
//   header: { padding: 24, paddingTop: 40 },
//   welcomeText: { fontSize: 16, color: "#6B7280", fontWeight: "500" },
//   nameText: { fontSize: 28, fontWeight: "bold", color: "#1F2937" },
//   statsGrid: {
//     paddingHorizontal: 20,
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },
//   card: {
//     backgroundColor: "#FFF",
//     width: "48%",
//     padding: 16,
//     borderRadius: 20,
//     marginBottom: 16,
//     shadowColor: "#6B21A8",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.05,
//     shadowRadius: 10,
//     elevation: 2,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   iconContainer: { padding: 10, borderRadius: 12, marginRight: 12 },
//   cardTitle: { fontSize: 12, color: "#6B7280", fontWeight: "600" },
//   cardValue: { fontSize: 18, fontWeight: "bold", color: "#111827" },
//   cardUnit: { fontSize: 12, color: "#9CA3AF", fontWeight: "400" },
//   syncButton: {
//     margin: 20,
//     padding: 16,
//     borderRadius: 15,
//     backgroundColor: "#F3E8FF",
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#E9D5FF",
//   },
//   syncButtonText: { marginLeft: 8, color: "#6B21A8", fontWeight: "700" },
// });

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-gifted-charts";

const { width } = Dimensions.get("window");

export default function BioInsightsScreen() {
  // Mock state for the AI condition
  const [isStressed, setIsStressed] = useState(true);
  const [lastSynced, setLastSynced] = useState("2 mins ago");

  const hrData = [
    { value: 65, label: "6am" },
    { value: 88, label: "9am" },
    { value: 72, label: "12pm" },
    { value: 95, label: "3pm" },
    { value: 110, label: "6pm" },
    { value: 68, label: "9pm" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. HEADER & SYNC STATUS */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hi, Student</Text>
          <View style={styles.syncRow}>
            <MaterialCommunityIcons name="cached" size={14} color="#10B981" />
            <Text style={styles.syncText}>Fitbit synced {lastSynced}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.profileCircle}>
          <MaterialCommunityIcons name="account" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* 2. AI RECOMMENDATION HERO (Conditional) */}
      {isStressed && (
        <TouchableOpacity activeOpacity={0.9}>
          <LinearGradient
            colors={["#6D28D9", "#4C1D95"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiHero}
          >
            <View style={styles.aiHeader}>
              <View style={styles.aiBadge}>
                <MaterialCommunityIcons
                  name="auto-fix"
                  size={12}
                  color="#DDD6FE"
                />
                <Text style={styles.aiBadgeText}>AI INSIGHT</Text>
              </View>
            </View>
            <Text style={styles.aiTitle}>High Stress Detected</Text>
            <Text style={styles.aiDesc}>
              Your heart rate was elevated during your study block. Want to try
              a 5-min breathing exercise or book a counselor?
            </Text>
            <View style={styles.aiActionRow}>
              <View style={styles.aiBtnPrimary}>
                <Text style={styles.aiBtnText}>Book Now</Text>
              </View>
              <Text style={styles.aiBtnSecondary}>Dismiss</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* 3. DAILY PROGRESS RINGS (Conceptual) */}
      <View style={styles.ringsContainer}>
        <View style={styles.ringCard}>
          <ProgressRing
            percentage={84}
            color="#10B981"
            icon="walk"
            label="Steps"
          />
          <ProgressRing
            percentage={60}
            color="#F59E0B"
            icon="fire"
            label="Kcal"
          />
          <ProgressRing
            percentage={90}
            color="#6366F1"
            icon="moon-waning-crescent"
            label="Sleep"
          />
        </View>
      </View>

      {/* 4. VISUAL VITALS (Heart Rate Chart) */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Heart Rate Trend</Text>
          <Text style={styles.chartSub}>72 avg bpm</Text>
        </View>
        <LineChart
          data={hrData}
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
  );
}

// Helper for Progress Rings
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
  aiHeader: { flexDirection: "row", marginBottom: 12 },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
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