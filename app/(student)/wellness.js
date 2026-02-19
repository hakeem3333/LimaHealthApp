import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Mock Data for UI Generation
const UPCOMING_SESSIONS = [
  {
    id: "1",
    counselor: "Dr. Sarah Smith",
    date: "Feb 22",
    time: "10:00 AM",
    status: "CONFIRMED",
  },
  {
    id: "2",
    counselor: "Prof. James Wilson",
    date: "Feb 25",
    time: "2:30 PM",
    status: "PENDING",
  },
];

const COUNSELORS = [
  {
    id: "1",
    name: "Dr. Sarah Smith",
    specialty: "Anxiety & Stress",
    available: "Today",
  },
  {
    id: "2",
    name: "Prof. James Wilson",
    specialty: "Academic Focus",
    available: "Tomorrow",
  },
];

export default function WellnessCenter() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Wellness Center</Text>
        <Text style={styles.subtitle}>
          Professional support at your fingertips
        </Text>
      </View>

      {/* 1. UPCOMING SESSIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
        {UPCOMING_SESSIONS.map((item) => (
          <View key={item.id} style={styles.appointmentCard}>
            <View style={styles.sessionInfo}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateMonth}>{item.date.split(" ")[0]}</Text>
                <Text style={styles.dateDay}>{item.date.split(" ")[1]}</Text>
              </View>
              <View style={styles.textDetails}>
                <Text style={styles.counselorName}>{item.counselor}</Text>
                <Text style={styles.sessionTime}>{item.time}</Text>
              </View>
            </View>
            <View
              style={[
                styles.statusTag,
                {
                  backgroundColor:
                    item.status === "CONFIRMED" ? "#10B98120" : "#F59E0B20",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: item.status === "CONFIRMED" ? "#10B981" : "#F59E0B",
                  },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* 2. BOOKING PORTAL SHORTCUT */}
      <TouchableOpacity style={styles.bookingHero}>
        <View style={styles.bookingContent}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="calendar-plus"
              size={24}
              color="#FFF"
            />
          </View>
          <View>
            <Text style={styles.bookingTitle}>Book New Session</Text>
            <Text style={styles.bookingSub}>Select a counselor and time</Text>
          </View>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color="#475569"
        />
      </TouchableOpacity>

      {/* 3. COUNSELOR DIRECTORY */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Counselors</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={COUNSELORS}
          renderItem={({ item }) => (
            <View style={styles.counselorCard}>
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons
                  name="account-tie"
                  size={40}
                  color="#818CF8"
                />
              </View>
              <Text style={styles.cName}>{item.name}</Text>
              <Text style={styles.cSpecialty}>{item.specialty}</Text>
              <View style={styles.availabilityRow}>
                <View style={styles.greenDot} />
                <Text style={styles.availabilityText}>
                  Next: {item.available}
                </Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>

      {/* 4. PAST SUMMARIES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Past Session Notes</Text>
        <TouchableOpacity style={styles.summaryItem}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={24}
            color="#64748B"
          />
          <View style={styles.summaryText}>
            <Text style={styles.summaryTitle}>General Wellbeing Session</Text>
            <Text style={styles.summaryDate}>Completed on Feb 10, 2026</Text>
          </View>
          <MaterialCommunityIcons name="download" size={20} color="#818CF8" />
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617", paddingHorizontal: 20 },
  header: { marginTop: 60, marginBottom: 25 },
  title: { color: "#F8FAFC", fontSize: 28, fontWeight: "800" },
  subtitle: { color: "#64748B", fontSize: 16, marginTop: 4 },

  section: { marginBottom: 30 },
  sectionTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
  },

  appointmentCard: {
    backgroundColor: "#0F172A",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  sessionInfo: { flexDirection: "row", alignItems: "center" },
  dateBadge: {
    backgroundColor: "#1E293B",
    padding: 10,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 55,
  },
  dateMonth: {
    color: "#818CF8",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  dateDay: { color: "#F8FAFC", fontSize: 18, fontWeight: "bold" },
  textDetails: { marginLeft: 15 },
  counselorName: { color: "#F8FAFC", fontSize: 15, fontWeight: "600" },
  sessionTime: { color: "#64748B", fontSize: 13, marginTop: 2 },
  statusTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: "bold" },

  bookingHero: {
    backgroundColor: "#0F172A",
    padding: 20,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#334155",
  },
  bookingContent: { flexDirection: "row", alignItems: "center" },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#818CF8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  bookingTitle: { color: "#F8FAFC", fontSize: 16, fontWeight: "bold" },
  bookingSub: { color: "#64748B", fontSize: 12, marginTop: 2 },

  counselorCard: {
    backgroundColor: "#0F172A",
    width: 160,
    padding: 20,
    borderRadius: 24,
    marginRight: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cName: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  cSpecialty: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  availabilityText: { color: "#10B981", fontSize: 10, fontWeight: "600" },

  summaryItem: {
    backgroundColor: "#0F172A",
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryText: { flex: 1, marginLeft: 15 },
  summaryTitle: { color: "#F8FAFC", fontSize: 14, fontWeight: "600" },
  summaryDate: { color: "#475569", fontSize: 12, marginTop: 2 },
});
