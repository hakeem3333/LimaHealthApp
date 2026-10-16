import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { useThemedStyles } from "../../contexts/ThemeContext";

// Kept as its own literal scale, matching Caseload/Alerts — risk severity is
// a semantic domain independent of org branding, not a BASE token.
const SEVERITY_STYLE = {
  CRITICAL: { color: "#EF4444", label: "CRITICAL" },
  HIGH:     { color: "#F59E0B", label: "HIGH" },
  MODERATE: { color: "#818CF8", label: "MODERATE" },
  LOW:      { color: "#10B981", label: "LOW" },
};

export default function StudentDeepDive() {
  const { styles, colors: BASE } = useThemedStyles(createStyles);
  const { studentId } = useLocalSearchParams();
  const router = useRouter();
  const { memberLabel, theme } = useAuth();
  const accent = theme?.primary ?? BASE.success;

  const [student, setStudent]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [draftNote, setDraftNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [insights, setInsights]   = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

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

  const fetchInsights = useCallback(async () => {
    if (!studentId) return;
    setInsightsLoading(true);
    try {
      const res = await apiFetch(`/counselor/students/${studentId}/insights`);
      setInsights(res.data);
    } catch (err) {
      console.error("Insights fetch error:", err.message);
    } finally {
      setInsightsLoading(false);
    }
  }, [studentId]);

  useFocusEffect(useCallback(() => { fetchStudent(); fetchInsights(); }, [fetchStudent, fetchInsights]));

  const handleSaveNote = async () => {
    const content = draftNote.trim();
    if (!content) return;

    setSavingNote(true);
    try {
      const res = await apiFetch(`/counselor/students/${studentId}/notes`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      setStudent((prev) => ({ ...prev, notes: [res.data, ...(prev.notes || [])] }));
      setDraftNote("");
      Toast.show({ type: "success", text1: "Note saved" });
    } catch (err) {
      Toast.show({ type: "error", text1: "Could not save note", text2: err.message });
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={accent} />
      </SafeAreaView>
    );
  }

  if (!student) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>Could not load this {memberLabel.toLowerCase()}&apos;s profile.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={20} color={BASE.textPrimary} />
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <SafeAreaView style={styles.container}>
        {/* HEADER: Back Button & Student Identity */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backCircle}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={BASE.textPrimary} />
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

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.scheduleBtn, { flex: 1, backgroundColor: accent }]}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: "/(counselor)/schedule",
                params: { studentId, studentName: `${student.firstName} ${student.lastName}` },
              })
            }
          >
            <MaterialCommunityIcons name="calendar-plus" size={18} color="#FFF" />
            <Text style={styles.scheduleBtnText}>Schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.messageBtn, { borderColor: accent }]}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: "/(counselor)/chat",
                params: { studentId, studentName: `${student.firstName} ${student.lastName}` },
              })
            }
          >
            <MaterialCommunityIcons name="message-text-outline" size={18} color={accent} />
            <Text style={[styles.messageBtnText, { color: accent }]}>Message</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* WEEKLY INSIGHT */}
          <View style={styles.section}>
            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <View style={styles.insightIconWrap}>
                  <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color={BASE.info} />
                </View>
                <Text style={styles.sectionTitle}>Weekly Insight</Text>
              </View>

              {insightsLoading ? (
                <ActivityIndicator size="small" color={accent} style={{ marginTop: 10 }} />
              ) : (
                <>
                  <Text style={styles.insightSummary}>{insights?.summary}</Text>
                  {insights?.findings?.length > 1 &&
                    insights.findings.slice(1).map((f, i) => (
                      <View key={i} style={styles.insightRow}>
                        <View style={styles.insightBullet} />
                        <Text style={styles.insightFinding}>{f}</Text>
                      </View>
                    ))}
                </>
              )}
            </View>
          </View>

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
                  <MaterialCommunityIcons name="clock-outline" size={20} color={BASE.info} />
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
              <MaterialCommunityIcons name="lock-open-variant-outline" size={18} color={BASE.success} />
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
                  {log.notes && <Text style={styles.journalText}>&quot;{log.notes}&quot;</Text>}
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
                <MaterialCommunityIcons name="eye-off" size={12} color={BASE.textSecondary} />
                <Text style={styles.privateText}>PRIVATE: NOT VISIBLE TO {memberLabel.toUpperCase()}</Text>
              </View>
              <TextInput
                style={styles.notesInput}
                placeholder="Start typing session notes..."
                placeholderTextColor={BASE.textMuted}
                multiline
                value={draftNote}
                onChangeText={setDraftNote}
              />
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: accent }, (!draftNote.trim() || savingNote) && styles.saveBtnDisabled]}
                onPress={handleSaveNote}
                disabled={!draftNote.trim() || savingNote}
              >
                <Text style={styles.saveBtnText}>
                  {savingNote ? "Saving..." : "Save Clinical Note"}
                </Text>
              </TouchableOpacity>
            </View>

            {student.notes?.length > 0 && (
              <View style={{ marginTop: 14, gap: 10 }}>
                {student.notes.map((note) => (
                  <View key={note.id} style={[styles.noteHistoryCard, { borderLeftColor: accent }]}>
                    <Text style={styles.noteHistoryText}>{note.content}</Text>
                    <Text style={styles.noteHistoryDate}>
                      {new Date(note.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (BASE) => StyleSheet.create({
  container: { flex: 1, backgroundColor: BASE.bg, paddingHorizontal: 20 },
  center: { justifyContent: "center", alignItems: "center" },
  emptyText: { color: BASE.textSecondary, fontSize: 14, marginBottom: 16 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: BASE.border, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  backBtnText: { color: BASE.textPrimary, fontWeight: "600" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  backCircle: { backgroundColor: BASE.border, padding: 8, borderRadius: 12 },
  studentInfo: { flex: 1, marginLeft: 15 },
  studentName: { color: BASE.textPrimary, fontSize: 20, fontWeight: "bold" },
  studentId: { color: BASE.textSecondary, fontSize: 12 },
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

  actionRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  scheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
  },
  scheduleBtnText: { color: "#FFF", fontSize: 14, fontWeight: "800" },
  messageBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: BASE.surface,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  messageBtnText: { fontSize: 14, fontWeight: "800" },

  section: { marginBottom: 30 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: BASE.textSecondary,
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  emptySection: { color: BASE.textMuted, fontSize: 13, marginTop: 4 },

  insightCard: {
    backgroundColor: BASE.surface, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: BASE.border,
  },
  insightHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  insightIconWrap: {
    width: 30, height: 30, borderRadius: 10, backgroundColor: BASE.info + "24",
    justifyContent: "center", alignItems: "center",
  },
  insightSummary: { color: BASE.textPrimary, fontSize: 14, fontWeight: "700", marginTop: 10, lineHeight: 20 },
  insightRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 8 },
  insightBullet: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: BASE.textMuted, marginTop: 6 },
  insightFinding: { flex: 1, color: BASE.textSecondary, fontSize: 13, lineHeight: 19 },

  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: BASE.surface,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BASE.border,
  },
  statValue: { color: BASE.textPrimary, fontSize: 18, fontWeight: "800", marginTop: 8 },
  statLabel: { color: BASE.textSecondary, fontSize: 11, marginTop: 2 },

  insightNote: {
    fontSize: 12,
    marginTop: 12,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    padding: 10,
    borderRadius: 10,
  },

  journalCard: {
    backgroundColor: BASE.surface,
    padding: 16,
    borderRadius: 20,
    borderLeftWidth: 4,
    borderLeftColor: BASE.info,
    marginBottom: 10,
  },
  journalTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  journalMood: { color: BASE.info, fontSize: 12, fontWeight: "700" },
  journalDate: { color: BASE.textSecondary, fontSize: 11 },
  journalText: {
    color: BASE.textPrimary,
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic",
  },

  notesContainer: {
    backgroundColor: BASE.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: BASE.border,
  },
  privateBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  privateText: {
    color: BASE.textSecondary,
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 6,
  },
  notesInput: {
    color: BASE.textPrimary,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: "top",
  },
  saveBtn: {
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnDisabled: {
    backgroundColor: BASE.border,
    opacity: 0.6,
  },
  saveBtnText: { color: "#FFF", fontWeight: "bold" },

  noteHistoryCard: {
    backgroundColor: BASE.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BASE.border,
    borderLeftWidth: 4,
  },
  noteHistoryText: { color: BASE.textPrimary, fontSize: 14, lineHeight: 21 },
  noteHistoryDate: { color: BASE.textMuted, fontSize: 11, marginTop: 8, fontWeight: "600" },
});
