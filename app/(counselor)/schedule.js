import React, { useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";

function getNextWeekdays(count = 6) {
  const days = [];
  const d = new Date();
  while (days.length < count) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) days.push(new Date(d));
  }
  return days;
}

const TIME_SLOTS = ["09:00", "10:30", "13:00", "14:30", "16:00"];
const SESSION_MINUTES = 50;
const emptySlot = () => ({ date: null, time: null });

export default function ScheduleSession() {
  const router = useRouter();
  const { studentId, studentName } = useLocalSearchParams();
  const { memberLabel } = useAuth();

  const [mode, setMode] = useState("defined"); // "defined" | "options"
  const [slots, setSlots] = useState([emptySlot()]);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const weekdays = getNextWeekdays();

  const switchMode = (next) => {
    if (next === mode) return;
    setMode(next);
    setSlots((prev) => {
      if (next === "defined") return [prev[0] ?? emptySlot()];
      if (prev.length >= 2) return prev;
      return [...prev, ...Array.from({ length: 2 - prev.length }, emptySlot)];
    });
  };

  const updateSlot = (index, patch) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const addThirdOption = () => setSlots((prev) => (prev.length < 3 ? [...prev, emptySlot()] : prev));
  const removeThirdOption = () => setSlots((prev) => (prev.length > 2 ? prev.slice(0, 2) : prev));

  const allSlotsFilled = slots.length > 0 && slots.every((s) => s.date && s.time);

  const handleSubmit = async () => {
    if (!allSlotsFilled || submitting) return;
    setSubmitting(true);
    try {
      const payloadSlots = slots.map(({ date, time }) => {
        const [hour, minute] = time.split(":").map(Number);
        const start = new Date(date);
        start.setHours(hour, minute, 0, 0);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + SESSION_MINUTES);
        return { startTime: start.toISOString(), endTime: end.toISOString() };
      });

      await apiFetch("/appointments/schedule", {
        method: "POST",
        body: JSON.stringify({
          studentId,
          mode,
          slots: payloadSlots,
          reason: reason.trim() || undefined,
        }),
      });

      Toast.show({
        type: "success",
        text1: mode === "defined" ? "Session scheduled" : "Options sent",
        text2:
          mode === "defined"
            ? `${studentName} has been notified.`
            : `${studentName} can pick a time now.`,
      });
      setTimeout(() => router.back(), 1200);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Could not schedule",
        text2: err?.data?.error || err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backCircle}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#F8FAFC" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Schedule Session</Text>
          <Text style={styles.subtitle}>with {studentName}</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* MODE SWITCH */}
          <View style={styles.modeRow}>
            <ModeCard
              active={mode === "defined"}
              icon="calendar-check"
              title="Set a Time"
              desc={`No choice for the ${memberLabel.toLowerCase()} — they're notified.`}
              onPress={() => switchMode("defined")}
            />
            <ModeCard
              active={mode === "options"}
              icon="calendar-multiple"
              title="Offer Choices"
              desc={`Propose 2-3 times, the ${memberLabel.toLowerCase()} picks one.`}
              onPress={() => switchMode("options")}
            />
          </View>

          {/* SLOTS */}
          {slots.map((slot, i) => (
            <View key={i} style={styles.slotBlock}>
              <View style={styles.slotHeader}>
                <View style={styles.slotLabelRow}>
                  {mode === "options" && (
                    <View style={styles.slotIndex}>
                      <Text style={styles.slotIndexText}>{i + 1}</Text>
                    </View>
                  )}
                  <Text style={styles.slotLabel}>
                    {mode === "defined" ? "Session Time" : `Option ${i + 1}`}
                  </Text>
                </View>
                {mode === "options" && i === 2 && (
                  <TouchableOpacity onPress={removeThirdOption} hitSlop={8}>
                    <MaterialCommunityIcons name="close-circle-outline" size={18} color="#64748B" />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow}>
                {weekdays.map((date, di) => {
                  const isSelected = slot.date?.toDateString() === date.toDateString();
                  return (
                    <TouchableOpacity
                      key={di}
                      style={[styles.dateCard, isSelected && styles.selectedDateCard]}
                      onPress={() => updateSlot(i, { date, time: null })}
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

              {slot.date && (
                <View style={styles.timeGrid}>
                  {TIME_SLOTS.map((time) => {
                    const isSelected = slot.time === time;
                    return (
                      <TouchableOpacity
                        key={time}
                        style={[styles.timeChip, isSelected && styles.selectedTimeChip]}
                        onPress={() => updateSlot(i, { time })}
                      >
                        <Text style={[styles.timeChipText, isSelected && styles.selectedText]}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          ))}

          {mode === "options" && slots.length < 3 && (
            <TouchableOpacity style={styles.addOptionBtn} onPress={addThirdOption}>
              <MaterialCommunityIcons name="plus-circle-outline" size={18} color="#8B5CF6" />
              <Text style={styles.addOptionText}>Add a third option</Text>
            </TouchableOpacity>
          )}

          {/* REASON */}
          <Text style={styles.label}>Reason (optional)</Text>
          <TextInput
            style={styles.reasonInput}
            placeholder="e.g. Weekly check-in"
            placeholderTextColor="#475569"
            value={reason}
            onChangeText={setReason}
            multiline
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={!allSlotsFilled || submitting}
          style={!allSlotsFilled || submitting ? { opacity: 0.5 } : undefined}
        >
          <LinearGradient
            colors={["#8B5CF6", "#6D28D9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitBtn}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>
                {mode === "defined" ? "Schedule Session" : "Send Options"}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <Toast />
    </SafeAreaView>
  );
}

function ModeCard({ active, icon, title, desc, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.modeCard, active && styles.modeCardActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.modeIconWrap, active && styles.modeIconWrapActive]}>
        <MaterialCommunityIcons name={icon} size={20} color={active ? "#FFF" : "#8B5CF6"} />
      </View>
      <Text style={[styles.modeTitle, active && styles.modeTitleActive]}>{title}</Text>
      <Text style={styles.modeDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617", paddingHorizontal: 20 },

  header: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  backCircle: { backgroundColor: "#1E293B", padding: 8, borderRadius: 12 },
  headerTextWrap: { flex: 1, marginLeft: 15 },
  title: { color: "#F8FAFC", fontSize: 20, fontWeight: "800" },
  subtitle: { color: "#64748B", fontSize: 12, marginTop: 2 },

  modeRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  modeCard: {
    flex: 1,
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#1E293B",
  },
  modeCardActive: { borderColor: "#8B5CF6", backgroundColor: "#1E1035" },
  modeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(139, 92, 246, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  modeIconWrapActive: { backgroundColor: "#8B5CF6" },
  modeTitle: { color: "#94A3B8", fontSize: 14, fontWeight: "800", marginBottom: 4 },
  modeTitleActive: { color: "#F8FAFC" },
  modeDesc: { color: "#64748B", fontSize: 11, lineHeight: 15 },

  slotBlock: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  slotHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  slotLabelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  slotIndex: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(139, 92, 246, 0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  slotIndexText: { color: "#8B5CF6", fontSize: 11, fontWeight: "800" },
  slotLabel: { color: "#94A3B8", fontSize: 13, fontWeight: "700" },

  dateRow: { paddingHorizontal: 16 },
  dateCard: {
    alignItems: "center",
    backgroundColor: "#1B2A3B",
    borderRadius: 14,
    padding: 12,
    marginRight: 8,
    minWidth: 52,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  selectedDateCard: { backgroundColor: "#8B5CF6", borderColor: "#8B5CF6" },
  dayText: { color: "#64748B", fontSize: 11, fontWeight: "600" },
  dateNum: { color: "#F8FAFC", fontSize: 16, fontWeight: "800", marginTop: 3 },
  selectedText: { color: "#FFF" },

  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 12,
  },
  timeChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: "#1B2A3B",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  selectedTimeChip: { backgroundColor: "#8B5CF6", borderColor: "#8B5CF6" },
  timeChipText: { color: "#94A3B8", fontSize: 13, fontWeight: "600" },

  addOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    marginBottom: 12,
  },
  addOptionText: { color: "#8B5CF6", fontSize: 13, fontWeight: "700" },

  label: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 4,
  },
  reasonInput: {
    backgroundColor: "#0F172A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
    color: "#F8FAFC",
    fontSize: 14,
    padding: 14,
    minHeight: 60,
    textAlignVertical: "top",
  },

  footer: { paddingVertical: 16 },
  submitBtn: { borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  submitBtnText: { color: "#FFF", fontSize: 15, fontWeight: "800" },
});
