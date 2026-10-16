import React, { useState, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, SectionList,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { useThemedStyles } from "../../contexts/ThemeContext";

const SEVERITY_STYLE = {
  CRITICAL: { color: "#EF4444", bg: "rgba(239, 68, 68, 0.14)", icon: "alert-octagon", rank: 0 },
  HIGH:     { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.14)", icon: "alert",         rank: 1 },
  MODERATE: { color: "#818CF8", bg: "rgba(129, 140, 248, 0.14)", icon: "information",  rank: 2 },
};

export default function CounselorAlerts() {
  const { styles, colors: BASE } = useThemedStyles(createStyles);
  const router = useRouter();
  const { theme, memberLabel } = useAuth();

  const [alerts, setAlerts]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);

  const fetchAlerts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await apiFetch("/alerts");
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Alerts fetch error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchAlerts(); }, []));

  const resolve = async (id) => {
    setResolvingId(id);
    try {
      await apiFetch(`/alerts/${id}/resolve`, { method: "PATCH" });
      await fetchAlerts();
    } catch (err) {
      console.error("Resolve alert error:", err.message);
    } finally {
      setResolvingId(null);
    }
  };

  const sections = useMemo(() => {
    const active = [...alerts]
      .filter((a) => !a.isResolved)
      .sort((a, b) => (SEVERITY_STYLE[a.severity]?.rank ?? 3) - (SEVERITY_STYLE[b.severity]?.rank ?? 3));
    const resolved = alerts
      .filter((a) => a.isResolved)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const result = [];
    if (active.length)   result.push({ title: "Needs Attention", data: active });
    if (resolved.length) result.push({ title: "Resolved", data: resolved });
    return result;
  }, [alerts]);

  const activeCount = alerts.filter((a) => !a.isResolved).length;

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
          <Text style={styles.title}>Risk Alerts</Text>
          <Text style={styles.subtitle}>
            {activeCount === 0
              ? "Nothing needs attention right now"
              : `${activeCount} ${activeCount === 1 ? "alert needs" : "alerts need"} your attention`}
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => fetchAlerts(true)}>
          <MaterialCommunityIcons name="refresh" size={18} color={BASE.textSecondary} />
        </TouchableOpacity>
      </View>

      {sections.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="shield-check-outline" size={52} color={BASE.muted} />
          <Text style={styles.emptyTitle}>All clear</Text>
          <Text style={styles.emptyText}>
            No risk alerts on your caseload right now.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchAlerts(true)} tintColor={theme?.primary} />
          }
          renderSectionHeader={({ section: { title, data } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: title === "Resolved" ? BASE.success + "18" : BASE.error + "18" },
                ]}
              >
                <Text style={[styles.countText, { color: title === "Resolved" ? BASE.success : BASE.error }]}>
                  {data.length}
                </Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => {
            const sev = SEVERITY_STYLE[item.severity] ?? SEVERITY_STYLE.MODERATE;
            const studentName = item.student ? `${item.student.firstName} ${item.student.lastName}` : memberLabel;
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.card, { borderLeftColor: item.isResolved ? BASE.border : sev.color }]}
                onPress={() =>
                  item.student &&
                  router.push({ pathname: "/(counselor)/[studentId]", params: { studentId: item.student.id } })
                }
              >
                <View style={[styles.iconWrap, { backgroundColor: item.isResolved ? BASE.surfaceAlt : sev.bg }]}>
                  <MaterialCommunityIcons
                    name={item.isResolved ? "check-circle" : sev.icon}
                    size={20}
                    color={item.isResolved ? BASE.success : sev.color}
                  />
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardName} numberOfLines={1}>{studentName}</Text>
                    <Text style={styles.cardTime}>
                      {new Date(item.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </Text>
                  </View>
                  <Text style={styles.cardMessage} numberOfLines={2}>{item.message}</Text>

                  {!item.isResolved && (
                    <TouchableOpacity
                      style={[styles.resolveBtn, { backgroundColor: sev.color }]}
                      onPress={() => resolve(item.id)}
                      disabled={resolvingId === item.id}
                    >
                      {resolvingId === item.id ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <>
                          <MaterialCommunityIcons name="check" size={13} color="#FFF" />
                          <Text style={styles.resolveBtnText}>Mark Resolved</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (BASE) => StyleSheet.create({
  container: { flex: 1, backgroundColor: BASE.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: BASE.bg },

  header: {
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4,
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
  },
  title: { color: BASE.textPrimary, fontSize: 24, fontWeight: "800" },
  subtitle: { color: BASE.textSecondary, fontSize: 13, marginTop: 4, maxWidth: 260 },
  refreshBtn: {
    width: 40, height: 40, borderRadius: 14, backgroundColor: BASE.surface,
    justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: BASE.border,
  },

  listContent: { paddingHorizontal: 20, paddingBottom: 40 },

  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 20, marginBottom: 12 },
  sectionTitle: { color: BASE.textSecondary, fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
  countBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  countText: { fontSize: 11, fontWeight: "800" },

  card: {
    flexDirection: "row", backgroundColor: BASE.surface, borderRadius: 18, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: BASE.border, borderLeftWidth: 3,
  },
  iconWrap: { width: 42, height: 42, borderRadius: 14, justifyContent: "center", alignItems: "center", marginRight: 12 },
  cardBody: { flex: 1 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cardName: { color: BASE.textPrimary, fontSize: 14, fontWeight: "700", flex: 1, marginRight: 8 },
  cardTime: { color: BASE.textMuted, fontSize: 11 },
  cardMessage: { color: BASE.textSecondary, fontSize: 12, lineHeight: 18 },

  resolveBtn: {
    flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start",
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginTop: 10,
  },
  resolveBtnText: { color: "#FFF", fontSize: 11, fontWeight: "700" },

  empty: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  emptyTitle: { color: BASE.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 16 },
  emptyText: { color: BASE.textMuted, fontSize: 14, marginTop: 6, textAlign: "center" },
});
