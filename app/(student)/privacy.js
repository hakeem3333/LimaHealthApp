import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function PrivacyVault() {
  const [sharing, setSharing] = useState({
    heartRate: true,
    sleep: true,
    mood: false,
    anonymize: true,
  });

  const toggleSwitch = (key) => {
    setSharing((prev) => ({ ...prev, [key]: !prev[key] }));
    // Here you would call your consent.controller.ts to update the DB
  };

  const handleExport = () => {
    Alert.alert(
      "Data Export",
      "A secure link with your health history has been sent to your registered email.",
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name="shield-check"
            size={32}
            color="#818CF8"
          />
        </View>
        <Text style={styles.title}>Privacy Vault</Text>
        <Text style={styles.subtitle}>
          You are in total control of your health data.
        </Text>
      </View>

      {/* 1. DATA SHARING TOGGLES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sharing Permissions</Text>
        <Text style={styles.sectionDesc}>
          Select what your assigned counselor can see.
        </Text>

        <View style={styles.card}>
          <ToggleItem
            label="Biometric Heart Rate"
            value={sharing.heartRate}
            onToggle={() => toggleSwitch("heartRate")}
            icon="heart-pulse"
          />
          <ToggleItem
            label="Sleep Patterns"
            value={sharing.sleep}
            onToggle={() => toggleSwitch("sleep")}
            icon="moon-waning-crescent"
          />
          <ToggleItem
            label="Mood Journal Notes"
            value={sharing.mood}
            onToggle={() => toggleSwitch("mood")}
            icon="notebook-edit"
          />
        </View>
      </View>

      {/* 2. ANONYMIZATION SETTINGS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Privacy Mode</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.textContainer}>
              <Text style={styles.toggleLabel}>Anonymize My Data</Text>
              <Text style={styles.toggleSub}>
                Removes your name from reports used for school-wide health
                trends.
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#1E293B", true: "#818CF8" }}
              thumbColor="#FFF"
              onValueChange={() => toggleSwitch("anonymize")}
              value={sharing.anonymize}
            />
          </View>
        </View>
      </View>

      {/* 3. PARENTAL CONSENT STATUS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Guardian Verification</Text>
        <View style={[styles.card, styles.consentCard]}>
          <MaterialCommunityIcons
            name="account-check"
            size={24}
            color="#10B981"
          />
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.consentTitle}>Verified Parental Consent</Text>
            <Text style={styles.consentSub}>
              Status: Approved by Guardian (Feb 12, 2026)
            </Text>
          </View>
        </View>
      </View>

      {/* 4. DATA EXPORT */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <MaterialCommunityIcons name="download" size={20} color="#FFF" />
          <Text style={styles.exportText}>Request Data Export (.JSON)</Text>
        </TouchableOpacity>
        <Text style={styles.footerNote}>
          Your data is encrypted using AES-256 standards. We never sell your
          health information.
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const ToggleItem = ({ label, value, onToggle, icon }) => (
  <View style={styles.toggleRow}>
    <View style={styles.iconLabel}>
      <MaterialCommunityIcons name={icon} size={20} color="#94A3B8" />
      <Text style={styles.toggleLabel}>{label}</Text>
    </View>
    <Switch
      trackColor={{ false: "#1E293B", true: "#10B981" }}
      thumbColor="#FFF"
      onValueChange={onToggle}
      value={value}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617", paddingHorizontal: 20 },
  header: { marginTop: 60, alignItems: "center", marginBottom: 35 },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(129, 140, 248, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  title: { color: "#F8FAFC", fontSize: 26, fontWeight: "800" },
  subtitle: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 30,
  },

  section: { marginBottom: 30 },
  sectionTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionDesc: { color: "#475569", fontSize: 13, marginBottom: 15 },

  card: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  iconLabel: { flexDirection: "row", alignItems: "center" },
  toggleLabel: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 12,
  },
  textContainer: { flex: 1, paddingRight: 20 },
  toggleSub: { color: "#64748B", fontSize: 12, marginTop: 4 },

  consentCard: {
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  consentTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "bold" },
  consentSub: { color: "#10B981", fontSize: 12, marginTop: 2 },

  exportBtn: {
    backgroundColor: "#1E293B",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#334155",
  },
  exportText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 10,
  },
  footerNote: {
    color: "#334155",
    fontSize: 11,
    textAlign: "center",
    marginTop: 15,
    paddingHorizontal: 20,
  },
});
