import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, FlatList, ActivityIndicator,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../api/client";
import { BASE } from "../../utils/orgTheme";

export default function WellnessScreen() {
  const { user, theme, supportLabel } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
  const [counselors,   setCounselors]   = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [loading,      setLoading]      = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appts, couns] = await Promise.all([
        apiFetch(`/appointments?userId=${user?.id}`).catch(() => []),
        apiFetch("/users?role=COUNSELOR").catch(() => []),
      ]);
      const all = Array.isArray(appts) ? appts : appts?.data ?? [];
      setAppointments(all.filter((a) => a.status !== "COMPLETED").slice(0, 3));
      setPastSessions(all.filter((a) => a.status === "COMPLETED").slice(0, 3));
      setCounselors(Array.isArray(couns) ? couns : couns?.data ?? []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { if (user?.id) fetchData(); }, [user?.id]);

  const StatusBadge = ({ status }) => {
    const map = {
      CONFIRMED: { color: BASE.success, bg: BASE.success + "15" },
      PENDING:   { color: BASE.warning, bg: BASE.warning + "15" },
      CANCELLED: { color: BASE.error,   bg: BASE.error   + "15" },
    };
    const s = map[status] || map.PENDING;
    return (
      <View style={[styles.badge, { backgroundColor: s.bg }]}>
        <Text style={[styles.badgeText, { color: s.color }]}>{status}</Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor={theme.primary} />}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Wellness Centre</Text>
        <Text style={styles.sub}>Your support, your schedule</Text>
      </View>

      {/* BOOK CTA */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push("/(student)/CounselingBooking")}
      >
        <LinearGradient colors={theme.gradient} style={styles.bookCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.bookCtaLeft}>
            <View style={styles.bookCtaIcon}>
              <MaterialCommunityIcons name="calendar-plus" size={24} color="#FFF" />
            </View>
            <View>
              <Text style={styles.bookCtaTitle}>Book a {supportLabel}</Text>
              <Text style={styles.bookCtaSub}>Choose time · Select specialist</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={20} color="rgba(255,255,255,0.8)" />
        </LinearGradient>
      </TouchableOpacity>

      {/* UPCOMING SESSIONS */}
      {appointments.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
          {appointments.map((appt) => {
            const date = new Date(appt.scheduledAt || appt.date);
            return (
              <View key={appt.id} style={styles.apptCard}>
                <View style={[styles.datePill, { backgroundColor: theme.primary + "18", borderColor: theme.primary + "40" }]}>
                  <Text style={[styles.dateMonth, { color: theme.primary }]}>
                    {date.toLocaleDateString([], { month: "short" }).toUpperCase()}
                  </Text>
                  <Text style={[styles.dateDay, { color: theme.secondary }]}>
                    {date.getDate()}
                  </Text>
                </View>
                <View style={styles.apptInfo}>
                  <Text style={styles.apptName}>{appt.counselorName || appt.counselor?.firstName || supportLabel}</Text>
                  <Text style={styles.apptTime}>
                    {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
                <StatusBadge status={appt.status} />
              </View>
            );
          })}
        </>
      )}

      {/* CARE TEAM */}
      <Text style={styles.sectionTitle}>Our {supportLabel}s</Text>
      {counselors.length === 0 ? (
        <Text style={styles.emptyText}>No {supportLabel.toLowerCase()}s listed yet.</Text>
      ) : (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={counselors}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <View style={styles.counselorCard}>
              <View style={[styles.counselorAvatar, { backgroundColor: theme.primary + "18" }]}>
                <MaterialCommunityIcons name="account-tie" size={32} color={theme.primary} />
              </View>
              <Text style={styles.counselorName} numberOfLines={1}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={styles.counselorRole}>{supportLabel}</Text>
              <View style={styles.availRow}>
                <View style={[styles.avDot, { backgroundColor: BASE.success }]} />
                <Text style={[styles.avText, { color: BASE.success }]}>Available</Text>
              </View>
              <TouchableOpacity
                style={[styles.bookBtn, { backgroundColor: theme.primary + "15", borderColor: theme.primary + "40" }]}
                onPress={() => router.push("/(student)/CounselingBooking")}
              >
                <Text style={[styles.bookBtnText, { color: theme.primary }]}>Book</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* PAST SESSIONS */}
      {pastSessions.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Session History</Text>
          {pastSessions.map((s) => (
            <View key={s.id} style={styles.pastCard}>
              <View style={[styles.pastIcon, { backgroundColor: BASE.success + "15" }]}>
                <MaterialCommunityIcons name="file-document-check-outline" size={20} color={BASE.success} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.pastTitle}>{s.type || "Wellness Session"}</Text>
                <Text style={styles.pastDate}>
                  {new Date(s.scheduledAt || s.date).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
                </Text>
              </View>
              <MaterialCommunityIcons name="download-outline" size={20} color={BASE.textMuted} />
            </View>
          ))}
        </>
      )}

      <View style={{ height: 40 }} />
      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: BASE.bg, paddingHorizontal: 20 },
  header:       { marginTop: 60, marginBottom: 24 },
  title:        { color: BASE.textPrimary, fontSize: 28, fontWeight: "800" },
  sub:          { color: BASE.textMuted, fontSize: 15, marginTop: 4 },

  bookCta:      { borderRadius: 24, padding: 22, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
  bookCtaLeft:  { flexDirection: "row", alignItems: "center", gap: 16 },
  bookCtaIcon:  { width: 46, height: 46, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  bookCtaTitle: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  bookCtaSub:   { color: "rgba(255,255,255,0.72)", fontSize: 12, marginTop: 2 },

  sectionTitle: { color: BASE.textPrimary, fontSize: 17, fontWeight: "700", marginBottom: 14, marginTop: 4 },
  emptyText:    { color: BASE.textMuted, fontSize: 13, marginBottom: 20 },

  apptCard:  { backgroundColor: BASE.surface, borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center", marginBottom: 10, borderWidth: 1, borderColor: BASE.border },
  datePill:  { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, alignItems: "center", minWidth: 52, borderWidth: 1, marginRight: 14 },
  dateMonth: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  dateDay:   { fontSize: 20, fontWeight: "800" },
  apptInfo:  { flex: 1 },
  apptName:  { color: BASE.textPrimary, fontSize: 14, fontWeight: "600" },
  apptTime:  { color: BASE.textSecondary, fontSize: 12, marginTop: 3 },
  badge:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: "800" },

  counselorCard: { backgroundColor: BASE.surface, width: 155, padding: 18, borderRadius: 22, alignItems: "center", borderWidth: 1, borderColor: BASE.border },
  counselorAvatar: { width: 56, height: 56, borderRadius: 18, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  counselorName: { color: BASE.textPrimary, fontSize: 14, fontWeight: "700", textAlign: "center" },
  counselorRole: { color: BASE.textSecondary, fontSize: 11, marginTop: 2 },
  availRow:      { flexDirection: "row", alignItems: "center", marginTop: 10 },
  avDot:         { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  avText:        { fontSize: 11, fontWeight: "600" },
  bookBtn:       { marginTop: 12, paddingHorizontal: 22, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  bookBtnText:   { fontSize: 12, fontWeight: "700" },

  pastCard: { backgroundColor: BASE.surface, borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center", marginBottom: 10, borderWidth: 1, borderColor: BASE.border },
  pastIcon: { width: 42, height: 42, borderRadius: 13, justifyContent: "center", alignItems: "center" },
  pastTitle:{ color: BASE.textPrimary, fontSize: 14, fontWeight: "600" },
  pastDate: { color: BASE.textMuted, fontSize: 12, marginTop: 3 },
});
