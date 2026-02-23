// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
// import { useAuth } from "../contexts/AuthContext";
// import { Ionicons } from "@expo/vector-icons";
// // 1. Import Toast
// import Toast from "react-native-toast-message";

// const LoginScreen = () => {
//   const router = useRouter();
//   const navigation = useNavigation();
//   const { role } = useLocalSearchParams();
//   const { login } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const canGoBack = navigation.canGoBack();

//   const handleLogin = async () => {
//     if (!email || !password) {
//       // 2. Use Toast for validation
//       Toast.show({
//         type: "error",
//         text1: "Required Fields",
//         text2: "Please fill in all fields 👋",
//       });
//       return;
//     }

//     setLoading(true);
//     try {
//       await login(email, password);

//       Toast.show({
//         type: "success",
//         text1: "Welcome Back!",
//         text2: "Login successful",
//       });

//       setTimeout(() => {
//         if (role === "counselor") {
//           router.replace("/(counselor)/dashboard");
//         } else {
//           router.replace("/(student)/home");
//         }
//       }, 500);
//     } catch (error) {
//       // 3. Use Toast for actual errors
//       Toast.show({
//         type: "error",
//         text1: "Login Failed",
//         text2: error.message || "Invalid credentials",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={styles.inner}
//       >
//         <View style={styles.header}>
//           {canGoBack ? (
//             <TouchableOpacity
//               onPress={() => router.back()}
//               style={styles.backButton}
//             >
//               <Ionicons name="arrow-back" size={28} color="#6D28D9" />
//             </TouchableOpacity>
//           ) : (
//             <View style={styles.backButtonPlaceholder} />
//           )}

//           <Text style={styles.title}>
//             {role === "counselor" ? "Counselor" : "Student"} Login
//           </Text>
//           <Text style={styles.subtitle}>Welcome back to LimaHealth</Text>
//         </View>

//         <View style={styles.form}>
//           <Text style={styles.inputLabel}>School Email</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="name@school.edu"
//             placeholderTextColor="#A78BFA"
//             keyboardType="email-address"
//             autoCapitalize="none"
//             value={email}
//             onChangeText={setEmail}
//           />

//           <Text style={styles.inputLabel}>Password</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="••••••••"
//             placeholderTextColor="#A78BFA"
//             secureTextEntry
//             value={password}
//             onChangeText={setPassword}
//           />

//           <TouchableOpacity
//             style={[styles.button, loading && { opacity: 0.7 }]}
//             onPress={handleLogin}
//             disabled={loading}
//           >
//             <Text style={styles.buttonText}>
//               {loading ? "Signing in..." : "Sign In"}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.footer}>
//           <Text style={styles.footerText}>
//             Forgot your password? Please contact your school's IT department.
//           </Text>
//         </View>
//       </KeyboardAvoidingView>

//       {/* 4. IMPORTANT: Place the Toast component at the very bottom of the root view */}
//       <Toast />
//     </SafeAreaView>
//   );
// };

// export default LoginScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FAF5FF", // Light purple tint background
//   },
//   inner: {
//     flex: 1,
//     paddingHorizontal: 28,
//     justifyContent: "space-between",
//   },
//   header: {
//     marginTop: 20,
//   },
//   backButton: {
//     marginBottom: 20,
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: "#EDE9FE", // Soft purple circle
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   backButtonPlaceholder: {
//     height: 64,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: "800",
//     color: "#2E1065", // Deep purple
//   },
//   subtitle: {
//     fontSize: 16,
//     color: "#7C3AED",
//     marginTop: 8,
//   },
//   form: {
//     marginTop: -40,
//   },
//   inputLabel: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#4C1D95",
//     marginBottom: 8,
//     marginLeft: 4,
//   },
//   input: {
//     width: "100%",
//     height: 56,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     paddingHorizontal: 16,
//     fontSize: 16,
//     color: "#1A1C1E",
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "#DDD6FE",
//   },
//   button: {
//     width: "100%",
//     height: 56,
//     backgroundColor: "#6D28D9", // Primary Purple
//     borderRadius: 16,
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 10,
//     shadowColor: "#6D28D9",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   buttonText: {
//     color: "#FFF",
//     fontWeight: "700",
//     fontSize: 18,
//   },
//   footer: {
//     marginBottom: 40,
//   },
//   footerText: {
//     textAlign: "center",
//     color: "#A78BFA",
//     fontSize: 13,
//     lineHeight: 20,
//   },
// });

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const LoginScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { role: paramRole } = useLocalSearchParams(); // From URL/State
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const canGoBack = navigation.canGoBack();

  const handleLogin = async () => {
    // 1. Validation
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Required Fields",
        text2: "Please fill in all fields 👋",
      });
      return;
    }

    setLoading(true);
    try {
      // 2. AuthContext login (now returns user object with role)
      const user = await login(email, password);

      Toast.show({
        type: "success",
        text1: "Welcome Back!",
        text2: `Logged in as ${user.firstName}`,
      });

      // 3. Security: Redirect based on DB Role, not URL params
      setTimeout(() => {
        if (user.role === "COUNSELOR") {
          router.replace("/(counselor)/dashboard");
        } else {
          router.replace("/(student)/home");
        }
      }, 500);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error.message || "Invalid credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        {/* HEADER SECTION */}
        <View style={styles.header}>
          {canGoBack ? (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#6D28D9" />
            </TouchableOpacity>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}

          <Text style={styles.title}>
            {paramRole === "counselor" ? "Counselor" : "Student"} Login
          </Text>
          <Text style={styles.subtitle}>Welcome back to LimaHealth</Text>
        </View>

        {/* FORM SECTION */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>School Email</Text>
            <TextInput
              style={styles.input}
              placeholder="name@school.edu"
              placeholderTextColor="#A78BFA"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#A78BFA"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* FOOTER SECTION */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Forgot your password? Please contact your school's IT department.
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/* GLOBAL TOAST COMPONENT */}
      <Toast />
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF5FF",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
  },
  header: {
    marginTop: Platform.OS === "android" ? 40 : 20,
    marginBottom: 40,
  },
  backButton: {
    marginBottom: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonPlaceholder: {
    height: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2E1065",
  },
  subtitle: {
    fontSize: 16,
    color: "#7C3AED",
    marginTop: 8,
  },
  form: {
    flex: 1,
    justifyContent: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4C1D95",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    width: "100%",
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1A1C1E",
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  button: {
    width: "100%",
    height: 56,
    backgroundColor: "#6D28D9",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#6D28D9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
    backgroundColor: "#A78BFA",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 18,
  },
  footer: {
    paddingVertical: 30,
  },
  footerText: {
    textAlign: "center",
    color: "#A78BFA",
    fontSize: 13,
    lineHeight: 20,
  },
});