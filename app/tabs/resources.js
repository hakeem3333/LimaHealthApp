// // app/tabs/resources.js
// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Ionicons } from "@expo/vector-icons";

// export default function ResourcesScreen() {
//   const categories = [
//     {
//       title: "Mindfulness & Meditation",
//       icon: "leaf",
//       color: "#10b981",
//       desc: "Short breathing and focus exercises",
//     },
//     {
//       title: "Physical Relaxation",
//       icon: "body",
//       color: "#f97316",
//       desc: "Stretch and unwind your body",
//     },
//     {
//       title: "Sleep & Recovery",
//       icon: "moon",
//       color: "#3b82f6",
//       desc: "Guides to improve your rest",
//     },
//     {
//       title: "Emotional Well-being",
//       icon: "heart",
//       color: "#ef4444",
//       desc: "Journaling and emotional awareness",
//     },
//   ];

//   return (
//     <LinearGradient colors={["#ede9fe", "#e0f2fe"]} style={styles.gradient}>
//       <ScrollView contentContainerStyle={styles.container}>
//         {/* Header */}
//         <View style={styles.header}>
//           <Text style={styles.title}>Wellness Resources 🌿</Text>
//           <Text style={styles.subtitle}>
//             Explore activities, articles, and guided tools for your mind and
//             body.
//           </Text>
//         </View>

//         {/* Daily Tip */}
//         <LinearGradient
//           colors={["#c7d2fe", "#bfdbfe"]}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//           style={styles.dailyCard}
//         >
//           <Ionicons name="sparkles" size={30} color="#1e3a8a" />
//           <View style={{ flex: 1, marginLeft: 10 }}>
//             <Text style={styles.dailyTitle}>Today’s Tip</Text>
//             <Text style={styles.dailyText}>
//               Try a 3-minute deep breathing session to reset and calm your mind.
//               💨
//             </Text>
//           </View>
//         </LinearGradient>

//         {/* Resource Categories */}
//         <Text style={styles.sectionTitle}>Explore Categories</Text>
//         <View style={styles.categoryGrid}>
//           {categories.map((cat, index) => (
//             <TouchableOpacity key={index} style={styles.card}>
//               <View
//                 style={[styles.iconWrap, { backgroundColor: cat.color + "20" }]}
//               >
//                 <Ionicons name={cat.icon} size={28} color={cat.color} />
//               </View>
//               <Text style={styles.cardTitle}>{cat.title}</Text>
//               <Text style={styles.cardDesc}>{cat.desc}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* AI Recommendation */}
//         <Text style={styles.sectionTitle}>AI Suggestion</Text>
//         <View style={styles.aiCard}>
//           <Text style={styles.aiText}>
//             Based on your recent data, you might enjoy a short stretching
//             routine to release tension. 🎯
//           </Text>
//           <TouchableOpacity style={styles.aiButton}>
//             <Text style={styles.aiButtonText}>Try Now</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Support Section */}
//         <View style={styles.supportBox}>
//           <Ionicons name="help-circle" size={28} color="#f59e0b" />
//           <View style={{ marginLeft: 10, flex: 1 }}>
//             <Text style={styles.supportTitle}>Need Support?</Text>
//             <Text style={styles.supportText}>
//               Contact your counselor or student wellness team for guidance.
//             </Text>
//           </View>
//         </View>
//       </ScrollView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   gradient: { flex: 1 },
//   container: {
//     paddingHorizontal: 20,
//     paddingTop: 60,
//     paddingBottom: 80,
//   },
//   header: { marginBottom: 25 },
//   title: { fontSize: 26, fontWeight: "700", color: "#0f172a" },
//   subtitle: { color: "#475569", marginTop: 6 },
//   dailyCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 16,
//     borderRadius: 18,
//     marginBottom: 28,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowRadius: 10,
//     elevation: 3,
//   },
//   dailyTitle: { fontWeight: "700", color: "#1e3a8a", marginBottom: 4 },
//   dailyText: { color: "#1e3a8a", fontSize: 13 },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#0f172a",
//     marginBottom: 12,
//   },
//   categoryGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     marginBottom: 28,
//   },
//   card: {
//     width: "47%",
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 14,
//     marginBottom: 14,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowRadius: 10,
//     elevation: 3,
//   },
//   iconWrap: {
//     width: 46,
//     height: 46,
//     borderRadius: 12,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   cardTitle: { fontWeight: "600", fontSize: 14, color: "#111827" },
//   cardDesc: { fontSize: 12, color: "#6b7280", marginTop: 4 },
//   aiCard: {
//     backgroundColor: "#f0fdf4",
//     borderRadius: 16,
//     padding: 18,
//     marginBottom: 30,
//   },
//   aiText: { color: "#166534", fontSize: 14, marginBottom: 10 },
//   aiButton: {
//     backgroundColor: "#22c55e",
//     borderRadius: 12,
//     paddingVertical: 10,
//     alignItems: "center",
//   },
//   aiButtonText: { color: "#fff", fontWeight: "600" },
//   supportBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff7ed",
//     borderRadius: 14,
//     padding: 16,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   supportTitle: { fontWeight: "700", color: "#92400e" },
//   supportText: { color: "#b45309", fontSize: 13, marginTop: 2 },
// });

