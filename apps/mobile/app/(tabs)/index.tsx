import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const cards = [
  { route: "/(tabs)/diktat",      icon: "🎙️", title: "Diktat",      desc: "Hör zu und schreib nach!" },
  { route: "/(tabs)/uebungen",    icon: "✏️", title: "Übungen",     desc: "Rechtschreibung & Grammatik" },
  { route: "/(tabs)/fortschritt", icon: "⭐", title: "Fortschritt", desc: "Deine Punkte & Sterne" },
] as const;

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.foxEmoji}>🦊</Text>
        <Text style={styles.title}>Hallo! Ich bin der Schreibfix.</Text>
        <Text style={styles.subtitle}>Was möchtest du heute lernen?</Text>

        {cards.map(({ route, icon, title, desc }) => (
          <TouchableOpacity
            key={route}
            style={styles.card}
            onPress={() => router.push(route as Parameters<typeof router.push>[0])}
            activeOpacity={0.8}
          >
            <Text style={styles.cardIcon}>{icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardDesc}>{desc}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFBEB" },
  scroll: { padding: 20, alignItems: "center" },
  foxEmoji: { fontSize: 72, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "900", color: "#F97316", textAlign: "center" },
  subtitle: { fontSize: 16, color: "#6B7280", marginBottom: 28, textAlign: "center" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    gap: 14,
  },
  cardIcon: { fontSize: 40 },
  cardTitle: { fontSize: 18, fontWeight: "900" },
  cardDesc: { fontSize: 14, color: "#6B7280" },
  arrow: { fontSize: 28, color: "#D1D5DB" },
});
