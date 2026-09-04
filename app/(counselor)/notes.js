import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { BASE } from "../../utils/orgTheme";

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function CounselorNotes() {
  const router = useRouter();
  const { theme, memberLabel, membersLabel } = useAuth();

  const [notes, setNotes]           = useState([]);
  const [students, setStudents]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [composerOpen, setComposerOpen] = useState(false);
  const [pickedStudent, setPickedStudent] = useState(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [notesRes, studentsRes] = await Promise.all([
        apiFetch("/counselor/notes"),
        apiFetch("/counselor/students"),
      ]);
      setNotes(notesRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (err) {
      console.error("Notes fetch error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchAll(); }, []));

  const openComposer = () => {
    setPickedStudent(students[0] ?? null);
    setDraft("");
    setComposerOpen(true);
  };

  const saveNote = async () => {
    const content = draft.trim();
    if (!content || !pickedStudent) return;

    setSaving(true);
    try {
      await apiFetch(`/counselor/students/${pickedStudent.id}/notes`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      Toast.show({ type: "success", text1: "Note saved" });
      setComposerOpen(false);
      await fetchAll();
    } catch (err) {
      Toast.show({ type: "error", text1: "Could not save note", text2: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme?.primary ?? BASE.success} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Case Notes</Text>
          <Text style={styles.subtitle}>Recent notes across your caseload</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme?.primary ?? BASE.success }]}
          onPress={openComposer}
          disabled={students.length === 0}
        >
          <MaterialCommunityIcons name="plus" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchAll(true)} tintColor={theme?.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="notebook-outline" size={48} color={BASE.border} />
            <Text style={styles.emptyTitle}>No notes yet</Text>
            <Text style={styles.emptyText}>
              Notes you write for any {memberLabel.toLowerCase()} will show up here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.card}
            onPress={() => router.push({ pathname: "/(counselor)/[studentId]", params: { studentId: item.studentId } })}
          >
            <View style={styles.cardTop}>
              <View style={styles.studentRow}>
                <View style={[styles.avatar, { borderColor: (theme?.primary ?? BASE.success) + "55" }]}>
                  <Text style={[styles.avatarText, { color: theme?.primary ?? BASE.success }]}>
                    {item.studentName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.studentName}>{item.studentName}</Text>
              </View>
              <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
            </View>
            <Text style={styles.content} numberOfLines={4}>{item.content}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={composerOpen} transparent animationType="slide" onRequestClose={() => setComposerOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalWrap}
        >
          <View style={styles.modalBackdrop} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>New Note</Text>
              <TouchableOpacity onPress={() => setComposerOpen(false)}>
                <MaterialCommunityIcons name="close" size={22} color={BASE.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>{memberLabel}</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={students}
              keyExtractor={(s) => s.id}
              contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
              renderItem={({ item }) => {
                const active = pickedStudent?.id === item.id;
                return (
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      active && { backgroundColor: (theme?.primary ?? BASE.success) + "22", borderColor: theme?.primary ?? BASE.success },
                    ]}
                    onPress={() => setPickedStudent(item)}
                  >
                    <Text style={[styles.chipText, active && { color: theme?.primary ?? BASE.success }]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Note</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Start typing..."
              placeholderTextColor={BASE.textMuted}
              multiline
              value={draft}
              onChangeText={setDraft}
            />

            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: theme?.primary ?? BASE.success },
                (!draft.trim() || saving) && styles.saveBtnDisabled,
              ]}
              onPress={saveNote}
              disabled={!draft.trim() || saving}
            >
              {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveBtnText}>Save Note</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BASE.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: BASE.bg },

  header: {
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  title: { color: BASE.textPrimary, fontSize: 24, fontWeight: "800" },
  subtitle: { color: BASE.textSecondary, fontSize: 13, marginTop: 4 },
  addBtn: { width: 46, height: 46, borderRadius: 16, justifyContent: "center", alignItems: "center" },

  listContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },

  card: {
    backgroundColor: BASE.surface, borderRadius: 18, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: BASE.border,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  studentRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center",
    backgroundColor: BASE.surfaceAlt, borderWidth: 1.5,
  },
  avatarText: { fontSize: 13, fontWeight: "800" },
  studentName: { color: BASE.textPrimary, fontSize: 14, fontWeight: "700" },
  time: { color: BASE.textMuted, fontSize: 11 },
  content: { color: BASE.textSecondary, fontSize: 13, lineHeight: 19 },

  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 40, gap: 8 },
  emptyTitle: { color: BASE.textPrimary, fontSize: 16, fontWeight: "700", marginTop: 8 },
  emptyText: { color: BASE.textMuted, fontSize: 13, textAlign: "center", lineHeight: 19 },

  modalWrap: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    backgroundColor: BASE.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 32, borderWidth: 1, borderColor: BASE.border,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: BASE.border, alignSelf: "center", marginBottom: 16 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sheetTitle: { color: BASE.textPrimary, fontSize: 18, fontWeight: "800" },

  fieldLabel: { color: BASE.textMuted, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12,
    borderWidth: 1, borderColor: BASE.border, backgroundColor: BASE.surfaceAlt,
  },
  chipText: { color: BASE.textSecondary, fontSize: 13, fontWeight: "700" },

  textArea: {
    backgroundColor: BASE.surfaceAlt, borderRadius: 14, borderWidth: 1, borderColor: BASE.border,
    padding: 14, color: BASE.textPrimary, fontSize: 14, minHeight: 100, textAlignVertical: "top",
  },

  saveBtn: { marginTop: 18, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: "#FFF", fontSize: 14, fontWeight: "800" },
});
