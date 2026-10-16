import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, StatusBar } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { HeroChromeProvider, useHeroChrome } from "../contexts/HeroChromeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import Toast from "react-native-toast-message";
import * as WebBrowser from "expo-web-browser";

// Web only: when an OAuth popup (e.g. Fitbit linking) lands back on the app,
// hand its URL to the window that opened it so openAuthSessionAsync resolves.
// No-op on native and on normal page loads.
WebBrowser.maybeCompleteAuthSession();

const PROTECTED_GROUPS = ["(student)", "(counselor)"];
const TEAL = "#0CAF87";
const AnimatedPath = Animated.createAnimatedComponent(Path);

// Redirects to /login whenever a signed-out user is sitting on a protected
// screen — covers sign-out from any screen without each one having to know
// where to navigate afterwards.
function AuthGate({ children }) {
  const { isLoggedIn, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn && PROTECTED_GROUPS.includes(segments[0])) {
      router.replace("/login");
    }
  }, [isLoggedIn, loading, segments, router]);

  return children;
}

// Branded boot screen — mirrors the native splash (teal pulse badge on
// #020617) so the transition from native splash into JS is seamless, then
// layers in a breathing glow, a fade-up wordmark, and a drawing heartbeat
// line so the wait reads as "alive" rather than a bare spinner.
function AppSplash() {
  const pulse   = useRef(new Animated.Value(0)).current;
  const reveal  = useRef(new Animated.Value(0)).current;
  const heartbeat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.timing(reveal, {
      toValue: 1, duration: 700, delay: 150,
      easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(heartbeat, { toValue: 1, duration: 1600, easing: Easing.linear, useNativeDriver: false })
    ).start();
  }, []);

  const badgeScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] });
  const glowScale  = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  const dashOffset = heartbeat.interpolate({ inputRange: [0, 1], outputRange: [420, -420] });

  return (
    <View style={splashStyles.root}>
      <View style={splashStyles.badgeWrap}>
        <Animated.View
          style={[
            splashStyles.glow,
            { transform: [{ scale: glowScale }], opacity: glowOpacity },
          ]}
        />
        <Animated.View style={[splashStyles.badge, { transform: [{ scale: badgeScale }] }]}>
          <MaterialCommunityIcons name="pulse" size={38} color="#FFF" />
        </Animated.View>
      </View>

      <Animated.View
        style={{
          opacity: reveal,
          transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
        }}
      >
        <Text style={splashStyles.wordmark}>
          Lima<Text style={{ color: TEAL }}>Health</Text>
        </Text>
        <Text style={splashStyles.tagline}>Whole-person wellbeing</Text>
      </Animated.View>

      <View style={splashStyles.ecgWrap}>
        <Svg width={160} height={36} viewBox="0 0 160 36">
          <AnimatedPath
            d="M0 18 L38 18 L48 4 L60 32 L70 10 L80 22 L90 18 L160 18"
            stroke={TEAL}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={[70, 350]}
            strokeDashoffset={dashOffset}
          />
        </Svg>
      </View>
    </View>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    // Artificial splash delay or asset loading can happen here
    const timer = setTimeout(() => setAppIsReady(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!appIsReady) {
    return <AppSplash />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <HeroChromeProvider>
              <ThemedShell>
                <AuthGate>
                  <Stack screenOptions={{ headerShown: false }}>
                    {/* Public Routes */}
                    <Stack.Screen name="index" />
                    <Stack.Screen name="login" />
                    <Stack.Screen name="change-password" />

                    {/* Protected Groups */}
                    <Stack.Screen name="(student)" />
                    <Stack.Screen name="(counselor)" />
                  </Stack>
                </AuthGate>
              </ThemedShell>
            </HeroChromeProvider>
          </GestureHandlerRootView>
          {/* Toast must be at the very root level to show over everything */}
          <Toast />
        </SafeAreaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Signed-in screens follow the chosen appearance; the public auth screens
// (landing, login, change-password) draw their own full-bleed light layouts.
function ThemedShell({ children }) {
  const { colors } = useTheme();
  const { heroActive } = useHeroChrome();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: heroActive ? 0 : insets.top }}>
      <StatusBar
        barStyle={heroActive ? "light-content" : colors.statusBar}
        backgroundColor="transparent"
        translucent
      />
      {children}
    </View>
  );
}

const splashStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeWrap: {
    width: 96, height: 96,
    justifyContent: "center", alignItems: "center",
    marginBottom: 28,
  },
  glow: {
    position: "absolute",
    width: 96, height: 96, borderRadius: 28,
    backgroundColor: TEAL,
  },
  badge: {
    width: 76, height: 76, borderRadius: 22,
    backgroundColor: TEAL,
    justifyContent: "center", alignItems: "center",
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14,
    elevation: 8,
  },
  wordmark: {
    fontSize: 26, fontWeight: "800", color: "#F8FAFC",
    textAlign: "center", letterSpacing: -0.4,
  },
  tagline: {
    fontSize: 13, color: "#94A3B8", fontWeight: "600",
    textAlign: "center", marginTop: 6,
  },
  ecgWrap: { marginTop: 30, opacity: 0.9 },
});
