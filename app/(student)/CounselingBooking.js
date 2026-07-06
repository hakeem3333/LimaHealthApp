import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";

// Generate next 5 weekdays from today
function getNextWeekdays(count = 5) {
  const days = [];
  const d = new Date();
  while (days.length < count) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      days.push(new Date(d));
    }
  }
  return days;
}

const TIME_SLOTS = ["09:00", "10:30", "13:00", "14:30", "16:00"];

export default function CounselingBooking() {
  const router = useRouter();
  const { user, memberLabel, supportLabel, supportsLabel } = useAuth();

  const [counselors, setCounselors]         = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [selectedDate, setSelectedDate]     = useState(null);
  const [selectedTime, setSelectedTime]     = useState(null);
  const [loading, setLoading]               = useState(true);
  const [booking, setBooking]               = useState(false);

  const weekdays = getNextWeekdays(5);

  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const data = await apiFetch("/users?role=COUNSELOR");
        setCounselors(data.data || data || []);
      } catch (err) {
        console.error(`Could not load ${supportsLabel.toLowerCase()}:`, err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCounselors();
  }, []);

  const handleBook = async () => {
    if (!selectedCounselor || !selectedDate || !selectedTime) {
      Alert.alert("Incomplete", "Please select a counselor, date, and time slot.");
      return;
    }

    const [hour, minute] = selectedTime.split(":").map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(hour, minute, 0, 0);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 50); // 50-minute session

    setBooking(true);
    try {
      await apiFetch("/appointments", {
        method: "POST",
        body: JSON.stringify({
          counselorId: selectedCounselor.id,
          startTime:   startTime.toISOString(),
          endTime:     endTime.toISOString(),
          reason:      `${memberLabel}-initiated booking`,
        }),
      });
      Toast.show({ type: "success", text1: "Session Requested!", text2: "Your counselor will confirm shortly." });
      setTimeout(() => router.back(), 1500);
    } catch (err) {
      Toast.show({ type: "error", text1: "Booking failed", text2: err.message });
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
          <MaterialCommunityIcons name="chevron-left" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book a {supportLabel}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* COUNSELOR PICKER */}
        <Text style={styles.label}>Choose a {supportLabel}</Text>
        {counselors.length === 0 ? (
          <Text style={styles.emptyText}>No available {supportsLabel.toLowerCase()} found.</Text>
        ) : (
          counselors.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.counselorCard, selectedCounselor?.id === c.id && styles.selectedCard]}
              onPress={() => setSelectedCounselor(c)}
            >
              <View style={styles.counselorAvatar}>
                <Text style={styles.avatarText}>{c.firstName?.charAt(0)}</Text>
              </View>
              <View style={styles.counselorInfo}>
                <Text style={styles.counselorName}>{c.firstName} {c.lastName}</Text>
                <Text style={styles.counselorSpec}>{c.email}</Text>
              </View>
              {selectedCounselor?.id === c.id && (
                <MaterialCommunityIcons name="check-circle" size={22} color="#6D28D9" />
              )}
            </TouchableOpacity>
          ))
        )}

        {/* DATE PICKER */}
        <Text style={styles.label}>Select a Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow}>
          {weekdays.map((date, i) => {
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            return (
              <TouchableOpacity
                key={i}
                style={[styles.dateCard, isSelected && styles.selectedDateCard]}
                onPress={() => { setSelectedDate(date); setSelectedTime(null); }}
              >
                <Text style={[styles.dayText, isSelected && styles.selectedText]}>
                  {date.toLocaleDateString("en", { weekday: "short" })}
                </Text>
                <Text style={[styles.dateNum, isSelected && styles.selectedText]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* TIME SLOTS */}
        {selectedDate && (
          <>
            <Text style={styles.label}>Available Times</Text>
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeChip, selectedTime === time && styles.selectedTimeChip]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[styles.timeChipText, selectedTime === time && styles.selectedText]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* BOOK BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.bookBtn, (!selectedCounselor || !selectedDate || !selectedTime) && styles.bookBtnDisabled]}
          onPress={handleBook}
          disabled={booking || !selectedCounselor || !selectedDate || !selectedTime}
        >
          {booking ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.bookBtnText}>Request Session</Text>
          )}
        </TouchableOpacity>
      </View>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: "#020617" },
  center:           { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#020617" },
  header:           { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, paddingTop: 60 },
  backBtn:          { width: 40, height: 40, borderRadius: 20, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center" },
  headerTitle:      { color: "#F8FAFC", fontSize: 20, fontWeight: "800" },
  label:            { color: "#94A3B8", fontSize: 13, fontWeight: "700", letterSpacing: 0.5, paddingHorizontal: 20, marginBottom: 10, marginTop: 20 },
  emptyText:        { color: "#475569", fontSize: 14, paddingHorizontal: 20 },
  counselorCard:    { flexDirection: "row", alignItems: "center", backgroundColor: "#0F172A", marginHorizontal: 20, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#1E293B" },
  selectedCard:     { borderColor: "#6D28D9", backgroundColor: "#1E1035" },
  counselorAvatar:  { width: 44, height: 44, borderRadius: 22, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText:       { color: "#8B5CF6", fontSize: 18, fontWeight: "700" },
  counselorInfo:    { flex: 1 },
  counselorName:    { color: "#F8FAFC", fontSize: 15, fontWeight: "700" },
  counselorSpec:    { color: "#64748B", fontSize: 13, marginTop: 2 },
  dateRow:          { paddingHorizontal: 20 },
  dateCard:         { alignItems: "center", backgroundColor: "#0F172A", borderRadius: 14, padding: 14, marginRight: 10, minWidth: 56, borderWidth: 1, borderColor: "#1E293B" },
  selectedDateCard: { backgroundColor: "#6D28D9", borderColor: "#6D28D9" },
  dayText:          { color: "#64748B", fontSize: 12, fontWeight: "600" },
  dateNum:          { color: "#F8FAFC", fontSize: 18, fontWeight: "800", marginTop: 4 },
  selectedText:     { color: "#FFF" },
  timeGrid:         { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, gap: 10 },
  timeChip:         { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#0F172A", borderRadius: 12, borderWidth: 1, borderColor: "#1E293B" },
  selectedTimeChip: { backgroundColor: "#6D28D9", borderColor: "#6D28D9" },
  timeChipText:     { color: "#94A3B8", fontSize: 14, fontWeight: "600" },
  footer:           { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: "#020617", borderTopWidth: 1, borderColor: "#1E293B" },
  bookBtn:          { backgroundColor: "#6D28D9", borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  bookBtnDisabled:  { backgroundColor: "#1E293B" },
  bookBtnText:      { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
