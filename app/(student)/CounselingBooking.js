import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const DAYS = [
  { day: "Mon", date: "28" },
  { day: "Tue", date: "29" },
  { day: "Wed", date: "30" },
  { day: "Thu", date: "01" },
  { day: "Fri", date: "02" },
];

const COUNSELORS = [
  {
    id: 1,
    name: "Dr. Sarah Jenkins",
    specialty: "Anxiety & Stress",
    rating: "4.9",
    image: "https://i.pravatar.cc/150?u=sarah",
  },
  {
    id: 2,
    name: "Marcus Thorne",
    specialty: "Academic Performance",
    rating: "4.8",
    image: "https://i.pravatar.cc/150?u=marcus",
  },
];

const TIMES = ["9:00 AM", "10:30 AM", "1:00 PM", "2:30 PM", "4:00 PM"];

export default function CounselingBooking() {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState("28");
  const [selectedCounselor, setSelectedCounselor] = useState(1);
  const [selectedTime, setSelectedTime] = useState(null);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Session</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* DATE SELECTOR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dateList}
          >
            {DAYS.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedDate(item.date)}
                style={[
                  styles.dateCard,
                  selectedDate === item.date && styles.activeDateCard,
                ]}
              >
                <Text
                  style={[
                    styles.dateDay,
                    selectedDate === item.date && styles.activeText,
                  ]}
                >
                  {item.day}
                </Text>
                <Text
                  style={[
                    styles.dateNum,
                    selectedDate === item.date && styles.activeText,
                  ]}
                >
                  {item.date}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* COUNSELOR SELECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Counselors</Text>
          {COUNSELORS.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => setSelectedCounselor(c.id)}
              style={[
                styles.counselorCard,
                selectedCounselor === c.id && styles.activeCounselorCard,
              ]}
            >
              <Image source={{ uri: c.image }} style={styles.avatar} />
              <View style={styles.counselorInfo}>
                <Text style={styles.counselorName}>{c.name}</Text>
                <Text style={styles.counselorSpecialty}>{c.specialty}</Text>
                <View style={styles.ratingRow}>
                  <MaterialCommunityIcons
                    name="star"
                    size={14}
                    color="#F59E0B"
                  />
                  <Text style={styles.ratingText}>{c.rating}</Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name={
                  selectedCounselor === c.id
                    ? "radiobox-marked"
                    : "radiobox-blank"
                }
                size={24}
                color={selectedCounselor === c.id ? "#6D28D9" : "#475569"}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* TIME SLOTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Times</Text>
          <View style={styles.timeGrid}>
            {TIMES.map((time) => (
              <TouchableOpacity
                key={time}
                onPress={() => setSelectedTime(time)}
                style={[
                  styles.timeChip,
                  selectedTime === time && styles.activeTimeChip,
                ]}
              >
                <Text
                  style={[
                    styles.timeText,
                    selectedTime === time && styles.activeText,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* FIXED FOOTER BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, !selectedTime && { opacity: 0.5 }]}
          disabled={!selectedTime}
          onPress={() => alert("Appointment Confirmed!")}
        >
          <Text style={styles.confirmBtnText}>Confirm Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },

  section: { marginTop: 25, paddingHorizontal: 20 },
  sectionTitle: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 15,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  dateList: { flexDirection: "row" },
  dateCard: {
    width: 60,
    height: 80,
    backgroundColor: "#0F172A",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  activeDateCard: { backgroundColor: "#6D28D9", borderColor: "#8B5CF6" },
  dateDay: { color: "#64748B", fontSize: 12 },
  dateNum: { color: "#FFF", fontSize: 18, fontWeight: "bold", marginTop: 4 },
  activeText: { color: "#FFF" },

  counselorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  activeCounselorCard: { borderColor: "#6D28D9", backgroundColor: "#1E1B4B" },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  counselorInfo: { flex: 1 },
  counselorName: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  counselorSpecialty: { color: "#64748B", fontSize: 13, marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  ratingText: {
    color: "#F8FAFC",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "600",
  },

  timeGrid: { flexDirection: "row", flexWrap: "wrap" },
  timeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#0F172A",
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  activeTimeChip: { backgroundColor: "#6D28D9", borderColor: "#8B5CF6" },
  timeText: { color: "#94A3B8", fontSize: 14, fontWeight: "600" },

  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    backgroundColor: "#020617",
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
  },
  confirmBtn: {
    backgroundColor: "#6D28D9",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#6D28D9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  confirmBtnText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
