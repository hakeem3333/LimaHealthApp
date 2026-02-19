import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SectionList,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Mock Data matching your alert.controller.ts logic
const ALERT_DATA = [
  {
    title: "Active Alerts",
    data: [
      {
        id: "1",
        type: "CRITICAL",
        title: "High Heart Rate Detected",
        body: "Your HR was 115bpm during sleep. Please check in.",
        time: "10m ago",
        icon: "alert-octagon",
        color: "#EF4444",
      },
      {
        id: "2",
        type: "REMINDER",
        title: "Appointment Reminder",
        body: "Session with Dr. Sarah starts in 1 hour.",
        time: "1h ago",
        icon: "clock-outline",
        color: "#3B82F6",
      },
    ],
  },
  {
    title: "Resolved Feed",
    data: [
      {
        id: "3",
        type: "RESOLVED",
        title: "Sleep Quality Dip",
        body: "AI suggested earlier bedtime. Handled.",
        time: "Yesterday",
        icon: "check-circle-outline",
        color: "#10B981",
      },
      {
        id: "4",
        type: "RESOLVED",
        title: "Mood Log Missing",
        body: "Daily reflection completed.",
        time: "2 days ago",
        icon: "check-circle-outline",
        color: "#10B981",
      },
    ],
  },
];

export default function AlertsScreen() {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Alert Center</Text>
        <TouchableOpacity>
          <Text style={styles.markRead}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <SectionList
        sections={ALERT_DATA}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.alertCard,
              item.type === "CRITICAL" && styles.criticalBorder,
            ]}
          >
            <View
              style={[styles.iconBox, { backgroundColor: item.color + "15" }]}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={22}
                color={item.color}
              />
            </View>
            <View style={styles.content}>
              <View style={styles.contentHeader}>
                <Text style={styles.alertTitle}>{item.title}</Text>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
              <Text style={styles.alertBody}>{item.body}</Text>

              {item.type === "CRITICAL" && (
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>Take Action</Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={14}
                    color="#FFF"
                  />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listPadding}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  header: {
    marginTop: 60,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  title: { color: "#F8FAFC", fontSize: 28, fontWeight: "800" },
  markRead: {
    color: "#818CF8",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 5,
  },

  sectionHeader: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 25,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  listPadding: { paddingBottom: 40 },

  alertCard: {
    backgroundColor: "#0F172A",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  criticalBorder: { borderColor: "#EF444450", backgroundColor: "#110a0a" },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  content: { flex: 1 },
  contentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  alertTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "700" },
  timeText: { color: "#475569", fontSize: 11 },
  alertBody: { color: "#94A3B8", fontSize: 13, lineHeight: 18 },

  actionBtn: {
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
  },
  actionBtnText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "bold",
    marginRight: 4,
  },
});
