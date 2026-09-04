import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, ActivityIndicator, RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { BASE } from "../../utils/orgTheme";

// Matches the SEVERITY_STYLE palette used on Caseload/Alerts — kept as its
// own literal scale rather than BASE tokens since risk severity is a
// semantic domain independent of org branding.
const SEVERITY_STYLE = {
  CRITICAL: { bg: "rgba(239, 68, 68, 0.14)",  text: "#EF4444", icon: "alert-octagon" },
  HIGH:     { bg: "rgba(245, 158, 11, 0.14)", text: "#F59E0B", icon: "alert" },
  MODERATE: { bg: "rgba(129, 140, 248, 0.14)",text: "#818CF8", icon: "alert-circle" },
  LOW:      { bg: "rgba(16, 185, 129, 0.14)", text: "#10B981", icon: "check-circle" },
};

export default function CounselorDashboard() {
  const router   = useRouter();
  const { user, theme, supportLabel, membersLabel } = useAuth();
  const accent = theme?.primary ?? BASE.success;

  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const fetchDashboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [res, conversations] = await Promise.all([
        apiFetch("/counselor/dashboard"),
        apiFetch("/messages"),
      ]);
      setData(res.data);
      setUnreadMessages((conversations.data || []).reduce((sum, c) => sum + c.unreadCount, 0));
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
        <ActivityIndicator size="large" color={accent} />
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
            style={[styles.statusPill, { backgroundColor: data?.isAvailable ? BASE.success : BASE.textMuted }]}
            onPress={() => router.push("/(counselor)/sessions")}
          >
            <View style={styles.dot} />
            <Text style={styles.statusText}>
              {data?.isAvailable ? "Available" : "Away"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* CASELOAD SUMMARY */}
        <TouchableOpacity
          style={styles.caseloadCard}
          activeOpacity={0.8}
          onPress={() => router.push("/(counselor)/caseload")}
        >
          <View style={[styles.caseloadIcon, { backgroundColor: accent + "1F" }]}>
            <MaterialCommunityIcons name="account-group" size={22} color={accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.caseloadCount}>{data?.caseloadCount ?? 0}</Text>
            <Text style={styles.caseloadLabel}>{membersLabel} in your caseload</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={BASE.textMuted} />
        </TouchableOpacity>

        {/* CASE NOTES SHORTCUT */}
        <TouchableOpacity
          style={styles.notesCard}
          activeOpacity={0.8}
          onPress={() => router.push("/(counselor)/notes")}
        >
          <View style={styles.notesIcon}>
            <MaterialCommunityIcons name="notebook-outline" size={20} color={BASE.success} />
          </View>
          <Text style={styles.notesLabel}>Case Notes</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color={BASE.textMuted} />
        </TouchableOpacity>

        {/* MESSAGES SHORTCUT */}
        <TouchableOpacity
          style={styles.notesCard}
          activeOpacity={0.8}
          onPress={() => router.push("/(counselor)/messages")}
        >
          <View style={styles.notesIcon}>
            <MaterialCommunityIcons name="message-text-outline" size={20} color={BASE.success} />
          </View>
          <Text style={styles.notesLabel}>Messages</Text>
          {unreadMessages > 0 && (
            <View style={styles.unreadDot}>
              <Text style={styles.unreadDotText}>{unreadMessages > 9 ? "9+" : unreadMessages}</Text>
            </View>
          )}
          <MaterialCommunityIcons name="chevron-right" size={22} color={BASE.textMuted} />
        </TouchableOpacity>

        {/* TODAY'S SESSIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today&apos;s Sessions</Text>
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
                  <Text style={[styles.timeText, { color: accent }]}>
                    {new Date(appt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionStudent}>{appt.student}</Text>
                  <Text style={styles.sessionReason}>{appt.reason || "Session"}</Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: appt.status === "CONFIRMED" ? BASE.success : BASE.warning }]} />
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
                    <Text style={[styles.avatarText, { color: accent }]}>{item.name.charAt(0)}</Text>
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
                <Text style={[styles.reflectionMood, { color: accent }]}>Mood: {r.mood}</Text>
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
  container:        { flex: 1, backgroundColor: BASE.bg },
  center:           { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: BASE.bg },
  header:           { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingTop: 10 },
  greeting:         { color: BASE.textSecondary, fontSize: 14 },
  name:             { color: BASE.textPrimary, fontSize: 24, fontWeight: "800" },
  statusPill:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  caseloadCard:     { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: BASE.surface, borderRadius: 18, padding: 16, marginHorizontal: 20, marginBottom: 24, borderWidth: 1, borderColor: BASE.border },
  caseloadIcon:     { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  caseloadCount:    { color: BASE.textPrimary, fontSize: 20, fontWeight: "800" },
  caseloadLabel:    { color: BASE.textSecondary, fontSize: 12, marginTop: 2, fontWeight: "600" },
  notesCard:        { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: BASE.surface, borderRadius: 18, padding: 14, marginHorizontal: 20, marginBottom: 24, borderWidth: 1, borderColor: BASE.border },
  notesIcon:        { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(12, 175, 135, 0.12)", justifyContent: "center", alignItems: "center" },
  notesLabel:       { flex: 1, color: BASE.textPrimary, fontSize: 14, fontWeight: "700" },
  unreadDot:        { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: BASE.error, alignItems: "center", justifyContent: "center", paddingHorizontal: 5, marginRight: 8 },
  unreadDotText:    { color: "#FFF", fontSize: 11, fontWeight: "800" },
  dot:              { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFF", marginRight: 6 },
  statusText:       { color: "#FFF", fontSize: 13, fontWeight: "700" },
  section:          { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle:     { color: BASE.textPrimary, fontSize: 18, fontWeight: "700", marginBottom: 12 },
  emptyText:        { color: BASE.textMuted, fontSize: 14 },
  sessionCard:      { flexDirection: "row", alignItems: "center", backgroundColor: BASE.surface, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: BASE.border },
  timeBlock:        { backgroundColor: BASE.border, borderRadius: 10, padding: 10, marginRight: 14, minWidth: 70, alignItems: "center" },
  timeText:         { fontSize: 13, fontWeight: "700" },
  sessionInfo:      { flex: 1 },
  sessionStudent:   { color: BASE.textPrimary, fontSize: 15, fontWeight: "700" },
  sessionReason:    { color: BASE.textSecondary, fontSize: 13, marginTop: 2 },
  statusDot:        { width: 10, height: 10, borderRadius: 5 },
  studentCard:      { flexDirection: "row", alignItems: "center", backgroundColor: BASE.surface, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: BASE.border },
  studentAvatar:    { width: 44, height: 44, borderRadius: 22, backgroundColor: BASE.border, justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText:       { fontSize: 18, fontWeight: "700" },
  studentInfo:      { flex: 1 },
  studentName:      { color: BASE.textPrimary, fontSize: 15, fontWeight: "700" },
  studentIssue:     { color: BASE.textSecondary, fontSize: 13, marginTop: 2 },
  badge:            { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  badgeText:        { fontSize: 11, fontWeight: "700" },
  reflectionCard:   { backgroundColor: BASE.surface, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: BASE.border },
  reflectionStudent:{ color: BASE.textPrimary, fontSize: 15, fontWeight: "700" },
  reflectionMood:   { fontSize: 13, marginTop: 4 },
  reflectionNote:   { color: BASE.textSecondary, fontSize: 13, marginTop: 4 },
  reflectionTime:   { color: BASE.textMuted, fontSize: 12, marginTop: 6 },
});
