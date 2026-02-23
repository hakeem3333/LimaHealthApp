import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function StudentDeepDive({ route, navigation }) {
  // In a real app, you'd pull this ID from the route params
  const [counselorNote, setCounselorNote] = useState("");
  const [activeTab, setActiveTab] = useState("insights");

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER: Back Button & Student Identity */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color="#F8FAFC"
          />
        </TouchableOpacity>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>Marcus Johnson</Text>
          <Text style={styles.studentId}>Student ID: #88293</Text>
        </View>
        <TouchableOpacity style={styles.statusBadge}>
          <View style={styles.criticalDot} />
          <Text style={styles.statusText}>CRITICAL</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 1. BIOMETRIC OVERLAY (Visual Heatmap) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Correlation Analytics</Text>
          <View style={styles.chartPlaceholder}>
            {/* Mock Chart UI */}
            <View style={styles.chartHeader}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#EF4444" }]}
                />
                <Text style={styles.legendText}>Avg Heart Rate (BPM)</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#818CF8" }]}
                />
                <Text style={styles.legendText}>Mood Logs</Text>
              </View>
            </View>

            {/* Simple Graphic Representation of Overlay */}
            <View style={styles.visualGraph}>
              <MaterialCommunityIcons
                name="chart-bell-curve-cumulative"
                size={120}
                color="rgba(129, 140, 248, 0.3)"
              />
              <Text style={styles.chartNote}>
                [ Interactive HRV vs Mood Chart ]
              </Text>
            </View>
          </View>
          <Text style={styles.insightNote}>
            <MaterialCommunityIcons
              name="lightbulb-on"
              size={14}
              color="#F59E0B"
            />{" "}
            Significant HR spike (112bpm) detected during "Anxious" mood log at
            2:15 PM today.
          </Text>
        </View>

        {/* 2. SHARED JOURNAL ACCESS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shared Reflections</Text>
            <MaterialCommunityIcons
              name="lock-open-variant-outline"
              size={18}
              color="#10B981"
            />
          </View>

          <View style={styles.journalCard}>
            <Text style={styles.journalDate}>Today, 10:45 AM</Text>
            <Text style={styles.journalText}>
              "The pressure from the math project is getting to be too much. I
              feel like I'm falling behind even when I study until 2 AM."
            </Text>
          </View>
        </View>

        {/* 3. PRIVATE COUNSELOR NOTES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinical Observations</Text>
          <View style={styles.notesContainer}>
            <View style={styles.privateBadge}>
              <MaterialCommunityIcons
                name="eye-off"
                size={12}
                color="#94A3B8"
              />
              <Text style={styles.privateText}>
                PRIVATE: NOT VISIBLE TO STUDENT
              </Text>
            </View>
            <TextInput
              style={styles.notesInput}
              placeholder="Start typing session notes..."
              placeholderTextColor="#475569"
              multiline
              value={counselorNote}
              onChangeText={setCounselorNote}
            />
            <TouchableOpacity style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save Clinical Note</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617", paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  backBtn: { backgroundColor: "#1E293B", padding: 8, borderRadius: 12 },
  studentInfo: { flex: 1, marginLeft: 15 },
  studentName: { color: "#F8FAFC", fontSize: 20, fontWeight: "bold" },
  studentId: { color: "#64748B", fontSize: 12 },
  statusBadge: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  criticalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginRight: 6,
  },
  statusText: { color: "#EF4444", fontSize: 10, fontWeight: "900" },

  section: { marginBottom: 30 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  chartPlaceholder: {
    backgroundColor: "#0F172A",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
    height: 220,
    justifyContent: "center",
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  legendItem: { flexDirection: "row", alignItems: "center" },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { color: "#64748B", fontSize: 10 },
  visualGraph: { alignItems: "center", justifyContent: "center" },
  chartNote: { color: "#475569", fontSize: 10, marginTop: 10 },
  insightNote: {
    color: "#F59E0B",
    fontSize: 12,
    marginTop: 12,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    padding: 10,
    borderRadius: 10,
  },

  journalCard: {
    backgroundColor: "#0F172A",
    padding: 20,
    borderRadius: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#818CF8",
  },
  journalDate: { color: "#64748B", fontSize: 11, marginBottom: 8 },
  journalText: {
    color: "#F8FAFC",
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic",
  },

  notesContainer: {
    backgroundColor: "#0F172A",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  privateBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  privateText: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 6,
  },
  notesInput: {
    color: "#F8FAFC",
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: "top",
  },
  saveBtn: {
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: { color: "#818CF8", fontWeight: "bold" },
});
