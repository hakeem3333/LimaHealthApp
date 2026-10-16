import React, { useState } from "react";
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, StatusBar, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, {
  Circle, Ellipse, Path, G, Line, Defs, RadialGradient, Stop,
} from "react-native-svg";
import { ORG_THEMES } from "../utils/orgTheme";

const ORG_KEYS = Object.keys(ORG_THEMES); // ["SCHOOL", "COMPANY", "HOSPITAL", "NGO"]

// The "Care Provider"-tier card/art needs a second colour that contrasts with
// whichever org colour is driving the "Member"-tier side, so the two options
// stay visually distinct no matter which org is picked (e.g. COMPANY's own
// brand colour is the same purple the provider side used to be hardcoded to).
const PROVIDER_ACCENTS = {
  SCHOOL:   { primary: "#6C5CE7", light: "#EEE9FD", mid: "#D1C8F8" }, // purple
  COMPANY:  { primary: "#0D3B7A", light: "#E6EDF7", mid: "#9FB6D9" }, // navy
  HOSPITAL: { primary: "#0CAF87", light: "#E8F8F3", mid: "#C6EEE3" }, // teal
  NGO:      { primary: "#0D3B7A", light: "#E6EDF7", mid: "#9FB6D9" }, // navy
};

const { width, height } = Dimensions.get("window");
const CARD_SIZE = (width - 48 - 12) / 2;

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:          "#FFFFFF",
  teal:        "#0CAF87",
  tealLight:   "#E8F8F3",
  tealMid:     "#C6EEE3",
  purple:      "#6C5CE7",
  purpleLight: "#EEE9FD",
  purpleMid:   "#D1C8F8",
  navy:        "#0D3B7A",
  amber:       "#F9A825",
  textPrimary: "#1B2A3B",
  textSecond:  "#5F6B7A",
  textMuted:   "#94A3B8",
  border:      "#EDF2F7",
};

