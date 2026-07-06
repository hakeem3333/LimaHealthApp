import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Dimensions, ActivityIndicator, RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";

const { width } = Dimensions.get("window");

const SEVERITY_STYLE = {
  CRITICAL: { bg: "#FECACA", text: "#991B1B", icon: "alert-octagon" },
  HIGH:     { bg: "#FED7AA", text: "#9A3412", icon: "alert" },
  MODERATE: { bg: "#FEF3C7", text: "#92400E", icon: "alert-circle" },
  LOW:      { bg: "#D1FAE5", text: "#065F46", icon: "check-circle" },
};

export default function CounselorDashboard() {
  const router   = useRouter();
  const { user, supportLabel, membersLabel } = useAuth();

  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await apiFetch("/counselor/dashboard");
      setData(res.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchDashboard(); }, []));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6D28D9" />
      </View>
    );
  }

  const renderRiskBadge = (severity) => {
    const s = SEVERITY_STYLE[severity] || SEVERITY_STYLE.LOW;
    return (
      <View style={[styles.badge, { backgroundColor: s.bg }]}>
        <MaterialCommunityIcons name={s.icon} size={14} color={s.text} />
        <Text style={[styles.badgeText, { color: s.text }]}>{severity}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchDashboard(true)} />}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>{user?.firstName || supportLabel}</Text>
          </View>
          <TouchableOpacity
            style={[styles.statusPill, { backgroundColor: data?.isAvailable ? "#10B981" : "#6B7280" }]}
            onPress={() => router.push("/(counselor)/sessions")}
          >
            <View style={styles.dot} />
            <Text style={styles.statusText}>
              {data?.isAvailable ? "Available" : "Away"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* TODAY'S SESSIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Sessions</Text>
          {data?.todayAppointments?.length === 0 ? (
            <Text style={styles.emptyText}>No sessions scheduled today.</Text>
          ) : (
            data?.todayAppointments?.map((appt) => (
              <TouchableOpacity
                key={appt.id}
                style={styles.sessionCard}
                onPress={() => router.push({ pathname: "/(counselor)/[studentId]", params: { studentId: appt.studentId } })}
              >
                <View style={styles.timeBlock}>
                  <Text style={styles.timeText}>
                    {new Date(appt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionStudent}>{appt.student}</Text>
                  <Text style={styles.sessionReason}>{appt.reason || "Session"}</Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: appt.status === "CONFIRMED" ? "#10B981" : "#F59E0B" }]} />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* PRIORITY STUDENTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority {membersLabel}</Text>
          {data?.priorityStudents?.length === 0 ? (
            <Text style={styles.emptyText}>No unresolved alerts.</Text>
          ) : (
            <FlatList
              data={data?.priorityStudents}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.studentCard}
                  onPress={() => router.push({ pathname: "/(counselor)/[studentId]", params: { studentId: item.id } })}
                >
                  <View style={styles.studentAvatar}>
                    <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <Text style={styles.studentIssue}>
                      {item.alertType.replace(/_/g, " ")}
                    </Text>
                  </View>
                  {renderRiskBadge(item.severity)}
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* RECENT REFLECTIONS */}
        {data?.recentReflections?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Reflections</Text>
            {data.recentReflections.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={styles.reflectionCard}
                onPress={() => router.push({ pathname: "/(counselor)/[studentId]", params: { studentId: r.studentId } })}
              >
                <Text style={styles.reflectionStudent}>{r.student}</Text>
                <Text style={styles.reflectionMood}>Mood: {r.mood}</Text>
                {r.notes && <Text style={styles.reflectionNote}>{r.notes}</Text>}
                <Text style={styles.reflectionTime}>
                  {new Date(r.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: "#020617" },
  center:           { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#020617" },
  header:           { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingTop: 10 },
  greeting:         { color: "#64748B", fontSize: 14 },
  name:             { color: "#F8FAFC", fontSize: 24, fontWeight: "800" },
  statusPill:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  dot:              { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFF", marginRight: 6 },
  statusText:       { color: "#FFF", fontSize: 13, fontWeight: "700" },
  section:          { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle:     { color: "#F8FAFC", fontSize: 18, fontWeight: "700", marginBottom: 12 },
  emptyText:        { color: "#475569", fontSize: 14 },
  sessionCard:      { flexDirection: "row", alignItems: "center", backgroundColor: "#0F172A", borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#1E293B" },
  timeBlock:        { backgroundColor: "#1E293B", borderRadius: 10, padding: 10, marginRight: 14, minWidth: 70, alignItems: "center" },
  timeText:         { color: "#8B5CF6", fontSize: 13, fontWeight: "700" },
  sessionInfo:      { flex: 1 },
  sessionStudent:   { color: "#F8FAFC", fontSize: 15, fontWeight: "700" },
  sessionReason:    { color: "#64748B", fontSize: 13, marginTop: 2 },
  statusDot:        { width: 10, height: 10, borderRadius: 5 },
  studentCard:      { flexDirection: "row", alignItems: "center", backgroundColor: "#0F172A", borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#1E293B" },
  studentAvatar:    { width: 44, height: 44, borderRadius: 22, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText:       { color: "#8B5CF6", fontSize: 18, fontWeight: "700" },
  studentInfo:      { flex: 1 },
  studentName:      { color: "#F8FAFC", fontSize: 15, fontWeight: "700" },
  studentIssue:     { color: "#64748B", fontSize: 13, marginTop: 2 },
  badge:            { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  badgeText:        { fontSize: 11, fontWeight: "700" },
  reflectionCard:   { backgroundColor: "#0F172A", borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#1E293B" },
  reflectionStudent:{ color: "#F8FAFC", fontSize: 15, fontWeight: "700" },
  reflectionMood:   { color: "#8B5CF6", fontSize: 13, marginTop: 4 },
  reflectionNote:   { color: "#94A3B8", fontSize: 13, marginTop: 4 },
  reflectionTime:   { color: "#475569", fontSize: 12, marginTop: 6 },
});