// app/tabs/resources.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function ResourcesScreen() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hey Alex 👋, how are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [bookingStep, setBookingStep] = useState(0);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text:
            "That sounds valid 💬. Remember to take deep breaths and maybe write down how you feel.",
        },
      ]);
    }, 800);
  };

  return (
    <LinearGradient colors={["#ede9fe", "#e0f2fe"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Wellness Support 💬</Text>
          <Text style={styles.subtitle}>
            Chat with our AI wellness guide or connect with a counselor.
          </Text>
        </View>

        {/* AI Chatbot Section */}
        <View style={styles.chatContainer}>
          <Text style={styles.sectionTitle}>AI Wellness Assistant</Text>
          <View style={styles.chatBox}>
            {messages.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.chatBubble,
                  msg.from === "user" ? styles.userBubble : styles.botBubble,
                ]}
              >
                <Text
                  style={{
                    color: msg.from === "user" ? "#fff" : "#1e3a8a",
                    fontSize: 14,
                  }}
                >
                  {msg.text}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Appointment Booking Section */}
        <View style={styles.bookingContainer}>
          <Text style={styles.sectionTitle}>Book a Counselor Appointment</Text>

          {bookingStep === 0 && (
            <>
              <Text style={styles.bookingText}>
                Choose a reason for your session:
              </Text>
              <TouchableOpacity
                style={styles.bookingButton}
                onPress={() => setBookingStep(1)}
              >
                <Ionicons name="sad" size={22} color="#ef4444" />
                <Text style={styles.bookingButtonText}>Stress / Anxiety</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bookingButton}
                onPress={() => setBookingStep(1)}
              >
                <Ionicons name="moon" size={22} color="#3b82f6" />
                <Text style={styles.bookingButtonText}>Sleep / Fatigue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bookingButton}
                onPress={() => setBookingStep(1)}
              >
                <Ionicons name="heart" size={22} color="#22c55e" />
                <Text style={styles.bookingButtonText}>Emotional Support</Text>
              </TouchableOpacity>
            </>
          )}

          {bookingStep === 1 && (
            <>
              <Text style={styles.bookingText}>Pick an available time slot:</Text>
              <View style={styles.timeGrid}>
                {["10:00 AM", "12:30 PM", "3:00 PM", "5:00 PM"].map(
                  (time, i) => (
                    <TouchableOpacity key={i} style={styles.timeSlot}>
                      <Text style={styles.timeText}>{time}</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setBookingStep(2)}
              >
                <Text style={styles.confirmText}>Confirm Booking</Text>
              </TouchableOpacity>
            </>
          )}

          {bookingStep === 2 && (
            <View style={styles.confirmationBox}>
              <Ionicons name="checkmark-circle" size={40} color="#22c55e" />
              <Text style={styles.confirmMsg}>
                Appointment booked successfully! 🎉
              </Text>
              <Text style={styles.confirmSub}>
                A counselor will reach out via your student email.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 80 },
  header: { marginBottom: 25 },
  title: { fontSize: 26, fontWeight: "700", color: "#0f172a" },
  subtitle: { color: "#475569", marginTop: 6 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 12,
  },

  // Chatbot styles
  chatContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  chatBox: {
    maxHeight: 250,
    marginBottom: 10,
  },
  chatBubble: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: "85%",
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#e0f2fe",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#6366f1",
  },
  chatInputContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  chatInput: {
    flex: 1,
    paddingVertical: 10,
    color: "#0f172a",
  },
  sendButton: {
    backgroundColor: "#6366f1",
    padding: 10,
    borderRadius: 20,
  },

  // Booking styles
  bookingContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  bookingText: { color: "#475569", marginBottom: 10 },
  bookingButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  bookingButtonText: {
    marginLeft: 10,
    color: "#111827",
    fontWeight: "500",
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  timeSlot: {
    width: "47%",
    backgroundColor: "#e0f2fe",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  timeText: { color: "#1e3a8a", fontWeight: "500" },
  confirmButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmText: { color: "#fff", fontWeight: "600" },
  confirmationBox: {
    alignItems: "center",
    padding: 20,
  },
  confirmMsg: {
    fontSize: 16,
    fontWeight: "600",
    color: "#166534",
    marginTop: 10,
  },
  confirmSub: { color: "#475569", marginTop: 4 },
});