// ── Background SVG art ────────────────────────────────────────────────────────
// colorA follows the selected org's brand colour; colorB is its paired
// "Care Provider" contrast colour (see PROVIDER_ACCENTS above).
function BackgroundArt({ colorA, colorB }) {
  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Defs>
        {/* Top-right blob */}
        <RadialGradient id="blobA" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor={colorA} stopOpacity="0.13" />
          <Stop offset="100%" stopColor={colorA} stopOpacity="0"    />
        </RadialGradient>
        {/* Bottom-left blob */}
        <RadialGradient id="blobB" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor={colorB} stopOpacity="0.10" />
          <Stop offset="100%" stopColor={colorB} stopOpacity="0"    />
        </RadialGradient>
        {/* Centre ambient glow */}
        <RadialGradient id="blobCenter" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor={colorA} stopOpacity="0.05" />
          <Stop offset="100%" stopColor={colorA} stopOpacity="0"    />
        </RadialGradient>
      </Defs>

      {/* ── Organic blobs ── */}
      <Ellipse cx={width + 30} cy={-30}   rx={220} ry={200} fill="url(#blobA)"   />
      <Ellipse cx={-60}        cy={height * 0.72} rx={180} ry={160} fill="url(#blobB)" />
      <Ellipse cx={width / 2}  cy={height * 0.45} rx={160} ry={120} fill="url(#blobCenter)" />

      {/* ── Dot grid (top-right quadrant) ── */}
      {Array.from({ length: 6 }).map((_, row) =>
        Array.from({ length: 5 }).map((_, col) => (
          <Circle
            key={`dot-${row}-${col}`}
            cx={width - 28 - col * 18}
            cy={60 + row * 18}
            r={1.6}
            fill={colorA}
            opacity={0.18}
          />
        ))
      )}

      {/* ── Dot grid (bottom-left quadrant) ── */}
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 4 }).map((_, col) => (
          <Circle
            key={`dot2-${row}-${col}`}
            cx={16 + col * 18}
            cy={height * 0.78 + row * 18}
            r={1.6}
            fill={colorB}
            opacity={0.15}
          />
        ))
      )}

      {/* ── Heartbeat / ECG line (decorative) ── */}
      <Path
        d={`M 0 ${height * 0.3}
            L ${width * 0.2}  ${height * 0.3}
            L ${width * 0.27} ${height * 0.3 - 22}
            L ${width * 0.30} ${height * 0.3 + 28}
            L ${width * 0.33} ${height * 0.3 - 36}
            L ${width * 0.37} ${height * 0.3 + 14}
            L ${width * 0.41} ${height * 0.3}
            L ${width}        ${height * 0.3}`}
        stroke={colorA}
        strokeWidth={1.2}
        strokeOpacity={0.12}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ── Faint medical cross — top left ── */}
      <G opacity={0.08} transform={`translate(22, 130)`}>
        <Line x1="0" y1="10" x2="20" y2="10" stroke={colorA} strokeWidth={4} strokeLinecap="round" />
        <Line x1="10" y1="0" x2="10" y2="20" stroke={colorA} strokeWidth={4} strokeLinecap="round" />
      </G>

      {/* ── Faint medical cross — bottom right ── */}
      <G opacity={0.07} transform={`translate(${width - 44}, ${height * 0.68})`}>
        <Line x1="0" y1="10" x2="20" y2="10" stroke={colorB} strokeWidth={4} strokeLinecap="round" />
        <Line x1="10" y1="0" x2="10" y2="20" stroke={colorB} strokeWidth={4} strokeLinecap="round" />
      </G>

      {/* ── Floating ring accents ── */}
      <Circle cx={width - 22}  cy={height * 0.52} r={28} stroke={colorA} strokeWidth={1} strokeOpacity={0.1} fill="none" />
      <Circle cx={width - 22}  cy={height * 0.52} r={18} stroke={colorA} strokeWidth={1} strokeOpacity={0.07} fill="none" />
      <Circle cx={32}          cy={height * 0.22} r={22} stroke={colorB} strokeWidth={1} strokeOpacity={0.1} fill="none" />

      {/* ── Tiny scattered health icons (as circles with inner dot) ── */}
      <Circle cx={width * 0.14} cy={height * 0.12} r={3.5} fill={colorA} opacity={0.14} />
      <Circle cx={width * 0.88} cy={height * 0.18} r={2.5} fill={colorB} opacity={0.13} />
      <Circle cx={width * 0.08} cy={height * 0.58} r={4}   fill={colorA} opacity={0.10} />
      <Circle cx={width * 0.94} cy={height * 0.65} r={3}   fill={colorB} opacity={0.11} />
      <Circle cx={width * 0.50} cy={height * 0.08} r={2.5} fill={colorA} opacity={0.10} />

      {/* ── Bottom arc ── */}
      <Path
        d={`M 0 ${height} Q ${width / 2} ${height * 0.88} ${width} ${height}`}
        fill={colorA}
        opacity={0.04}
      />
    </Svg>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function LimaLanding() {
  const router = useRouter();

  const [orgIndex, setOrgIndex] = useState(0);
  const orgKey       = ORG_KEYS[orgIndex];
  const orgTheme     = ORG_THEMES[orgKey];
  const providerTheme = PROVIDER_ACCENTS[orgKey];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* SVG background art — rendered absolutely behind everything */}
      <BackgroundArt colorA={orgTheme.primary} colorB={providerTheme.primary} />

      <SafeAreaView style={styles.safe}>

        {/* ── Logo ── */}
        <View style={styles.logoRow}>
          <View style={[styles.logoMark, { backgroundColor: orgTheme.primary }]}>
            <MaterialCommunityIcons name="pulse" size={16} color="#FFF" />
          </View>
          <Text style={styles.logoText}>
            Lima<Text style={{ color: orgTheme.primary }}>Health</Text>
          </Text>
        </View>

        {/* ── Org type picker ── */}
        <View style={styles.orgSwitcherWrap}>
          <View style={styles.orgSwitcher}>
            {ORG_KEYS.map((key, i) => {
              const t = ORG_THEMES[key];
              const active = i === orgIndex;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setOrgIndex(i)}
                  style={[
                    styles.orgSwitcherBtn,
                    active && { backgroundColor: t.primary, shadowColor: t.primary },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={t.icon}
                    size={16}
                    color={active ? "#FFF" : C.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.orgSwitcherLabel}>Pick your organisation type</Text>
          <Text style={[styles.orgSwitcherName, { color: orgTheme.primary }]}>{orgTheme.orgLabel}</Text>
        </View>

        {/* ── Headline ── */}
        <View style={styles.headline}>
          <Text style={styles.welcome}>Welcome to LimaHealth</Text>
          <Text style={styles.sub}>Which describes you best?</Text>
        </View>

        {/* ── Role cards ── */}
        <View style={styles.cards}>

          {/* Member */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.82}
            onPress={() => router.push({ pathname: "/login", params: { role: "member", orgType: ORG_KEYS[orgIndex] } })}
          >
            <LinearGradient
              colors={[orgTheme.accent, orgTheme.secondary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.cardIllustration}
            >
              {/* Mini SVG inside card illustration */}
              <Svg width={CARD_SIZE} height={CARD_SIZE} style={StyleSheet.absoluteFill} pointerEvents="none">
                <Circle cx={CARD_SIZE * 0.85} cy={CARD_SIZE * 0.15} r={30} fill={orgTheme.primary} opacity={0.12} />
                <Circle cx={CARD_SIZE * 0.1}  cy={CARD_SIZE * 0.82} r={20} fill={orgTheme.primary} opacity={0.08} />
                <Path
                  d={`M 0 ${CARD_SIZE * 0.6} Q ${CARD_SIZE * 0.5} ${CARD_SIZE * 0.4} ${CARD_SIZE} ${CARD_SIZE * 0.6}`}
                  fill={orgTheme.primary} opacity={0.07}
                />
              </Svg>
              <MaterialCommunityIcons name="account-heart-outline" size={48} color={orgTheme.primary} />
            </LinearGradient>
            <View style={styles.cardLabel}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>{orgTheme.memberLabel}</Text>
                <Text style={[styles.cardArrow, { color: orgTheme.primary }]}> →</Text>
              </View>
              <Text style={styles.cardDesc}>Track vitals & book support</Text>
            </View>
          </TouchableOpacity>

          {/* Care Provider */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.82}
            onPress={() => router.push({ pathname: "/login", params: { role: "counselor", orgType: ORG_KEYS[orgIndex] } })}
          >
            <LinearGradient
              colors={[providerTheme.light, providerTheme.mid]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.cardIllustration}
            >
              <Svg width={CARD_SIZE} height={CARD_SIZE} style={StyleSheet.absoluteFill} pointerEvents="none">
                <Circle cx={CARD_SIZE * 0.12} cy={CARD_SIZE * 0.15} r={28} fill={providerTheme.primary} opacity={0.12} />
                <Circle cx={CARD_SIZE * 0.88} cy={CARD_SIZE * 0.80} r={18} fill={providerTheme.primary} opacity={0.08} />
                <Path
                  d={`M 0 ${CARD_SIZE * 0.65} Q ${CARD_SIZE * 0.5} ${CARD_SIZE * 0.45} ${CARD_SIZE} ${CARD_SIZE * 0.65}`}
                  fill={providerTheme.primary} opacity={0.07}
                />
              </Svg>
              <MaterialCommunityIcons name="stethoscope" size={48} color={providerTheme.primary} />
            </LinearGradient>
            <View style={styles.cardLabel}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>{orgTheme.supportLabel}</Text>
                <Text style={[styles.cardArrow, { color: providerTheme.primary }]}> →</Text>
              </View>
              <Text style={styles.cardDesc}>Insights & sessions</Text>
            </View>
          </TouchableOpacity>

        </View>

        {/* ── Org pills ── */}
        <Text style={styles.pillsLabel}>Works for any organisation</Text>
        <View style={styles.pillsRow}>
          {[
            { label: "Schools",   icon: "school-outline",     color: C.teal    },
            { label: "Companies", icon: "briefcase-outline",  color: C.purple  },
            { label: "Hospitals", icon: "hospital-building",  color: C.navy    },
            { label: "NGOs",      icon: "hand-heart-outline", color: "#B45309" },
          ].map((p) => (
            <View key={p.label} style={styles.pill}>
              <MaterialCommunityIcons name={p.icon} size={13} color={p.color} />
              <Text style={[styles.pillText, { color: p.color }]}>{p.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <View style={styles.footerInner}>
            <View style={[styles.footerLogoMark, { backgroundColor: orgTheme.primary }]}>
              <MaterialCommunityIcons name="pulse" size={11} color="#FFF" />
            </View>
            <Text style={styles.footerBrand}>LimaHealth</Text>
            <View style={styles.footerDot} />
            <MaterialCommunityIcons name="shield-lock-outline" size={12} color={C.textMuted} />
            <Text style={styles.footerText}>AES-256 encrypted</Text>
          </View>
          <Text style={styles.copyright}>
            © {new Date().getFullYear()} LimaHealth Technologies. All rights reserved.
          </Text>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  safe: { flex: 1, paddingHorizontal: 24 },

  logoRow: { flexDirection: "row", alignItems: "center", marginTop: 20 },
  logoMark: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: C.teal,
    justifyContent: "center", alignItems: "center", marginRight: 8,
  },
  logoText: { fontSize: 16, fontWeight: "800", color: C.textPrimary, letterSpacing: 0.2 },

  orgSwitcherWrap: { alignItems: "center", marginTop: 28 },
  orgSwitcher: {
    flexDirection: "row", gap: 4, padding: 4,
    backgroundColor: C.bg, borderRadius: 16,
    borderWidth: 1, borderColor: C.border,
  },
  orgSwitcherBtn: {
    width: 34, height: 34, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 3,
  },
  orgSwitcherLabel: {
    fontSize: 10, fontWeight: "700", textTransform: "uppercase",
    letterSpacing: 0.4, marginTop: 8, color: C.textMuted,
  },
  orgSwitcherName: {
    fontSize: 13, fontWeight: "800", marginTop: 2,
  },

  headline: { marginTop: 28, marginBottom: 40, alignItems: "center" },
  welcome: { fontSize: 26, fontWeight: "800", color: C.textPrimary, textAlign: "center", letterSpacing: -0.4 },
  sub: { fontSize: 16, color: C.textSecond, marginTop: 8, textAlign: "center" },

  cards: { flexDirection: "row", gap: 12, justifyContent: "center" },
  card: {
    width: CARD_SIZE,
    backgroundColor: C.bg,
    borderRadius: 18,
    borderWidth: 1, borderColor: C.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  cardIllustration: {
    width: "100%", height: CARD_SIZE,
    justifyContent: "center", alignItems: "center",
    borderBottomWidth: 1, borderBottomColor: C.border,
    overflow: "hidden",
  },
  cardLabel: { padding: 14 },
  cardTitleRow: { flexDirection: "row", alignItems: "center" },
  cardTitle: { fontSize: 15, fontWeight: "700", color: C.textPrimary },
  cardArrow: { fontSize: 15, fontWeight: "700" },
  cardDesc: { fontSize: 12, color: C.textSecond, marginTop: 3 },

  pillsLabel: {
    textAlign: "center", fontSize: 12, color: C.textMuted,
    marginTop: 36, marginBottom: 12, fontWeight: "600", letterSpacing: 0.3,
  },
  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, backgroundColor: "#F8FAFC",
    borderWidth: 1, borderColor: C.border,
  },
  pillText: { fontSize: 12, fontWeight: "600" },

  footer: { marginTop: "auto", paddingBottom: 24, paddingTop: 8, alignItems: "center", gap: 10 },
  footerDivider: { width: 40, height: 1, backgroundColor: C.border, borderRadius: 1, marginBottom: 4 },
  footerInner: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerLogoMark: {
    width: 18, height: 18, borderRadius: 5,
    backgroundColor: C.teal,
    justifyContent: "center", alignItems: "center",
  },
  footerBrand: { fontSize: 12, fontWeight: "800", color: C.textPrimary, letterSpacing: 0.1 },
  footerDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: C.border, marginHorizontal: 2 },
  footerText: { fontSize: 12, color: C.textMuted },
  copyright: { fontSize: 10, color: C.textMuted, textAlign: "center", letterSpacing: 0.2 },
});
