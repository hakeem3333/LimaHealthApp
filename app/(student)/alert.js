import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, SectionList,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../api/client";
import { BASE } from "../../utils/orgTheme";

const SEVERITY = {
  CRITICAL: { color: "#EF4444", bg: "#EF444415", icon: "alert-octagon", border: "#EF444440" },
  HIGH:     { color: "#F59E0B", bg: "#F59E0B15", icon: "alert",          border: "#F59E0B40" },
  MODERATE: { color: "#818CF8", bg: "#818CF815", icon: "information",    border: "#818CF840" },
  REMINDER: { color: "#3B82F6", bg: "#3B82F615", icon: "clock-outline",  border: "#3B82F640" },
  RESOLVED: { color: "#10B981", bg: "#10B98115", icon: "check-circle",   border: "#10B98140" },
};

export default function AlertsScreen() {
  const { user, theme } = useAuth();
  const [sections,  setSections]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [resolving, setResolving] = useState(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/alerts?userId=${user?.id}`);
      const all  = Array.isArray(data) ? data : data?.data ?? [];
      const active   = all.filter((a) => a.status !== "RESOLVED");
      const resolved = all.filter((a) => a.status === "RESOLVED");
      const result = [];
      if (active.length)   result.push({ title: "Active", data: active });
      if (resolved.length) result.push({ title: "Resolved", data: resolved });
      setSections(result);
    } catch {}
    finally { setLoading(false); }
  };

  const resolveAlert = async (id) => {
    setResolving(id);
    try {
      await apiFetch(`/alerts/${id}/resolve`, { method: "PATCH" });
      await fetchAlerts();
    } catch {}
    finally { setResolving(null); }
  };

  useEffect(() => { if (user?.id) fetchAlerts(); }, [user?.id]);

  const AlertCard = ({ item }) => {
    const s = SEVERITY[item.severity || item.type] || SEVERITY.REMINDER;
    const isCritical = item.severity === "CRITICAL" || item.type === "CRITICAL";
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.alertCard, { borderLeftColor: s.color, backgroundColor: isCritical ? "#110808" : BASE.surface }]}
      >
        <View style={[styles.alertIcon, { backgroundColor: s.bg }]}>
          <MaterialCommunityIcons name={s.icon} size={20} color={s.color} />
        </View>
        <View style={styles.alertBody}>
          <View style={styles.alertTop}>
            <Text style={styles.alertTitle} numberOfLines={1}>{item.title || item.message}</Text>
            <Text style={styles.alertTime}>
              {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
            </Text>
          </View>
          {item.body || item.detail ? (
            <Text style={styles.alertDesc} numberOfLines={2}>{item.body || item.detail}</Text>
          ) : null}
          {isCritical && item.status !== "RESOLVED" && (
            <TouchableOpacity
              style={[styles.resolveBtn, { backgroundColor: s.color }]}
              onPress={() => resolveAlert(item.id)}
              disabled={resolving === item.id}
            >
              {resolving === item.id
                ? <ActivityIndicator size="small" color="#FFF" />
                : <>
                    <Text style={styles.resolveBtnText}>Mark Resolved</Text>
                    <MaterialCommunityIcons name="check" size={13} color="#FFF" />
                  </>
              }
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Alert Centre</Text>
          <Text style={styles.sub}>Your wellness notifications</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchAlerts}>
          <MaterialCommunityIcons name="refresh" size={18} color={BASE.textSecondary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
      ) : sections.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="bell-check-outline" size={48} color={BASE.muted} />
          <Text style={styles.emptyTitle}>All clear</Text>
          <Text style={styles.emptyText}>No alerts to show right now.</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAlerts} tintColor={theme.primary} />}
          renderSectionHeader={({ section: { title, data } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
              <View style={[styles.countBadge, { backgroundColor: title === "Active" ? BASE.error + "18" : BASE.success + "18" }]}>
                <Text style={[styles.countText, { color: title === "Active" ? BASE.error : BASE.success }]}>{data.length}</Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => <AlertCard item={item} />}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BASE.bg },
  header:    { marginTop: 60, paddingHorizontal: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  title:     { color: BASE.textPrimary, fontSize: 28, fontWeight: "800" },
  sub:       { color: BASE.textMuted, fontSize: 14, marginTop: 3 },
  refreshBtn:{ width: 40, height: 40, borderRadius: 14, backgroundColor: BASE.surface, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: BASE.border },

  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, marginTop: 20, marginBottom: 12 },
  sectionTitle:  { color: BASE.textSecondary, fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
  countBadge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  countText:     { fontSize: 11, fontWeight: "800" },

  alertCard: { marginHorizontal: 20, marginBottom: 10, borderRadius: 20, padding: 16, flexDirection: "row", borderLeftWidth: 3, borderWidth: 1, borderColor: BASE.border },
  alertIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: "center", alignItems: "center", marginRight: 14 },
  alertBody: { flex: 1 },
  alertTop:  { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  alertTitle:{ color: BASE.textPrimary, fontSize: 14, fontWeight: "700", flex: 1, marginRight: 8 },
  alertTime: { color: BASE.textMuted, fontSize: 11 },
  alertDesc: { color: BASE.textSecondary, fontSize: 12, lineHeight: 18 },

  resolveBtn:     { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginTop: 10 },
  resolveBtnText: { color: "#FFF", fontSize: 11, fontWeight: "700" },

  empty:      { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 },
  emptyTitle: { color: BASE.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 16 },
  emptyText:  { color: BASE.textMuted, fontSize: 14, marginTop: 6 },
});
