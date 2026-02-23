// import React from "react";
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   SafeAreaView,
//   StatusBar,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRouter } from "expo-router";

// export default function LimaLanding() {
//   const router = useRouter();

//   return (
//     <View style={{ flex: 1, backgroundColor: "#F4F8F5" }}>
//       <StatusBar barStyle="dark-content" />

//       {/* Soft background glow */}
//       <LinearGradient colors={["#DFF3E4", "#F4F8F5"]} style={styles.topGlow} />

//       <SafeAreaView style={styles.container}>
//         {/* BRAND */}
//         <Text style={styles.brand}>LIMAHEALTH</Text>

//         {/* HERO */}
//         <View style={styles.hero}>
//           <Text style={styles.title}>Your Wellness{"\n"}Starts Here</Text>
//           <Text style={styles.subtitle}>
//             A safe space for students and counselors to monitor wellbeing,
//             connect, and get support.
//           </Text>
//         </View>

//         {/* ROLE CARDS */}
//         <View style={styles.cardsWrapper}>
//           {/* STUDENT */}
//           <TouchableOpacity
//             activeOpacity={0.9}
//             style={styles.studentCard}
//             onPress={() =>
//               router.push({ pathname: "/login", params: { role: "student" } })
//             }
//           >
//             <View style={styles.iconCircle}>
//               <Text style={styles.icon}>🎓</Text>
//             </View>

//             <View style={{ flex: 1 }}>
//               <Text style={styles.cardTitleLight}>Student Portal</Text>
//               <Text style={styles.cardSubLight}>
//                 Track mood • Book sessions • Daily check-ins
//               </Text>
//             </View>

//             <Text style={styles.arrowLight}>→</Text>
//           </TouchableOpacity>

//           {/* COUNSELOR */}
//           <TouchableOpacity
//             activeOpacity={0.9}
//             style={styles.counselorCard}
//             onPress={() =>
//               router.push({ pathname: "/login", params: { role: "counselor" } })
//             }
//           >
//             <View style={styles.iconCircleDark}>
//               <Text style={styles.icon}>🩺</Text>
//             </View>

//             <View style={{ flex: 1 }}>
//               <Text style={styles.cardTitleDark}>Counselor Portal</Text>
//               <Text style={styles.cardSubDark}>
//                 Monitor students • Manage care • Appointments
//               </Text>
//             </View>

//             <Text style={styles.arrowDark}>→</Text>
//           </TouchableOpacity>
//         </View>

//         {/* FOOTER */}
//         <View style={styles.footer}>
//           <Text style={styles.footerText}>
//             Need help signing in? Contact your school administration.
//           </Text>
//         </View>
//       </SafeAreaView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: 24,
//   },

//   topGlow: {
//     position: "absolute",
//     top: 0,
//     width: "100%",
//     height: 260,
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//   },

//   brand: {
//     marginTop: 10,
//     fontSize: 14,
//     fontWeight: "800",
//     letterSpacing: 3,
//     color: "#2F6B3F",
//   },

//   hero: {
//     marginTop: 40,
//     marginBottom: 50,
//   },

//   title: {
//     fontSize: 36,
//     fontWeight: "700",
//     color: "#1B1D1F",
//     lineHeight: 44,
//   },

//   subtitle: {
//     fontSize: 16,
//     color: "#6B7280",
//     marginTop: 14,
//     lineHeight: 24,
//   },

//   cardsWrapper: {
//     gap: 20,
//   },

//   studentCard: {
//     backgroundColor: "#2F6B3F",
//     borderRadius: 24,
//     padding: 22,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 16,

//     shadowColor: "#2F6B3F",
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.25,
//     shadowRadius: 16,
//     elevation: 8,
//   },

//   counselorCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 24,
//     padding: 22,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 16,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",

//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.06,
//     shadowRadius: 14,
//     elevation: 4,
//   },

