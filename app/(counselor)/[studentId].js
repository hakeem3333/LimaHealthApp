import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";

const SEVERITY_STYLE = {
  CRITICAL: { color: "#EF4444", label: "CRITICAL" },
  HIGH:     { color: "#F59E0B", label: "HIGH" },
  MODERATE: { color: "#818CF8", label: "MODERATE" },
  LOW:      { color: "#10B981", label: "LOW" },
};

export default function StudentDeepDive() {
  const { studentId } = useLocalSearchParams();
  const router = useRouter();
  const { memberLabel } = useAuth();

  const [student, setStudent]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [counselorNote, setCounselorNote] = useState("");

  const fetchStudent = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/counselor/students/${studentId}`);
      setStudent(res.data);
    } catch (err) {
      console.error("Student details fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useFocusEffect(useCallback(() => { fetchStudent(); }, [fetchStudent]));

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </SafeAreaView>
    );
  }

  if (!student) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>Could not load this {memberLabel.toLowerCase()}'s profile.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={20} color="#F8FAFC" />
          <Text style={styles.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const latestAlert = student.alertsAsStudent?.[0] ?? null;
  const severity = SEVERITY_STYLE[latestAlert?.severity] ?? null;

  const avgHeartRate = student.biometricLogs?.length
    ? Math.round(student.biometricLogs.reduce((s, b) => s + (b.heartRate || 0), 0) / student.biometricLogs.length)
    : null;
  const avgStress = student.biometricLogs?.length
    ? Math.round(student.biometricLogs.reduce((s, b) => s + (b.stressLevelScore || 0), 0) / student.biometricLogs.length)
    : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER: Back Button & Student Identity */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backCircle}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#F8FAFC" />
        </TouchableOpacity>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.firstName} {student.lastName}</Text>
          <Text style={styles.studentId}>{memberLabel} · {student.email}</Text>
        </View>
        {severity && (
          <View style={[styles.statusBadge, { backgroundColor: severity.color + "1A", borderColor: severity.color + "4D" }]}>
            <View style={[styles.criticalDot, { backgroundColor: severity.color }]} />
            <Text style={[styles.statusText, { color: severity.color }]}>{severity.label}</Text>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 1. BIOMETRIC SUMMARY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biometric Summary</Text>
          {student.biometricLogs?.length ? (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="heart-pulse" size={20} color="#EF4444" />
                <Text style={styles.statValue}>{avgHeartRate ?? "--"}</Text>
                <Text style={styles.statLabel}>avg bpm</Text>
              </View>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="lightning-bolt" size={20} color="#F59E0B" />
                <Text style={styles.statValue}>{avgStress ?? "--"}</Text>
                <Text style={styles.statLabel}>avg stress</Text>
              </View>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="#818CF8" />
                <Text style={styles.statValue}>{student.biometricLogs.length}</Text>
                <Text style={styles.statLabel}>readings</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.emptySection}>No biometric readings yet.</Text>
          )}

          {latestAlert && (
            <Text style={[styles.insightNote, { color: severity?.color ?? "#F59E0B" }]}>
              <MaterialCommunityIcons name="lightbulb-on" size={14} color={severity?.color ?? "#F59E0B"} />{" "}
              {latestAlert.message ?? latestAlert.alertType.replace(/_/g, " ")}
            </Text>
          )}
        </View>

        {/* 2. SHARED JOURNAL ACCESS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shared Reflections</Text>
            <MaterialCommunityIcons name="lock-open-variant-outline" size={18} color="#10B981" />
          </View>

          {student.moodLogs?.length ? (
            student.moodLogs.slice(0, 5).map((log) => (
              <View key={log.id} style={styles.journalCard}>
                <View style={styles.journalTop}>
                  <Text style={styles.journalMood}>{log.moodEmoji}</Text>
                  <Text style={styles.journalDate}>
                    {new Date(log.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
                {log.notes && <Text style={styles.journalText}>"{log.notes}"</Text>}
              </View>
            ))
          ) : (
            <Text style={styles.emptySection}>No shared reflections yet.</Text>
          )}
        </View>

        {/* 3. PRIVATE COUNSELOR NOTES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinical Observations</Text>
          <View style={styles.notesContainer}>
            <View style={styles.privateBadge}>
              <MaterialCommunityIcons name="eye-off" size={12} color="#94A3B8" />
              <Text style={styles.privateText}>PRIVATE: NOT VISIBLE TO {memberLabel.toUpperCase()}</Text>
            </View>
            <TextInput
              style={styles.notesInput}
              placeholder="Start typing session notes..."
              placeholderTextColor="#475569"
              multiline
              value={counselorNote}
              onChangeText={setCounselorNote}
            />
            <TouchableOpacity style={styles.saveBtn} disabled>
              <Text style={styles.saveBtnText}>Save Clinical Note (coming soon)</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617", paddingHorizontal: 20 },
  center: { justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#94A3B8", fontSize: 14, marginBottom: 16 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#1E293B", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  backBtnText: { color: "#F8FAFC", fontWeight: "600" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  backCircle: { backgroundColor: "#1E293B", padding: 8, borderRadius: 12 },
  studentInfo: { flex: 1, marginLeft: 15 },
  studentName: { color: "#F8FAFC", fontSize: 20, fontWeight: "bold" },
  studentId: { color: "#64748B", fontSize: 12 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  criticalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: { fontSize: 10, fontWeight: "900" },

  section: { marginBottom: 30 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  emptySection: { color: "#475569", fontSize: 13, marginTop: 4 },

  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: "#0F172A",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  statValue: { color: "#F8FAFC", fontSize: 18, fontWeight: "800", marginTop: 8 },
  statLabel: { color: "#64748B", fontSize: 11, marginTop: 2 },

  insightNote: {
    fontSize: 12,
    marginTop: 12,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    padding: 10,
    borderRadius: 10,
  },

  journalCard: {
    backgroundColor: "#0F172A",
    padding: 16,
    borderRadius: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#818CF8",
    marginBottom: 10,
  },
  journalTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  journalMood: { color: "#818CF8", fontSize: 12, fontWeight: "700" },
  journalDate: { color: "#64748B", fontSize: 11 },
  journalText: {
    color: "#F8FAFC",
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic",
  },

  notesContainer: {
    backgroundColor: "#0F172A",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  privateBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  privateText: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 6,
  },
  notesInput: {
    color: "#F8FAFC",
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: "top",
  },
  saveBtn: {
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
    opacity: 0.5,
  },
  saveBtnText: { color: "#818CF8", fontWeight: "bold" },
});
