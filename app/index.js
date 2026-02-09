import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function LimaLanding() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F8F5" }}>
      <StatusBar barStyle="dark-content" />

      {/* Soft background glow */}
      <LinearGradient colors={["#DFF3E4", "#F4F8F5"]} style={styles.topGlow} />

      <SafeAreaView style={styles.container}>
        {/* BRAND */}
        <Text style={styles.brand}>LIMAHEALTH</Text>

        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.title}>Your Wellness{"\n"}Starts Here</Text>
          <Text style={styles.subtitle}>
            A safe space for students and counselors to monitor wellbeing,
            connect, and get support.
          </Text>
        </View>

        {/* ROLE CARDS */}
        <View style={styles.cardsWrapper}>
          {/* STUDENT */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.studentCard}
            onPress={() =>
              router.push({ pathname: "/login", params: { role: "student" } })
            }
          >
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>🎓</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitleLight}>Student Portal</Text>
              <Text style={styles.cardSubLight}>
                Track mood • Book sessions • Daily check-ins
              </Text>
            </View>

            <Text style={styles.arrowLight}>→</Text>
          </TouchableOpacity>

          {/* COUNSELOR */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.counselorCard}
            onPress={() =>
              router.push({ pathname: "/login", params: { role: "counselor" } })
            }
          >
            <View style={styles.iconCircleDark}>
              <Text style={styles.icon}>🩺</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitleDark}>Counselor Portal</Text>
              <Text style={styles.cardSubDark}>
                Monitor students • Manage care • Appointments
              </Text>
            </View>

            <Text style={styles.arrowDark}>→</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Need help signing in? Contact your school administration.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },

  topGlow: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 260,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },

  brand: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 3,
    color: "#2F6B3F",
  },

  hero: {
    marginTop: 40,
    marginBottom: 50,
  },

  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#1B1D1F",
    lineHeight: 44,
  },

  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 14,
    lineHeight: 24,
  },

  cardsWrapper: {
    gap: 20,
  },

  studentCard: {
    backgroundColor: "#2F6B3F",
    borderRadius: 24,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,

    shadowColor: "#2F6B3F",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },

  counselorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },

  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  iconCircleDark: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E8F3EC",
    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    fontSize: 22,
  },

  cardTitleLight: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  cardSubLight: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
  },

  cardTitleDark: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },

  cardSubDark: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  arrowLight: {
    fontSize: 26,
    color: "#FFFFFF",
  },

  arrowDark: {
    fontSize: 26,
    color: "#2F6B3F",
  },

  footer: {
    marginTop: "auto",
    marginBottom: 24,
  },

  footerText: {
    textAlign: "center",
    fontSize: 13,
    color: "#94A3B8",
  },
});
