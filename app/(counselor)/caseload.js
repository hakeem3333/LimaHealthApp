import React, { useState, useMemo, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { BASE } from "../../utils/orgTheme";

const SEVERITY_STYLE = {
  CRITICAL: { color: "#EF4444", bg: "rgba(239, 68, 68, 0.14)", rank: 0 },
  HIGH:     { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.14)", rank: 1 },
  MODERATE: { color: "#818CF8", bg: "rgba(129, 140, 248, 0.14)", rank: 2 },
  LOW:      { color: "#10B981", bg: "rgba(16, 185, 129, 0.14)", rank: 3 },
};

export default function Caseload() {
  const router = useRouter();
  const { theme, membersLabel, memberLabel } = useAuth();

  const [students, setStudents]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");

  const fetchCaseload = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await apiFetch("/counselor/students");
      setStudents(res.data || []);
    } catch (err) {
      console.error("Caseload fetch error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchCaseload(); }, []));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? students.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
      : students;

    return [...list].sort((a, b) => {
      const ra = a.latestAlert ? SEVERITY_STYLE[a.latestAlert.severity]?.rank ?? 4 : 4;
      const rb = b.latestAlert ? SEVERITY_STYLE[b.latestAlert.severity]?.rank ?? 4 : 4;
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name);
    });
  }, [students, search]);

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
        <Text style={styles.title}>My Caseload</Text>
        <Text style={styles.subtitle}>
          {students.length} {students.length === 1 ? memberLabel.toLowerCase() : membersLabel.toLowerCase()} assigned to you
        </Text>
      </View>

      <View style={styles.searchWrap}>
        <MaterialCommunityIcons name="magnify" size={18} color={BASE.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${membersLabel.toLowerCase()}...`}
          placeholderTextColor={BASE.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchCaseload(true)} tintColor={theme?.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-group-outline" size={48} color={BASE.border} />
            <Text style={styles.emptyTitle}>
              {students.length === 0 ? "No one assigned yet" : "No matches"}
            </Text>
            <Text style={styles.emptyText}>
              {students.length === 0
                ? `Your organisation admin hasn't assigned any ${membersLabel.toLowerCase()} to you yet.`
                : "Try a different name or email."}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const sev = item.latestAlert ? SEVERITY_STYLE[item.latestAlert.severity] : null;
          return (
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.card}
              onPress={() => router.push({ pathname: "/(counselor)/[studentId]", params: { studentId: item.id } })}
            >
              <View
                style={[
                  styles.avatar,
                  { borderColor: sev ? sev.color : (theme?.primary ?? BASE.success) + "55" },
                ]}
              >
                <Text style={[styles.avatarText, { color: theme?.primary ?? BASE.success }]}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.name}</Text>
                <View style={styles.cardMetaRow}>
                  <MaterialCommunityIcons
                    name={item.wearableConnected ? "watch" : "watch-off-outline"}
                    size={12}
                    color={item.wearableConnected ? BASE.success : BASE.textMuted}
                  />
                  <Text style={styles.cardMeta}>
                    {item.wearableConnected ? "Device linked" : "No device"}
                  </Text>
                </View>
              </View>

              {sev ? (
                <View style={[styles.badge, { backgroundColor: sev.bg }]}>
                  <View style={[styles.badgeDot, { backgroundColor: sev.color }]} />
                  <Text style={[styles.badgeText, { color: sev.color }]}>
                    {item.latestAlert.severity}
                  </Text>
                </View>
              ) : (
                <View style={[styles.badge, { backgroundColor: "rgba(16, 185, 129, 0.10)" }]}>
                  <MaterialCommunityIcons name="check-circle-outline" size={12} color={BASE.success} />
                  <Text style={[styles.badgeText, { color: BASE.success }]}>Steady</Text>
                </View>
              )}

              <MaterialCommunityIcons name="chevron-right" size={20} color={BASE.textMuted} />
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BASE.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: BASE.bg },

  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },
  title: { color: BASE.textPrimary, fontSize: 24, fontWeight: "800" },
  subtitle: { color: BASE.textSecondary, fontSize: 13, marginTop: 4 },

  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: BASE.surface, borderRadius: 14, borderWidth: 1, borderColor: BASE.border,
    marginHorizontal: 20, marginTop: 16, marginBottom: 8, paddingHorizontal: 14, height: 46,
  },
  searchInput: { flex: 1, color: BASE.textPrimary, fontSize: 14 },

  listContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 8 },

  card: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: BASE.surface, borderRadius: 18, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: BASE.border,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    justifyContent: "center", alignItems: "center",
    backgroundColor: BASE.surfaceAlt, borderWidth: 1.5,
  },
  avatarText: { fontSize: 17, fontWeight: "800" },

  cardInfo: { flex: 1 },
  cardName: { color: BASE.textPrimary, fontSize: 15, fontWeight: "700" },
  cardMetaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  cardMeta: { color: BASE.textMuted, fontSize: 11, fontWeight: "600" },

  badge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.3 },

  emptyState: { alignItems: "center", paddingTop: 60, paddingHorizontal: 40, gap: 8 },
  emptyTitle: { color: BASE.textPrimary, fontSize: 16, fontWeight: "700", marginTop: 8 },
  emptyText: { color: BASE.textMuted, fontSize: 13, textAlign: "center", lineHeight: 19 },
});
