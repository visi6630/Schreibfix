import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const sections = [
  {
    title: "Rechtschreibung",
    icon: "✏️",
    items: ["Lückentext", "Richtig oder falsch?", "Wörter sortieren"],
  },
  {
    title: "Grammatik",
    icon: "📖",
    items: ["Verben konjugieren", "Der / Die / Das?", "Einzahl & Mehrzahl", "Satzglieder"],
  },
];

export default function UebungenScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.heading}>Übungen</Text>

        {sections.map(({ title, icon, items }) => (
          <View key={title} style={s.card}>
            <Text style={s.sectionTitle}>
              {icon}  {title}
            </Text>
            {items.map((item) => (
              <TouchableOpacity key={item} style={s.row} disabled activeOpacity={0.7}>
                <Text style={s.rowText}>{item}</Text>
                <Text style={s.soon}>Bald!</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <Text style={s.note}>🦊 Schreibfix arbeitet noch an diesen Übungen!</Text>
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
  row: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderWidth: 2, borderColor: "#F3F4F6", borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, opacity: 0.6,
  },
  rowText: { fontSize: 16, fontWeight: "700" },
  soon: { fontSize: 11, color: "#9CA3AF", fontWeight: "600" },
  note: { textAlign: "center", color: "#9CA3AF", fontSize: 13, marginTop: 8 },
});
