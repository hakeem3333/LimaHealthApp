import React, { useState, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, ActivityIndicator, RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { useThemedStyles } from "../../contexts/ThemeContext";
import { confirmAction } from "../../utils/confirm";

const TABS = ["Today", "Upcoming", "Proposed", "Past"];

export default function SessionManager() {
  const router = useRouter();
  const { membersLabel, theme } = useAuth();
  const { styles, colors: BASE } = useThemedStyles(createStyles);
  const accent = theme?.primary ?? BASE.success;
  const [isAvailable, setIsAvailable]     = useState(true);
  const [appointments, setAppointments]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [togglingAvail, setTogglingAvail] = useState(false);
  const [activeTab, setActiveTab]         = useState("Today");

  const fetchSessions = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [dashRes, apptRes] = await Promise.all([
        apiFetch("/counselor/dashboard"),
        apiFetch("/appointments"),
      ]);
      setIsAvailable(dashRes.data?.isAvailable ?? true);
      setAppointments(apptRes.data || []);
    } catch (err) {
      console.error("Sessions fetch error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchSessions(); }, []));

  const { today, upcoming, past, proposals } = useMemo(() => {
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay   = new Date(); endOfDay.setHours(23, 59, 59, 999);

    // OPTION rows are proposed times awaiting the student's pick — not real
    // bookings yet, so they're tracked separately instead of cluttering
    // Today/Upcoming/Past looking like confirmed sessions.
    const bookable = appointments.filter((a) => a.status !== "OPTION");

    const isPast = (a) =>
      a.status === "COMPLETED" || a.status === "CANCELLED" || new Date(a.startTime) < startOfDay;

    const todayList = bookable.filter(
      (a) => !isPast(a) && new Date(a.startTime) >= startOfDay && new Date(a.startTime) <= endOfDay,
    );
    const upcomingList = bookable
      .filter((a) => !isPast(a) && new Date(a.startTime) > endOfDay)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    const pastList = bookable
      .filter(isPast)
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    // Group sibling OPTION rows (one per proposed slot) by groupId into a
    // single proposal card with all its candidate times.
    const groups = new Map();
    for (const a of appointments) {
      if (a.status !== "OPTION" || !a.groupId) continue;
      if (!groups.has(a.groupId)) {
        groups.set(a.groupId, { groupId: a.groupId, student: a.student, reason: a.reason, slots: [] });
      }
      groups.get(a.groupId).slots.push(a);
    }
    const proposalList = Array.from(groups.values())
      .map((g) => ({ ...g, slots: g.slots.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)) }))
      .sort((a, b) => new Date(a.slots[0].startTime) - new Date(b.slots[0].startTime));

    return { today: todayList, upcoming: upcomingList, past: pastList, proposals: proposalList };
  }, [appointments]);

  const toggleAvailability = async (val) => {
    setTogglingAvail(true);
    try {
      await apiFetch("/appointments/availability", {
        method: "PATCH",
        body: JSON.stringify({ isAvailable: val }),
      });
      setIsAvailable(val);
      Toast.show({ type: "success", text1: val ? "Now accepting bookings" : "Set to Away" });
    } catch (err) {
      Toast.show({ type: "error", text1: "Could not update availability", text2: err.message });
    } finally {
      setTogglingAvail(false);
    }
  };

  const handleAction = (id, action) => {
    const status = action === "Accept" ? "CONFIRMED" : action === "Complete" ? "COMPLETED" : "CANCELLED";
    confirmAction({
      title: `${action} Session`,
      message: `Are you sure you want to ${action.toLowerCase()} this session?`,
      confirmText: action,
      destructive: action === "Reject",
      onConfirm: async () => {
        try {
          await apiFetch(`/appointments/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
          });
          setAppointments((prev) =>
            prev.map((a) => (a.id === id ? { ...a, status } : a))
          );
          Toast.show({ type: "success", text1: `Session ${status.toLowerCase()}` });
        } catch (err) {
          Toast.show({ type: "error", text1: "Action failed", text2: err?.data?.error || err.message });
        }
      },
    });
  };

  const cancelProposal = (groupId) => {
    confirmAction({
      title: "Withdraw Proposal",
      message: "This removes all proposed times for this student. They will no longer be able to pick any of them.",
      confirmText: "Withdraw",
      cancelText: "Keep it",
      destructive: true,
      onConfirm: async () => {
        try {
          await apiFetch(`/appointments/group/${groupId}/cancel`, { method: "PATCH" });
          setAppointments((prev) =>
            prev.map((a) => (a.groupId === groupId ? { ...a, status: "CANCELLED" } : a))
          );
          Toast.show({ type: "success", text1: "Proposal withdrawn" });
        } catch (err) {
          Toast.show({ type: "error", text1: "Could not withdraw", text2: err?.data?.error || err.message });
        }
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={accent} />
      </View>
    );
  }

  const counts = { Today: today.length, Upcoming: upcoming.length, Proposed: proposals.length, Past: past.length };
  const activeList =
    activeTab === "Today" ? today :
    activeTab === "Upcoming" ? upcoming :
    activeTab === "Past" ? past : [];
  const isHistorical = activeTab === "Past";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchSessions(true)} />}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Session Manager</Text>
          <Text style={styles.subtitle}>Manage your availability and intake</Text>
        </View>

        {/* AVAILABILITY TOGGLE */}
        <View style={styles.availCard}>
          <View style={styles.availInfo}>
            <View style={[styles.statusDot, { backgroundColor: isAvailable ? BASE.success : BASE.textMuted }]} />
            <View>
              <Text style={styles.availTitle}>Accepting New Bookings</Text>
              <Text style={styles.availSub}>
                {isAvailable ? `${membersLabel} see you as 'Available Today'` : `${membersLabel} see you as 'Away'`}
              </Text>
            </View>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={toggleAvailability}
            disabled={togglingAvail}
            trackColor={{ false: BASE.border, true: accent + "88" }}
            thumbColor="#FFF"
          />
        </View>

        <TouchableOpacity style={styles.hoursLink} onPress={() => router.push("/(counselor)/availability")}>
          <MaterialCommunityIcons name="clock-outline" size={16} color={BASE.info} />
          <Text style={styles.hoursLinkText}>Working hours & time off</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color={BASE.textMuted} style={{ marginLeft: "auto" }} />
        </TouchableOpacity>

        {/* SEGMENTED TABS */}
        <View style={styles.segment}>
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {tab}
                </Text>
                {counts[tab] > 0 && (
                  <View style={[styles.segmentCount, active && { backgroundColor: accent }]}>
                    <Text style={[styles.segmentCountText, active && styles.segmentCountTextActive]}>
                      {counts[tab]}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SESSION LIST */}
        <View style={styles.section}>
          {activeTab === "Proposed" ? (
            proposals.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="calendar-question" size={48} color={BASE.border} />
                <Text style={styles.emptyText}>No proposals awaiting a response.</Text>
              </View>
            ) : (
              proposals.map((group) => (
                <View key={group.groupId} style={styles.requestCard}>
                  <View style={styles.rowTop}>
                    <MaterialCommunityIcons name="calendar-question" size={20} color={BASE.info} />
                    <View style={styles.confirmedInfo}>
                      <Text style={styles.confirmedStudent}>
                        {group.student?.firstName} {group.student?.lastName}
                      </Text>
                      {group.reason && <Text style={styles.requestReason}>{group.reason}</Text>}
                    </View>
                  </View>

                  <View style={styles.optionSlots}>
                    {group.slots.map((slot) => (
                      <View key={slot.id} style={styles.optionSlot}>
                        <Text style={[styles.optionSlotText, { color: BASE.info }]}>
                          {new Date(slot.startTime).toLocaleDateString([], { month: "short", day: "numeric" })}
                          {" · "}
                          {new Date(slot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelProposal(group.groupId)}>
                    <Text style={styles.cancelText}>Withdraw Proposal</Text>
                  </TouchableOpacity>
                </View>
              ))
            )
          ) : activeList.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name={activeTab === "Past" ? "history" : "calendar-check"}
                size={48}
                color={BASE.border}
              />
              <Text style={styles.emptyText}>
                {activeTab === "Today" && "No sessions for today."}
                {activeTab === "Upcoming" && "Nothing scheduled ahead yet."}
                {activeTab === "Past" && "No session history yet."}
              </Text>
            </View>
          ) : (
            activeList.map((appt) => {
              const isPending = appt.status === "PENDING";
              const isCancelled = appt.status === "CANCELLED";
              // A confirmed session that has started can be closed out, even
              // once it has slipped into the Past tab.
              const canComplete = appt.status === "CONFIRMED" && new Date(appt.startTime) <= new Date();
              return (
                <View key={appt.id} style={isPending ? styles.requestCard : styles.confirmedCard}>
                  <View style={styles.rowTop}>
                    <MaterialCommunityIcons
                      name={
                        isCancelled ? "close-circle" :
                        appt.status === "COMPLETED" ? "check-circle" :
                        isPending ? "clock-outline" : "calendar-check"
                      }
                      size={20}
                      color={isCancelled ? BASE.error : appt.status === "COMPLETED" ? BASE.success : isPending ? BASE.warning : BASE.success}
                    />
                    <View style={styles.confirmedInfo}>
                      <Text style={styles.confirmedStudent}>
                        {appt.student?.firstName} {appt.student?.lastName}
                      </Text>
                      <Text style={[styles.confirmedTime, { color: accent }]}>
                        {new Date(appt.startTime).toLocaleDateString([], { month: "short", day: "numeric" })}
                        {" · "}
                        {new Date(appt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {isHistorical ? "" : ` — ${new Date(appt.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                      </Text>
                      {appt.reason && <Text style={styles.requestReason}>{appt.reason}</Text>}
                    </View>
                    {isHistorical && (
                      <Text style={[styles.historyStatus, { color: isCancelled ? BASE.error : BASE.success }]}>
                        {appt.status}
                      </Text>
                    )}
                  </View>

                  {!isHistorical && isPending && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAction(appt.id, "Accept")}>
                        <Text style={styles.acceptText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.rejectBtn} onPress={() => handleAction(appt.id, "Reject")}>
                        <Text style={styles.rejectText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {canComplete && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAction(appt.id, "Complete")}>
                        <Text style={styles.acceptText}>Mark Completed</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {!isHistorical && !isPending && !canComplete && (
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => handleAction(appt.id, "Reject")}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (BASE) => StyleSheet.create({
  container:        { flex: 1, backgroundColor: BASE.bg },
  center:            { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: BASE.bg },
  header:            { padding: 20, paddingBottom: 8 },
  title:             { color: BASE.textPrimary, fontSize: 24, fontWeight: "800" },
  subtitle:          { color: BASE.textSecondary, fontSize: 14, marginTop: 4 },
  availCard:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: BASE.surface, marginHorizontal: 20, marginTop: 12, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: BASE.border },
  availInfo:         { flexDirection: "row", alignItems: "center", flex: 1 },
  statusDot:         { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  availTitle:        { color: BASE.textPrimary, fontSize: 15, fontWeight: "700" },
  availSub:          { color: BASE.textSecondary, fontSize: 12, marginTop: 2 },
  hoursLink:         { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: BASE.surface, marginHorizontal: 20, marginTop: 10, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: BASE.border },
  hoursLinkText:     { color: BASE.textPrimary, fontSize: 13, fontWeight: "700" },

  segment:           { flexDirection: "row", backgroundColor: BASE.surface, borderRadius: 16, marginHorizontal: 20, marginTop: 16, padding: 4, borderWidth: 1, borderColor: BASE.border },
  segmentBtn:        { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12 },
  segmentBtnActive:  { backgroundColor: BASE.border },
  segmentText:       { color: BASE.textSecondary, fontSize: 13, fontWeight: "700" },
  segmentTextActive: { color: BASE.textPrimary },
  segmentCount:      { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: BASE.border, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  segmentCountText:  { color: BASE.textSecondary, fontSize: 10, fontWeight: "800" },
  segmentCountTextActive: { color: "#FFF" },

  section:           { paddingHorizontal: 20, marginTop: 20 },
  requestCard:       { backgroundColor: BASE.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: BASE.muted },
  rowTop:            { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  confirmedInfo:     { flex: 1 },
  confirmedStudent:  { color: BASE.textPrimary, fontSize: 15, fontWeight: "700" },
  confirmedTime:     { fontSize: 12, marginTop: 3 },
  requestReason:     { color: BASE.textSecondary, fontSize: 13, marginTop: 4 },
  historyStatus:     { fontSize: 10, fontWeight: "800", letterSpacing: 0.4 },
  actionButtons:     { flexDirection: "row", gap: 10, marginTop: 14 },
  acceptBtn:         { flex: 1, backgroundColor: BASE.success, borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  acceptText:        { color: "#FFF", fontWeight: "700" },
  rejectBtn:         { flex: 1, backgroundColor: BASE.border, borderRadius: 12, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: BASE.error },
  rejectText:        { color: BASE.error, fontWeight: "700" },
  confirmedCard:     { backgroundColor: BASE.surface, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: BASE.border },
  cancelBtn:         { alignSelf: "flex-end", marginTop: 10 },
  cancelText:        { color: BASE.error, fontSize: 13, fontWeight: "600" },
  optionSlots:       { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  optionSlot:        { backgroundColor: BASE.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: BASE.muted },
  optionSlotText:    { fontSize: 12, fontWeight: "700" },
  emptyState:        { alignItems: "center", paddingVertical: 40 },
  emptyText:         { color: BASE.textMuted, fontSize: 15, marginTop: 12, textAlign: "center" },
});
