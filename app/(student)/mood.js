import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const MOODS = [
  { emoji: "emoticon-dead", label: "Awful", color: "#EF4444" },
  { emoji: "emoticon-sad", label: "Down", color: "#F59E0B" },
  { emoji: "emoticon-neutral", label: "Okay", color: "#94A3B8" },
  { emoji: "emoticon-happy", label: "Good", color: "#10B981" },
  { emoji: "emoticon-excited", label: "Great", color: "#818CF8" },
];

export default function MoodLogScreen() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Reflections</Text>
        <Text style={styles.subtitle}>How are you feeling right now?</Text>
      </View>

      {/* 1. EMOJI PICKER */}
      <View style={styles.moodGrid}>
        {MOODS.map((mood, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.moodCard,
              selectedMood === index && {
                borderColor: mood.color,
                backgroundColor: mood.color + "15",
              },
            ]}
            onPress={() => setSelectedMood(index)}
          >
            <MaterialCommunityIcons
              name={mood.emoji}
              size={32}
              color={selectedMood === index ? mood.color : "#475569"}
            />
            <Text
              style={[
                styles.moodLabel,
                selectedMood === index && { color: "#F8FAFC" },
              ]}
            >
              {mood.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 2. QUICK NOTES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What's on your mind?</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Optional: Describe your thoughts..."
          placeholderTextColor="#475569"
          multiline
          numberOfLines={4}
          value={note}
          onChangeText={setNote}
        />
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Log Reflection</Text>
        </TouchableOpacity>
      </View>

      {/* 3. TALK TO AI BUTTON (Shortcut) */}
      <LinearGradient colors={["#1E293B", "#0F172A"]} style={styles.aiShortcut}>
        <View style={styles.aiInfo}>
          <MaterialCommunityIcons
            name="robot-happy"
            size={24}
            color="#818CF8"
          />
          <View style={styles.aiTextContainer}>
            <Text style={styles.aiTitle}>Need to vent?</Text>
            <Text style={styles.aiSub}>Our AI is here to listen 24/7.</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.chatBtn}>
          <Text style={styles.chatBtnText}>Start Chat</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* 4. MOOD HISTORY (Vertical Timeline) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Moods</Text>
        <View style={styles.timeline}>
          <TimelineItem
            day="Yesterday"
            mood="Great"
            time="8:30 PM"
            color="#818CF8"
          />
          <TimelineItem
            day="Tuesday"
            mood="Okay"
            time="2:15 PM"
            color="#94A3B8"
          />
          <TimelineItem
            day="Monday"
            mood="Down"
            time="10:00 AM"
            color="#F59E0B"
          />
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const TimelineItem = ({ day, mood, time, color }) => (
  <View style={styles.timelineRow}>
    <View style={styles.timelineMarker}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.line} />
    </View>
    <View style={styles.timelineContent}>
      <View style={styles.historyCard}>
        <Text style={styles.historyDay}>{day}</Text>
        <Text style={[styles.historyMood, { color: color }]}>{mood}</Text>
        <Text style={styles.historyTime}>{time}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617", paddingHorizontal: 20 },
  header: { marginTop: 60, marginBottom: 25 },
  title: { color: "#F8FAFC", fontSize: 28, fontWeight: "800" },
  subtitle: { color: "#64748B", fontSize: 16, marginTop: 4 },

  moodGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  moodCard: {
    width: (width - 60) / 5,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
    backgroundColor: "#0F172A",
  },
  moodLabel: {
    color: "#64748B",
    fontSize: 10,
    marginTop: 8,
    fontWeight: "600",
  },

  section: { marginBottom: 30 },
  sectionTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
  },
  textArea: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 15,
    color: "#F8FAFC",
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#1E293B",
    height: 100,
  },
  saveButton: {
    backgroundColor: "#818CF8",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 15,
  },
  saveButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },

  aiShortcut: {
    padding: 20,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  aiInfo: { flexDirection: "row", alignItems: "center" },
  aiTextContainer: { marginLeft: 12 },
  aiTitle: { color: "#F8FAFC", fontWeight: "bold", fontSize: 16 },
  aiSub: { color: "#64748B", fontSize: 12 },
  chatBtn: {
    backgroundColor: "rgba(129, 140, 248, 0.1)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#818CF8",
  },
  chatBtnText: { color: "#818CF8", fontWeight: "bold", fontSize: 12 },

  timeline: { paddingLeft: 10 },
  timelineRow: { flexDirection: "row", height: 80 },
  timelineMarker: { alignItems: "center", width: 20 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  line: { width: 2, flex: 1, backgroundColor: "#1E293B", marginVertical: 4 },
  timelineContent: { flex: 1, paddingLeft: 15 },
  historyCard: {
    backgroundColor: "#0F172A",
    padding: 12,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyDay: { color: "#F8FAFC", fontWeight: "600", fontSize: 14 },
  historyMood: { fontWeight: "bold", fontSize: 14 },
  historyTime: { color: "#475569", fontSize: 11 },
});
