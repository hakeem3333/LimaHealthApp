import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { useThemedStyles } from "../../contexts/ThemeContext";
import { showMessage } from "../../utils/confirm";

// Bucket the server's open slots by the student's local calendar day.
function groupSlotsByDay(slots) {
  const days = new Map();
  for (const slot of slots) {
    const key = new Date(slot.startTime).toDateString();
    if (!days.has(key)) days.set(key, { date: new Date(slot.startTime), slots: [] });
    days.get(key).slots.push(slot);
  }
  return [...days.values()];
}

const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function CounselingBooking() {
  const { styles, colors: BASE } = useThemedStyles(createStyles);
  const router = useRouter();
  const { memberLabel, supportLabel } = useAuth();

  // A member has exactly one assigned counselor; switching is requested from
  // the profile and approved by their org admin.
  const [counselor, setCounselor]           = useState(null);
  const [days, setDays]                     = useState([]);   // [{ date, slots: [{ startTime, endTime }] }]
  const [accepting, setAccepting]           = useState(true);
  const [selectedDay, setSelectedDay]       = useState(null);
  const [selectedSlot, setSelectedSlot]     = useState(null);
  const [loading, setLoading]               = useState(true);
  const [booking, setBooking]               = useState(false);

  const fetchSlots = async () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const res = await apiFetch(`/appointments/slots?tz=${encodeURIComponent(tz)}`);
    setAccepting(res.data?.accepting ?? false);
    setDays(groupSlotsByDay(res.data?.slots ?? []));
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/users/me/counselor");
        const assigned = data?.counselor ?? null;
        setCounselor(assigned);
        if (assigned) await fetchSlots();
      } catch (err) {
        console.error("Could not load booking data:", err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const goToProfile = () => router.push("/(student)/profile");

  const handleBook = async () => {
    if (!counselor || !selectedSlot) {
      showMessage("Incomplete", "Please select a date and time slot.");
      return;
    }

    setBooking(true);
    try {
      await apiFetch("/appointments", {
        method: "POST",
        body: JSON.stringify({
          counselorId: counselor.id,
          startTime:   selectedSlot.startTime,
          endTime:     selectedSlot.endTime,
          reason:      `${memberLabel}-initiated booking`,
        }),
      });
      Toast.show({ type: "success", text1: "Session Requested!", text2: "Your counselor will confirm shortly." });
      setTimeout(() => router.back(), 1500);
    } catch (err) {
      Toast.show({ type: "error", text1: "Booking failed", text2: err?.data?.error || err.message });
      // Someone may have taken the slot in the meantime — show what's left.
      setSelectedSlot(null);
      fetchSlots().catch(() => {});
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6D28D9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={BASE.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book a {supportLabel}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ASSIGNED COUNSELOR */}
        <Text style={styles.label}>Your {supportLabel}</Text>
        {counselor ? (
          <>
            <View style={[styles.counselorCard, styles.selectedCard]}>
              <View style={styles.counselorAvatar}>
                <Text style={styles.avatarText}>{counselor.firstName?.charAt(0)}</Text>
              </View>
              <View style={styles.counselorInfo}>
                <Text style={styles.counselorName}>{counselor.firstName} {counselor.lastName}</Text>
                <Text style={styles.counselorSpec}>{counselor.email}</Text>
              </View>
              <MaterialCommunityIcons name="check-circle" size={22} color="#6D28D9" />
            </View>
            <TouchableOpacity onPress={goToProfile} style={styles.changeLink}>
              <Text style={styles.changeLinkText}>
                Not satisfied? Request a different {supportLabel.toLowerCase()}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.noCounselorBox}>
            <Text style={styles.emptyText}>
              You don&apos;t have an assigned {supportLabel.toLowerCase()} yet. Send a request and your admin will match you with one.
            </Text>
            <TouchableOpacity onPress={goToProfile} style={styles.requestBtn}>
              <Text style={styles.bookBtnText}>Request a {supportLabel.toLowerCase()}</Text>
            </TouchableOpacity>
          </View>
        )}

        {counselor && (!accepting || days.length === 0) && (
          <Text style={[styles.emptyText, { marginTop: 20 }]}>
            {accepting
              ? `No open times in the next two weeks. Check back soon or message your ${supportLabel.toLowerCase()}.`
              : `Your ${supportLabel.toLowerCase()} isn't taking new bookings right now.`}
          </Text>
        )}

        {/* DATE PICKER */}
        {counselor && days.length > 0 && (
          <>
            <Text style={styles.label}>Select a Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow}>
              {days.map((day) => {
                const isSelected = selectedDay?.date.toDateString() === day.date.toDateString();
                return (
                  <TouchableOpacity
                    key={day.date.toDateString()}
                    style={[styles.dateCard, isSelected && styles.selectedDateCard]}
                    onPress={() => { setSelectedDay(day); setSelectedSlot(null); }}
                  >
                    <Text style={[styles.dayText, isSelected && styles.selectedText]}>
                      {day.date.toLocaleDateString("en", { weekday: "short" })}
                    </Text>
                    <Text style={[styles.dateNum, isSelected && styles.selectedText]}>
                      {day.date.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* TIME SLOTS */}
        {selectedDay && (
          <>
            <Text style={styles.label}>Available Times</Text>
            <View style={styles.timeGrid}>
              {selectedDay.slots.map((slot) => {
                const isSelected = selectedSlot?.startTime === slot.startTime;
                return (
                  <TouchableOpacity
                    key={slot.startTime}
                    style={[styles.timeChip, isSelected && styles.selectedTimeChip]}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    <Text style={[styles.timeChipText, isSelected && styles.selectedText]}>
                      {formatTime(slot.startTime)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {/* BOOK BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.bookBtn, (!counselor || !selectedSlot) && styles.bookBtnDisabled]}
          onPress={handleBook}
          disabled={booking || !counselor || !selectedSlot}
        >
          {booking ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.bookBtnText}>Request Session</Text>
          )}
        </TouchableOpacity>
      </View>

    </View>
  );
}

const createStyles = (BASE) => StyleSheet.create({
  container:        { flex: 1, backgroundColor: BASE.bg },
  center:           { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: BASE.bg },
  header:           { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, paddingTop: 60 },
  backBtn:          { width: 40, height: 40, borderRadius: 20, backgroundColor: BASE.surfaceAlt, justifyContent: "center", alignItems: "center" },
  headerTitle:      { color: BASE.textPrimary, fontSize: 20, fontWeight: "800" },
  label:            { color: BASE.textSecondary, fontSize: 13, fontWeight: "700", letterSpacing: 0.5, paddingHorizontal: 20, marginBottom: 10, marginTop: 20 },
  emptyText:        { color: BASE.textMuted, fontSize: 14, paddingHorizontal: 20 },
  changeLink:       { paddingHorizontal: 20, paddingVertical: 4 },
  changeLinkText:   { color: "#8B5CF6", fontSize: 13, fontWeight: "600" },
  noCounselorBox:   { gap: 14 },
  requestBtn:       { backgroundColor: "#6D28D9", borderRadius: 16, paddingVertical: 14, alignItems: "center", marginHorizontal: 20 },
  counselorCard:    { flexDirection: "row", alignItems: "center", backgroundColor: BASE.surface, marginHorizontal: 20, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: BASE.border },
  selectedCard:     { borderColor: "#6D28D9", backgroundColor: "#6D28D9" + "22" },
  counselorAvatar:  { width: 44, height: 44, borderRadius: 22, backgroundColor: BASE.surfaceAlt, justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText:       { color: "#8B5CF6", fontSize: 18, fontWeight: "700" },
  counselorInfo:    { flex: 1 },
  counselorName:    { color: BASE.textPrimary, fontSize: 15, fontWeight: "700" },
  counselorSpec:    { color: BASE.textMuted, fontSize: 13, marginTop: 2 },
  dateRow:          { paddingHorizontal: 20 },
  dateCard:         { alignItems: "center", backgroundColor: BASE.surface, borderRadius: 14, padding: 14, marginRight: 10, minWidth: 56, borderWidth: 1, borderColor: BASE.border },
  selectedDateCard: { backgroundColor: "#6D28D9", borderColor: "#6D28D9" },
  dayText:          { color: BASE.textMuted, fontSize: 12, fontWeight: "600" },
  dateNum:          { color: BASE.textPrimary, fontSize: 18, fontWeight: "800", marginTop: 4 },
  selectedText:     { color: "#FFF" },
  timeGrid:         { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, gap: 10 },
  timeChip:         { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: BASE.surface, borderRadius: 12, borderWidth: 1, borderColor: BASE.border },
  selectedTimeChip: { backgroundColor: "#6D28D9", borderColor: "#6D28D9" },
  timeChipText:     { color: BASE.textSecondary, fontSize: 14, fontWeight: "600" },
  footer:           { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: BASE.bg, borderTopWidth: 1, borderColor: BASE.border },
  bookBtn:          { backgroundColor: "#6D28D9", borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  bookBtnDisabled:  { backgroundColor: BASE.surfaceAlt },
  bookBtnText:      { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
