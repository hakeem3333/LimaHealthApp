import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * FitbitOnboardingModal Component
 * @param {boolean} isVisible - Controls modal visibility
 * @param {function} onClose - Function to handle "Skip" or backdrop click
 * @param {function} onConnect - Function passed from parent to start OAuth flow
 */
const FitbitOnboardingModal = ({ isVisible, onClose, onConnect }) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* 1. Backdrop: Deep navy/purple overlay */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* 2. Container: Stops propagation to prevent closing when clicking inside */}
        <Pressable
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name="pulse" size={40} color="#6D28D9" />
          </View>

          {/* Text Content */}
          <Text style={styles.title}>Connect your Fitbit</Text>
          <Text style={styles.description}>
            Syncing your health data helps your counselor understand your sleep
            and activity levels. This leads to better support and personalized
            care.
          </Text>

          {/* Connection Feature Card */}
          <View style={styles.featureBox}>
            <View style={styles.featureItem}>
              <Ionicons name="moon" size={20} color="#7C3AED" />
              <Text style={styles.featureText}>Automatic Sleep Tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="walk" size={20} color="#7C3AED" />
              <Text style={styles.featureText}>Daily Activity Levels</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.connectBtn}
            onPress={() => {
              console.log("Modal: Connect Now clicked");
              // SAFETY CHECK: Prevents "TypeError: onConnect is not a function"
              if (typeof onConnect === "function") {
                onConnect();
              } else {
                console.warn(
                  "FitbitOnboardingModal: onConnect prop is missing or not a function.",
                );
              }
            }}
          >
            <Text style={styles.connectText}>Connect Now</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.6}
            style={styles.skipBtn}
            onPress={onClose}
          >
            <Text style={styles.skipText}>I'll do this later</Text>
          </TouchableOpacity>

          {/* Trust Footer */}
          <View style={styles.privacyRow}>
            <Ionicons name="shield-checkmark" size={14} color="#A78BFA" />
            <Text style={styles.privacyText}>
              Encrypted & strictly for clinical use
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default FitbitOnboardingModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(30, 27, 75, 0.85)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    alignItems: "center",
    paddingBottom: 50,
    width: "100%",
    // Web cursor support
    cursor: "default",
  },
  iconCircle: {
    width: 80,
    height: 80,
    backgroundColor: "#F3E8FF",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    marginTop: -10,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2E1065",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginTop: 12,
    marginBottom: 20,
  },
  featureBox: {
    width: "100%",
    backgroundColor: "#FAF5FF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4C1D95",
    marginLeft: 12,
  },
  connectBtn: {
    width: "100%",
    height: 60,
    backgroundColor: "#6D28D9",
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6D28D9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  connectText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 10,
  },
  skipBtn: {
    marginTop: 20,
    padding: 10,
  },
  skipText: {
    color: "#A78BFA",
    fontSize: 16,
    fontWeight: "600",
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
  },
  privacyText: {
    fontSize: 12,
    color: "#A78BFA",
    fontWeight: "500",
    marginLeft: 6,
  },
});
