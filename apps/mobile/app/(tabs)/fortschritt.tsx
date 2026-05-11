import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const badges = [
  { icon: "🎙️", label: "Erstes Diktat", earned: true },
  { icon: "⭐", label: "3 Sterne",       earned: false },
  { icon: "🔥", label: "7 Tage dabei",  earned: false },
  { icon: "🏆", label: "Perfekt!",      earned: false },
];

export default function FortschrittScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.heading}>Mein Fortschritt</Text>

        {/* XP card */}
        <View style={s.card}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <Text style={{ fontSize: 48 }}>🦊</Text>
            <View>
              <Text style={{ color: "#9CA3AF", fontWeight: "700" }}>Level 1 · Junger Fuchs</Text>
              <Text style={{ color: "#F97316", fontSize: 28, fontWeight: "900" }}>0 XP</Text>
            </View>
          </View>
          <View style={s.progressBg}>
            <View style={[s.progressBar, { width: "0%" }]} />
          </View>
          <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 4 }}>0 / 100 XP bis Level 2</Text>
        </View>

        {/* Streak card */}
        <View style={[s.card, { flexDirection: "row", alignItems: "center", gap: 16 }]}>
          <Text style={{ fontSize: 40 }}>🔥</Text>
          <View>
            <Text style={{ fontSize: 20, fontWeight: "900" }}>0 Tage</Text>
            <Text style={{ color: "#6B7280" }}>Deine aktuelle Streak</Text>
          </View>
        </View>

        {/* Badges */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Abzeichen</Text>
          <View style={s.badgeGrid}>
            {badges.map(({ icon, label, earned }) => (
              <View key={label} style={s.badge}>
                <Text style={[s.badgeIcon, !earned && s.badgeLocked]}>{icon}</Text>
                <Text style={s.badgeLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFBEB" },
  scroll: { padding: 20 },
  heading: { fontSize: 26, fontWeight: "900", color: "#F97316", marginBottom: 20 },
  card: {
    backgroundColor: "white", borderRadius: 20, padding: 16, marginBottom: 16,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: "900", marginBottom: 12 },
  progressBg: { height: 12, borderRadius: 10, backgroundColor: "#FED7AA", overflow: "hidden" },
  progressBar: { height: 12, backgroundColor: "#F97316", borderRadius: 10 },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  badge: { alignItems: "center", width: 72 },
  badgeIcon: { fontSize: 36, backgroundColor: "#FED7AA", borderRadius: 14, padding: 8, overflow: "hidden" },
  badgeLocked: { opacity: 0.25, backgroundColor: "#F3F4F6" },
  badgeLabel: { fontSize: 11, color: "#6B7280", textAlign: "center", marginTop: 4 },
});
