import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Mock Data for the Counselor Dashboard
const PRIORITY_STUDENTS = [
  {
    id: "1",
    name: "Marcus J.",
    risk: "CRITICAL",
    score: 24,
    issue: "High HR + Low Sleep",
    trend: "down",
  },
  {
    id: "2",
    name: "Sarah L.",
    risk: "MONITOR",
    score: 48,
    issue: "Mood Dip (3 days)",
    trend: "down",
  },
  {
    id: "3",
    name: "David O.",
    risk: "STABLE",
    score: 82,
    issue: "Improving Trends",
    trend: "up",
  },
];

const RECENT_REFLECTIONS = [
  {
    id: "1",
    student: "Marcus J.",
    text: "Feeling overwhelmed with finals...",
    time: "10m ago",
  },
  {
    id: "2",
    student: "Elena R.",
    text: "The breathing exercises helped.",
    time: "1h ago",
  },
];

const TODAY_SESSIONS = [
  { id: "1", student: "Kevin T.", time: "09:30 AM", type: "Intake" },
  { id: "2", student: "Marcus J.", time: "11:00 AM", type: "Follow-up" },
];

export default function CounselorDashboard() {
  const renderRiskBadge = (risk) => {
    const colors = {
      CRITICAL: { bg: "#FECACA", text: "#991B1B", icon: "alert-octagon" },
      MONITOR: { bg: "#FEF3C7", text: "#92400E", icon: "alert-circle" },
      STABLE: { bg: "#D1FAE5", text: "#065F46", icon: "check-circle" },
    };
    const style = colors[risk];

    return (
      <View style={[styles.badge, { backgroundColor: style.bg }]}>
        <MaterialCommunityIcons
          name={style.icon}
          size={14}
          color={style.text}
        />
        <Text style={[styles.badgeText, { color: style.text }]}>{risk}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Clinical Overview</Text>
            <Text style={styles.dateText}>Monday, Feb 23, 2026</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={24}
              color="#94A3B8"
            />
          </TouchableOpacity>
        </View>

        {/* 1. RISK HEATMAP (Priority List) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Priority Watchlist</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.heatmapScroll}
          >
            {PRIORITY_STUDENTS.map((item) => (
              <TouchableOpacity key={item.id} style={styles.studentCard}>
                <View style={styles.cardTop}>
                  <Text style={styles.studentName}>{item.name}</Text>
                  {renderRiskBadge(item.risk)}
                </View>

                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreValue}>{item.score}</Text>
                  <Text style={styles.scoreLabel}>Wellness Index</Text>
                </View>

                <View style={styles.issueRow}>
                  <MaterialCommunityIcons
                    name={
                      item.trend === "down" ? "trending-down" : "trending-up"
                    }
                    size={16}
                    color={item.trend === "down" ? "#EF4444" : "#10B981"}
                  />
                  <Text style={styles.issueText}>{item.issue}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 2. TODAY'S SCHEDULE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Sessions</Text>
          <View style={styles.scheduleCard}>
            {TODAY_SESSIONS.map((session, index) => (
              <View
                key={session.id}
                style={[
                  styles.sessionRow,
                  index !== TODAY_SESSIONS.length - 1 && styles.borderBottom,
                ]}
              >
                <View style={styles.sessionTimeBox}>
                  <Text style={styles.sessionTime}>{session.time}</Text>
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionStudent}>{session.student}</Text>
                  <Text style={styles.sessionType}>{session.type}</Text>
                </View>
                <TouchableOpacity style={styles.actionBtn}>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color="#475569"
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* 3. ACTIVITY FEED */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Shared Reflections</Text>
          {RECENT_REFLECTIONS.map((feed) => (
            <View key={feed.id} style={styles.feedItem}>
              <View style={styles.feedHeader}>
                <Text style={styles.feedStudent}>{feed.student}</Text>
                <Text style={styles.feedTime}>{feed.time}</Text>
              </View>
              <Text style={styles.feedText} numberOfLines={2}>
                "{feed.text}"
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617", paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  welcomeText: { color: "#F8FAFC", fontSize: 24, fontWeight: "800" },
  dateText: { color: "#64748B", fontSize: 14, marginTop: 4 },
  profileBtn: { padding: 10, backgroundColor: "#0F172A", borderRadius: 12 },

  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  seeAll: { color: "#818CF8", fontSize: 14, fontWeight: "600" },

  heatmapScroll: { marginHorizontal: -20, paddingLeft: 20 },
  studentCard: {
    backgroundColor: "#0F172A",
    width: width * 0.65,
    borderRadius: 24,
    padding: 20,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  studentName: { color: "#F8FAFC", fontSize: 16, fontWeight: "bold" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontWeight: "bold", marginLeft: 4 },

  scoreContainer: { marginVertical: 15 },
  scoreValue: { color: "#F8FAFC", fontSize: 32, fontWeight: "800" },
  scoreLabel: { color: "#64748B", fontSize: 12 },

  issueRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  issueText: { color: "#94A3B8", fontSize: 12, marginLeft: 6 },

  scheduleCard: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  sessionRow: { flexDirection: "row", alignItems: "center", padding: 15 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: "#1E293B" },
  sessionTimeBox: {
    backgroundColor: "#1E293B",
    padding: 8,
    borderRadius: 10,
    width: 80,
    alignItems: "center",
  },
  sessionTime: { color: "#818CF8", fontSize: 12, fontWeight: "bold" },
  sessionInfo: { flex: 1, marginLeft: 15 },
  sessionStudent: { color: "#F8FAFC", fontSize: 15, fontWeight: "600" },
  sessionType: { color: "#64748B", fontSize: 12, marginTop: 2 },

  feedItem: {
    backgroundColor: "#0F172A",
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  feedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  feedStudent: { color: "#818CF8", fontSize: 14, fontWeight: "bold" },
  feedTime: { color: "#475569", fontSize: 11 },
  feedText: {
    color: "#94A3B8",
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 18,
  },
});
