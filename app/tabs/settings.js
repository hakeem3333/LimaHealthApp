import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";

const BACKEND_URL = "http://192.168.43.151:3000/api/v1";
const FITBIT_AUTH_ENDPOINT = `${BACKEND_URL}/fitbit/auth`;

const SettingsScreen = ({ onLogout }) => {
  const { consentGiven, logout } = useAuth();
  const [isFitbitLinked, setIsFitbitLinked] = useState(false);

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
  };

  const handleFitbitLink = async () => {
    if (isFitbitLinked) {
      Alert.alert("Sync Data", "Initiating manual data sync with Fitbit.");
    } else {
      try {
        const supported = await Linking.canOpenURL(FITBIT_AUTH_ENDPOINT);
        if (supported) {
          await Linking.openURL(FITBIT_AUTH_ENDPOINT);
        } else {
          Alert.alert("Error", "Cannot open Fitbit authorization link.");
        }
      } catch (error) {
        console.error("Linking error:", error);
        Alert.alert("Error", "Failed to start Fitbit connection process.");
      }
    }
  };

  const handleDisconnectFitbit = () => {
    Alert.alert("Disconnect Fitbit", "Are you sure you want to disconnect?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Disconnect",
        onPress: () => {
          setIsFitbitLinked(false);
          Alert.alert("Disconnected", "Fitbit account has been disconnected.");
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <LinearGradient colors={["#fdfbfb", "#ebedee"]} className="flex-1">
      <ScrollView className="flex-1 px-5 py-8">
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-4xl font-extrabold text-gray-800">
            Settings
          </Text>
          <Ionicons name="settings-outline" size={28} color="#6366F1" />
        </View>

        {/* Device Connection */}
        <View className="bg-white rounded-3xl shadow-lg mb-6 p-6">
          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons
              name="watch-variant"
              size={24}
              color="#14B8A6"
            />
            <Text className="text-xl font-semibold text-gray-800 ml-2">
              Device Connection
            </Text>
          </View>

          {/* Fitbit Row */}
          <View className="flex-row justify-between items-center py-3 border-t border-gray-100">
            <View>
              <Text className="text-lg font-semibold text-gray-800">
                Fitbit
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                Status:
                <Text
                  className={`font-bold ${
                    isFitbitLinked ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isFitbitLinked ? " Connected" : " Disconnected"}
                </Text>
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              className={`px-5 py-2.5 rounded-full ${
                isFitbitLinked ? "bg-indigo-500" : "bg-teal-500"
              } shadow-sm`}
              onPress={handleFitbitLink}
            >
              <Text className="text-white font-semibold text-sm">
                {isFitbitLinked ? "Sync Data" : "Link Fitbit"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Disconnect Option */}
          {isFitbitLinked && (
            <TouchableOpacity
              className="flex-row justify-between items-center py-4"
              onPress={handleDisconnectFitbit}
            >
              <Text className="text-red-500 font-medium">
                Disconnect Fitbit
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>

        {/* Privacy Section */}
        <View className="bg-white rounded-3xl shadow-lg mb-6 p-6">
          <View className="flex-row items-center mb-4">
            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color="#6366F1"
            />
            <Text className="text-xl font-semibold text-gray-800 ml-2">
              Privacy
            </Text>
          </View>

          <View className="flex-row justify-between items-center py-3 border-t border-gray-100">
            <Text className="text-gray-800 text-base">Consent Status</Text>
            <View
              className={`px-4 py-1 rounded-full ${
                consentGiven ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <Text
                className={`font-semibold ${
                  consentGiven ? "text-green-700" : "text-red-700"
                }`}
              >
                {consentGiven ? "Consent Given" : "No Consent"}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          activeOpacity={0.85}
          className="w-full mt-6 h-14 bg-red-600 rounded-2xl justify-center items-center shadow-xl"
          onPress={handleLogout}
        >
          <View className="flex-row items-center">
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text className="text-white font-bold text-base ml-2">Log Out</Text>
          </View>
        </TouchableOpacity>

        {/* Footer */}
        <Text className="text-center text-gray-400 mt-8 text-xs">
          BioAware © {new Date().getFullYear()} — Wellness by Design
        </Text>
      </ScrollView>
    </LinearGradient>
  );
};

export default SettingsScreen;
