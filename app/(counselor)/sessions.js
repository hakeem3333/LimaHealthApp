import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert, ActivityIndicator, RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";

export default function SessionManager() {
  const { membersLabel } = useAuth();
  const [isAvailable, setIsAvailable]         = useState(true);
  const [appointments, setAppointments]       = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [refreshing, setRefreshing]           = useState(false);
  const [togglingAvail, setTogglingAvail]     = useState(false);

  const fetchSessions = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [dashRes, apptRes] = await Promise.all([
        apiFetch("/counselor/dashboard"),
        apiFetch("/appointments/today"),
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
    const status = action === "Accept" ? "CONFIRMED" : "CANCELLED";
    Alert.alert(
      `${action} Session`,
      `Are you sure you want to ${action.toLowerCase()} this session?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action,
          style: action === "Reject" ? "destructive" : "default",
          onPress: async () => {
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
              Toast.show({ type: "error", text1: "Action failed", text2: err.message });
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6D28D9" />
      </View>
    );
  }

  const pending   = appointments.filter((a) => a.status === "PENDING");
  const confirmed = appointments.filter((a) => a.status === "CONFIRMED");

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
            <View style={[styles.statusDot, { backgroundColor: isAvailable ? "#10B981" : "#475569" }]} />
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
            trackColor={{ false: "#1E293B", true: "#818CF8" }}
            thumbColor="#FFF"
          />
        </View>

        {/* PENDING REQUESTS */}
        {pending.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Requests ({pending.length})</Text>
            {pending.map((appt) => (
              <View key={appt.id} style={styles.requestCard}>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestStudent}>
                    {appt.student?.firstName} {appt.student?.lastName}
                  </Text>
                  <Text style={styles.requestTime}>
                    {new Date(appt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {" — "}
                    {new Date(appt.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                  {appt.reason && <Text style={styles.requestReason}>{appt.reason}</Text>}
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAction(appt.id, "Accept")}
                  >
                    <Text style={styles.acceptText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleAction(appt.id, "Reject")}
                  >
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* CONFIRMED TODAY */}
        {confirmed.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Confirmed Today ({confirmed.length})</Text>
            {confirmed.map((appt) => (
              <View key={appt.id} style={styles.confirmedCard}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                <View style={styles.confirmedInfo}>
                  <Text style={styles.confirmedStudent}>
                    {appt.student?.firstName} {appt.student?.lastName}
                  </Text>
                  <Text style={styles.confirmedTime}>
                    {new Date(appt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleAction(appt.id, "Reject")}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {pending.length === 0 && confirmed.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-check" size={48} color="#1E293B" />
            <Text style={styles.emptyText}>No sessions for today.</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: "#020617" },
  center:           { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#020617" },
  header:           { padding: 20, paddingBottom: 8 },
  title:            { color: "#F8FAFC", fontSize: 24, fontWeight: "800" },
  subtitle:         { color: "#64748B", fontSize: 14, marginTop: 4 },
  availCard:        { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0F172A", margin: 20, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "#1E293B" },
  availInfo:        { flexDirection: "row", alignItems: "center", flex: 1 },
  statusDot:        { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  availTitle:       { color: "#F8FAFC", fontSize: 15, fontWeight: "700" },
  availSub:         { color: "#64748B", fontSize: 12, marginTop: 2 },
  section:          { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle:     { color: "#F8FAFC", fontSize: 16, fontWeight: "700", marginBottom: 12 },
  requestCard:      { backgroundColor: "#0F172A", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#334155" },
  requestInfo:      { marginBottom: 12 },
  requestStudent:   { color: "#F8FAFC", fontSize: 16, fontWeight: "700" },
  requestTime:      { color: "#8B5CF6", fontSize: 13, marginTop: 4 },
  requestReason:    { color: "#64748B", fontSize: 13, marginTop: 4 },
  actionButtons:    { flexDirection: "row", gap: 10 },
  acceptBtn:        { flex: 1, backgroundColor: "#10B981", borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  acceptText:       { color: "#FFF", fontWeight: "700" },
  rejectBtn:        { flex: 1, backgroundColor: "#1E293B", borderRadius: 12, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: "#EF4444" },
  rejectText:       { color: "#EF4444", fontWeight: "700" },
  confirmedCard:    { flexDirection: "row", alignItems: "center", backgroundColor: "#0F172A", borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "#1E293B" },
  confirmedInfo:    { flex: 1, marginLeft: 12 },
  confirmedStudent: { color: "#F8FAFC", fontSize: 15, fontWeight: "700" },
  confirmedTime:    { color: "#64748B", fontSize: 13, marginTop: 2 },
  cancelText:       { color: "#EF4444", fontSize: 13, fontWeight: "600" },
  emptyState:       { alignItems: "center", paddingVertical: 40 },
  emptyText:        { color: "#475569", fontSize: 15, marginTop: 12 },
});
