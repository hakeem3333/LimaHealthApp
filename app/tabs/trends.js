import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width - 40;

const data = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      data: [70, 75, 80, 78, 85, 88, 90],
      color: () => "#22c55e",
      strokeWidth: 2,
    },
    {
      data: [60, 55, 50, 58, 52, 48, 45],
      color: () => "#f97316",
      strokeWidth: 2,
    },
    {
      data: [6.5, 7.2, 7.5, 6.8, 8.0, 7.6, 8.2],
      color: () => "#3b82f6",
      strokeWidth: 2,
    },
  ],
  legend: ["Mood", "Stress", "Sleep"],
};

export default function Trends() {
  return (
    <LinearGradient colors={["#ede9fe", "#e0f2fe"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Wellness Trends</Text>
          <Text style={styles.subtitle}>
            Tracking your progress helps you understand your balance 🌿
          </Text>
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Overview</Text>
          <LineChart
            data={data}
            width={screenWidth}
            height={230}
            chartConfig={{
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: () => "#64748b",
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: "#fff",
              },
              propsForBackgroundLines: {
                stroke: "#e2e8f0",
              },
            }}
            style={{
              borderRadius: 16,
            }}
            bezier
          />
        </View>

        {/* Weekly Badge */}
        <LinearGradient
          colors={["#d9f99d", "#bbf7d0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.badgeCard}
        >
          <Ionicons name="trophy" size={36} color="#166534" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.badgeTitle}>
              You improved stress resilience
            </Text>
            <Text style={styles.badgeText}>by 12% this week 🎉</Text>
          </View>
        </LinearGradient>

        {/* Reflection Section */}
        <View style={styles.reflectionCard}>
          <Ionicons name="book-outline" size={28} color="#6366f1" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.reflectionTitle}>Reflect & Grow</Text>
            <Text style={styles.reflectionText}>
              Take a moment to write what helped you stay calm this week 💭
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.reflectButton}>
          <LinearGradient
            colors={["#818cf8", "#60a5fa"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.reflectGradient}
          >
            <Text style={styles.reflectText}>Start Journal Entry</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 80,
  },
  header: { marginBottom: 25 },
  title: { fontSize: 26, fontWeight: "700", color: "#0f172a" },
  subtitle: { color: "#475569", marginTop: 6 },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 30,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: "#0f172a",
  },
  badgeCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 18,
    marginBottom: 25,
  },
  badgeTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: "#166534",
  },
  badgeText: {
    color: "#15803d",
    marginTop: 4,
  },
  reflectionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef2ff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  reflectionTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: "#4338ca",
  },
  reflectionText: {
    color: "#475569",
    fontSize: 13,
    marginTop: 4,
  },
  reflectButton: {
    borderRadius: 14,
    overflow: "hidden",
    alignSelf: "center",
  },
  reflectGradient: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 14,
    alignItems: "center",
  },
  reflectText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
