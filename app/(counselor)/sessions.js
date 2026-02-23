import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SessionManager() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: "1",
      student: "Amina K.",
      type: "Urgent Stress Support",
      time: "2:30 PM",
      date: "Feb 24",
    },
    {
      id: "2",
      student: "Liam W.",
      type: "Routine Check-in",
      time: "10:00 AM",
      date: "Feb 25",
    },
  ]);

  const handleAction = (id, action) => {
    Alert.alert(
      `${action} Request`,
      `Are you sure you want to ${action.toLowerCase()} this session?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action,
          onPress: () =>
            setPendingRequests((prev) => prev.filter((r) => r.id !== id)),
          style: action === "Reject" ? "destructive" : "default",
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Session Manager</Text>
          <Text style={styles.subtitle}>
            Manage your availability and intake
          </Text>
        </View>

        {/* 1. AVAILABILITY TOGGLE */}
        <View style={styles.availabilityCard}>
          <View style={styles.availInfo}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isAvailable ? "#10B981" : "#475569" },
              ]}
            />
            <View>
              <Text style={styles.availTitle}>Accepting New Bookings</Text>
              <Text style={styles.availSub}>
                {isAvailable
                  ? "Students see you as 'Available Today'"
                  : "Students see you as 'Away'"}
              </Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: "#1E293B", true: "#818CF8" }}
            thumbColor="#FFF"
            onValueChange={setIsAvailable}
            value={isAvailable}
          />
        </View>

        {/* 2. PENDING REQUESTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Pending Intake ({pendingRequests.length})
            </Text>
            <MaterialCommunityIcons
              name="clock-outline"
              size={20}
              color="#64748B"
            />
          </View>

          {pendingRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="check-all"
                size={40}
                color="#1E293B"
              />
              <Text style={styles.emptyText}>All caught up!</Text>
            </View>
          ) : (
            pendingRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestMain}>
                  <View style={styles.studentInitial}>
                    <Text style={styles.initialText}>{request.student[0]}</Text>
                  </View>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestStudent}>{request.student}</Text>
                    <Text style={styles.requestType}>{request.type}</Text>
                    <View style={styles.dateTimeRow}>
                      <MaterialCommunityIcons
                        name="calendar"
                        size={12}
                        color="#64748B"
                      />
                      <Text style={styles.dateTimeText}>
                        {request.date} • {request.time}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => handleAction(request.id, "Reject")}
                  >
                    <Text style={styles.rejectText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.acceptBtn]}
                    onPress={() => handleAction(request.id, "Confirm")}
                  >
                    <Text style={styles.acceptText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* 3. CALENDAR SHORTCUT (Visual Placeholder) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Full Schedule</Text>
          <TouchableOpacity style={styles.calendarHero}>
            <MaterialCommunityIcons
              name="calendar-month"
              size={32}
              color="#818CF8"
            />
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.calendarTitle}>Open Google Calendar</Text>
              <Text style={styles.calendarSub}>Sync your school sessions</Text>
            </View>
            <MaterialCommunityIcons
              name="open-in-new"
              size={20}
              color="#475569"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617", paddingHorizontal: 20 },
  header: { marginTop: 20, marginBottom: 25 },
  title: { color: "#F8FAFC", fontSize: 28, fontWeight: "800" },
  subtitle: { color: "#64748B", fontSize: 16, marginTop: 4 },

  availabilityCard: {
    backgroundColor: "#0F172A",
    padding: 20,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 30,
  },
  availInfo: { flexDirection: "row", alignItems: "center" },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 15 },
  availTitle: { color: "#F8FAFC", fontSize: 16, fontWeight: "bold" },
  availSub: { color: "#64748B", fontSize: 12, marginTop: 2 },

  section: { marginBottom: 30 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { color: "#F8FAFC", fontSize: 18, fontWeight: "700" },

  requestCard: {
    backgroundColor: "#0F172A",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 15,
  },
  requestMain: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  studentInitial: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  initialText: { color: "#818CF8", fontSize: 20, fontWeight: "bold" },
  requestInfo: { marginLeft: 15, flex: 1 },
  requestStudent: { color: "#F8FAFC", fontSize: 16, fontWeight: "bold" },
  requestType: { color: "#94A3B8", fontSize: 13, marginTop: 2 },
  dateTimeRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  dateTimeText: { color: "#64748B", fontSize: 11, marginLeft: 5 },

  actionRow: { flexDirection: "row", gap: 12 },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  acceptBtn: { backgroundColor: "#818CF8" },
  rejectText: { color: "#EF4444", fontWeight: "bold", fontSize: 14 },
  acceptText: { color: "#FFF", fontWeight: "bold", fontSize: 14 },

  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { color: "#475569", marginTop: 10, fontSize: 14 },

  calendarHero: {
    backgroundColor: "#0F172A",
    padding: 20,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderStyle: "dashed",
  },
  calendarTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "bold" },
  calendarSub: { color: "#64748B", fontSize: 12, marginTop: 2 },
});
