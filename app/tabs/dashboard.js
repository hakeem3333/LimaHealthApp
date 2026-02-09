import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#ede9fe", "#e0f2fe"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, Alex 👋</Text>
          <Text style={styles.subtitle}>
            Here’s your wellness snapshot today
          </Text>
        </View>

        {/* Wellness Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.metricBox}>
            <Ionicons name="heart" size={28} color="#ef4444" />
            <Text style={styles.metricValue}>78 bpm</Text>
            <Text style={styles.metricLabel}>Heart Rate</Text>
          </View>
          <View style={styles.metricBox}>
            <Ionicons name="pulse" size={28} color="#f97316" />
            <Text style={styles.metricValue}>Medium</Text>
            <Text style={styles.metricLabel}>Stress Level</Text>
          </View>
          <View style={styles.metricBox}>
            <Ionicons name="bed" size={28} color="#3b82f6" />
            <Text style={styles.metricValue}>7h 20m</Text>
            <Text style={styles.metricLabel}>Sleep</Text>
          </View>
        </View>

        {/* Daily Score */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>Daily Wellness Score</Text>
          <Text style={styles.scoreValue}>82 / 100</Text>
          <View style={styles.scoreBarOuter}>
            <View style={styles.scoreBarInner} />
          </View>
          <Text style={styles.scoreComment}>
            You’re doing well today! Keep balanced 💪
          </Text>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/tabs/moodLog")}
          >
            <Ionicons name="happy" size={26} color="#22c55e" />
            <Text style={styles.actionText}>Log Mood</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/tabs/trends")}
          >
            <Ionicons name="stats-chart" size={26} color="#3b82f6" />
            <Text style={styles.actionText}>View Trends</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/tabs/resources")}
          >
            <Ionicons name="book" size={26} color="#f59e0b" />
            <Text style={styles.actionText}>Resources</Text>
          </TouchableOpacity>
        </View>

        {/* AI Wellness Tip Section */}
        <Text style={styles.sectionTitle}>AI Wellness Tip</Text>
        <View style={styles.tipCard}>
          <LinearGradient
            colors={["#eef2ff", "#e0f2fe"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tipGradient}
          >
            <Text style={styles.tipText}>
              “Your heart rate has been steady. Consider taking a short outdoor
              walk to stay relaxed.”
            </Text>

            <TouchableOpacity style={styles.tipButton}>
              <LinearGradient
                colors={["#60a5fa", "#818cf8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tipButtonGradient}
              >
                <Text style={styles.tipButtonText}>
                  Try a Breathing Exercise
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 25,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    color: "#475569",
    marginTop: 6,
  },
  summaryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  metricBox: {
    alignItems: "center",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 4,
  },
  metricLabel: {
    color: "#6b7280",
    fontSize: 12,
  },
  scoreCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#22c55e",
  },
  scoreBarOuter: {
    width: "100%",
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    marginVertical: 10,
  },
  scoreBarInner: {
    width: "82%",
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 10,
  },
  scoreComment: {
    color: "#475569",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#0f172a",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 6,
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  actionText: {
    fontSize: 13,
    marginTop: 6,
    color: "#111827",
  },
  tipCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tipGradient: {
    padding: 20,
  },
  tipText: {
    color: "#1e3a8a",
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 14,
    lineHeight: 22,
  },
  tipButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  tipButtonGradient: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  tipButtonText: {
    color: "#fff",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