//   iconCircle: {
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   iconCircleDark: {
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//     backgroundColor: "#E8F3EC",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   icon: {
//     fontSize: 22,
//   },

//   cardTitleLight: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#FFFFFF",
//   },

//   cardSubLight: {
//     fontSize: 14,
//     color: "rgba(255,255,255,0.85)",
//     marginTop: 4,
//   },

//   cardTitleDark: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#1F2937",
//   },

//   cardSubDark: {
//     fontSize: 14,
//     color: "#6B7280",
//     marginTop: 4,
//   },

//   arrowLight: {
//     fontSize: 26,
//     color: "#FFFFFF",
//   },

//   arrowDark: {
//     fontSize: 26,
//     color: "#2F6B3F",
//   },

//   footer: {
//     marginTop: "auto",
//     marginBottom: 24,
//   },

//   footerText: {
//     textAlign: "center",
//     fontSize: 13,
//     color: "#94A3B8",
//   },
// });

import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function LimaLanding() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#F9F8FF" }}>
      <StatusBar barStyle="dark-content" />

      {/* 1. SOFT PURPLE BACKGROUND DECORATION */}
      <View style={styles.topGlowContainer}>
        <LinearGradient
          colors={["#EDE9FE", "#F9F8FF"]}
          style={styles.topGlow}
        />
        <View style={styles.circleDecor} />
      </View>

      <SafeAreaView style={styles.container}>
        {/* 2. BRAND */}
        <View style={styles.brandContainer}>
          <View style={styles.logoDot} />
          <Text style={styles.brand}>LIMAHEALTH</Text>
        </View>

        {/* 3. HERO SECTION */}
        <View style={styles.hero}>
          <Text style={styles.title}>Your Wellness{"\n"}Starts Here</Text>
          <Text style={styles.subtitle}>
            A secure bridge between students and counselors to monitor health,
            connect deeply, and thrive.
          </Text>
        </View>

        {/* 4. ROLE CARDS */}
        <View style={styles.cardsWrapper}>
          {/* STUDENT CARD - Primary Purple */}
          <TouchableOpacity
            activeOpacity={0.92}
            style={styles.primaryCard}
            onPress={() =>
              router.push({ pathname: "/login", params: { role: "student" } })
            }
          >
            <LinearGradient
              colors={["#7C3AED", "#6D28D9"]}
              style={styles.cardGradient}
            >
              <View style={styles.iconCircleLight}>
                <MaterialCommunityIcons
                  name="school-outline"
                  size={26}
                  color="#FFF"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitleLight}>Student Portal</Text>
                <Text style={styles.cardSubLight}>
                  Mood tracking • Vitals • Booking
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#DDD6FE"
              />
            </LinearGradient>
          </TouchableOpacity>

          {/* COUNSELOR CARD - White/Glass */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.secondaryCard}
            onPress={() =>
              router.push({ pathname: "/login", params: { role: "counselor" } })
            }
          >
            <View style={styles.iconCirclePurple}>
              <MaterialCommunityIcons name="doctor" size={26} color="#7C3AED" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitleDark}>Counselor Portal</Text>
              <Text style={styles.cardSubDark}>
                Care management • AI Insights
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#A78BFA"
            />
          </TouchableOpacity>
        </View>

        {/* 5. FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Secured by enterprise-grade encryption
          </Text>
          <Text style={styles.schoolLink}>Contact School Admin</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28 },

  // Background Decorations
  topGlowContainer: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 350,
  },
  topGlow: { flex: 1, borderBottomLeftRadius: 60, borderBottomRightRadius: 60 },
  circleDecor: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(124, 58, 237, 0.05)",
  },

  brandContainer: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#7C3AED",
    marginRight: 8,
  },
  brand: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#4C1D95",
  },

  hero: { marginTop: 50, marginBottom: 45 },
  title: {
    fontSize: 40,
    fontWeight: "800",
    color: "#1E1B4B",
    lineHeight: 48,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 16,
    lineHeight: 24,
    paddingRight: 20,
  },

  cardsWrapper: { gap: 18 },

  primaryCard: {
    borderRadius: 28,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  cardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },

  secondaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },

  iconCircleLight: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconCirclePurple: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
  },

  cardTitleLight: { fontSize: 20, fontWeight: "700", color: "#FFFFFF" },
  cardSubLight: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 },

  cardTitleDark: { fontSize: 20, fontWeight: "700", color: "#1E1B4B" },
  cardSubDark: { fontSize: 14, color: "#64748B", marginTop: 4 },

  footer: { marginTop: "auto", marginBottom: 30, alignItems: "center" },
  footerText: { fontSize: 12, color: "#94A3B8", fontWeight: "500" },
  schoolLink: {
    fontSize: 13,
    color: "#7C3AED",
    fontWeight: "700",
    marginTop: 8,
    textDecorationLine: "underline",
  },
});