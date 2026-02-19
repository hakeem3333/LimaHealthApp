import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const [isLinked, setIsLinked] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const BASE_URL = "https://766c-102-89-82-128.ngrok-free.app";

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/fitbit/status/${user?.id}`,
        {
          headers: { "ngrok-skip-browser-warning": "true" },
        },
      );
      const data = await response.json();
      setIsLinked(data.isLinked);
    } catch (e) {
      console.error("Status check failed");
    }
  };

  const handleUnlinkFitbit = () => {
    Alert.alert(
      "Unlink Fitbit",
      "Are you sure you want to disconnect your wearable? We won't be able to track your health data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unlink",
          style: "destructive",
          onPress: async () => {
            // Logic to call your backend DELETE route will go here
            setIsLinked(false);
            Alert.alert("Disconnected", "Fitbit has been unlinked.");
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.firstName?.[0] || "S"}</Text>
        </View>
        <Text style={styles.name}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Device Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wearable Devices</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <MaterialCommunityIcons
              name="watch-variant"
              size={24}
              color="#6B21A8"
            />
            <View style={styles.rowText}>
              <Text style={styles.itemTitle}>Fitbit Tracker</Text>
              <Text
                style={[
                  styles.itemStatus,
                  { color: isLinked ? "#10B981" : "#EF4444" },
                ]}
              >
                {isLinked ? "Connected" : "Not Connected"}
              </Text>
            </View>
            {isLinked ? (
              <TouchableOpacity onPress={handleUnlinkFitbit}>
                <Text style={styles.unlinkText}>Unlink</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.connectBtn}>
                <Text style={styles.connectBtnText}>Connect</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={24}
              color="#6B21A8"
            />
            <Text style={[styles.itemTitle, { flex: 1, marginLeft: 12 }]}>
              Daily Reminders
            </Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#D1D5DB", true: "#E9D5FF" }}
              thumbColor={notifications ? "#6B21A8" : "#F3F4F6"}
            />
          </View>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF5FF" },
  header: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6B21A8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { color: "#FFF", fontSize: 32, fontWeight: "bold" },
  name: { fontSize: 22, fontWeight: "bold", color: "#1F2937" },
  email: { color: "#6B7280", marginTop: 4 },
  section: { padding: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 20,
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "center" },
  rowText: { flex: 1, marginLeft: 12 },
  itemTitle: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  itemStatus: { fontSize: 13, fontWeight: "500", marginTop: 2 },
  unlinkText: { color: "#EF4444", fontWeight: "600" },
  connectBtn: {
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  connectBtnText: { color: "#6B21A8", fontWeight: "600", fontSize: 12 },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 10,
    marginBottom: 40,
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 16,
  },
});
