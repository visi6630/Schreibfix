import { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Speech from "expo-speech";
import { sampleDiktatLesson, checkDiktatAnswer, starsLabel } from "@schreibfix/core";

const lesson = sampleDiktatLesson;

type Phase = "intro" | "typing" | "result" | "done";

type SentenceState = {
  typed: string;
  result?: ReturnType<typeof checkDiktatAnswer>;
};

function speakGerman(text: string, rate = 0.75) {
  Speech.stop();
  Speech.speak(text, { language: "de-DE", rate });
}

export default function DiktatScreen() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [states, setStates] = useState<SentenceState[]>(
    lesson.sentences.map(() => ({ typed: "" }))
  );
  const inputRef = useRef<TextInput>(null);

  const current = lesson.sentences[index];
  const currentState = states[index];

  const speak = () => {
    speakGerman(current?.text ?? "");
    setPhase("typing");
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const handleSubmit = () => {
    if (!current || !currentState) return;
    const result = checkDiktatAnswer(
      currentState.typed,
      current.text,
      lesson.xpReward / lesson.sentences.length
    );
    setStates((prev) =>
      prev.map((s, i) => (i === index ? { ...s, result } : s))
    );
    setPhase("result");
  };

  const handleNext = () => {
    if (index + 1 < lesson.sentences.length) {
      setIndex((i) => i + 1);
      setPhase("typing");
      setTimeout(() => {
        speakGerman(lesson.sentences[index + 1]?.text ?? "");
        inputRef.current?.focus();
      }, 300);
    } else {
      setPhase("done");
    }
  };

  const totalXp = states.reduce((s, x) => s + (x.result?.xpEarned ?? 0), 0);

  // ── INTRO ───────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.bigFox}>🦊</Text>
          <Text style={s.heroTitle}>{lesson.title}</Text>
          <Text style={s.heroSub}>Klasse {lesson.klasse} · {lesson.sentences.length} Sätze</Text>
          <Text style={[s.heroSub, { marginBottom: 32 }]}>
            Ich lese dir einen Satz vor.{"\n"}Hör gut zu und schreib ihn auf!
          </Text>
          <TouchableOpacity style={s.btnPrimary} onPress={speak} activeOpacity={0.8}>
            <Text style={s.btnPrimaryText}>🎙️  Los geht's!</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── DONE ────────────────────────────────────────────────────────────────
  if (phase === "done") {
    const avg = states.reduce((sum, x) => sum + (x.result?.score ?? 0), 0) / lesson.sentences.length;
    const stars: 0 | 1 | 2 | 3 = avg === 100 ? 3 : avg >= 70 ? 2 : avg >= 40 ? 1 : 0;
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll}>
          <Text style={s.bigFox}>{stars === 3 ? "🦊🎉" : "🦊💪"}</Text>
          <Text style={s.heroTitle}>Diktat fertig!</Text>
          <Text style={[s.heroSub, { marginBottom: 8 }]}>{starsLabel(stars)}</Text>
          <Text style={{ color: "#F97316", fontWeight: "900", fontSize: 18, marginBottom: 24 }}>
            +{Math.round(totalXp)} XP verdient!
          </Text>

          {lesson.sentences.map((sent, i) => (
            <View key={sent.id} style={s.resultRow}>
              <Text style={s.resultLabel}>Satz {i + 1}: </Text>
              <Text style={{ color: (states[i]?.result?.score ?? 0) === 100 ? "#15803D" : "#DC2626", fontWeight: "700" }}>
                {states[i]?.result?.score ?? 0}%
              </Text>
            </View>
          ))}

          <TouchableOpacity
            style={[s.btnPrimary, { marginTop: 24 }]}
            onPress={() => {
              setIndex(0);
              setPhase("intro");
              setStates(lesson.sentences.map(() => ({ typed: "" })));
            }}
            activeOpacity={0.8}
          >
            <Text style={s.btnPrimaryText}>Nochmal üben</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── TYPING / RESULT ─────────────────────────────────────────────────────
  const result = currentState?.result;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Progress */}
        <View style={{ width: "100%", marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ color: "#9CA3AF", fontSize: 13, fontWeight: "700" }}>
              Satz {index + 1} / {lesson.sentences.length}
            </Text>
          </View>
          <View style={s.progressBg}>
            <View style={[s.progressBar, { width: `${((index) / lesson.sentences.length) * 100}%` }]} />
          </View>
        </View>

        {/* Fox bubble */}
        <View style={s.foxBubble}>
          <Text style={{ fontSize: 36 }}>🦊</Text>
          <Text style={{ flex: 1, fontSize: 15, color: "#374151" }}>
            {phase === "result"
              ? result?.allCorrect
                ? "Perfekt geschrieben! 🎉"
                : "Gut versucht! Schau dir die roten Wörter an."
              : "Hör gut zu und schreib den Satz!"}
          </Text>
        </View>

        {/* TTS buttons */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 16, width: "100%" }}>
          <TouchableOpacity style={[s.btnPrimary, { flex: 1 }]} onPress={speak} activeOpacity={0.8}>
            <Text style={s.btnPrimaryText}>🎙️ Vorlesen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.btnSecondary}
            onPress={() => speakGerman(current?.text ?? "", 0.55)}
            activeOpacity={0.8}
          >
            <Text style={s.btnSecondaryText}>🐢</Text>
          </TouchableOpacity>
        </View>

        {/* Input */}
        <TextInput
          ref={inputRef}
          style={s.input}
          value={currentState?.typed ?? ""}
          onChangeText={(v) =>
            setStates((prev) => prev.map((x, i) => (i === index ? { ...x, typed: v } : x)))
          }
          placeholder="Schreib hier …"
          editable={phase === "typing"}
          autoCorrect={false}
          spellCheck={false}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        {/* Result words */}
        {phase === "result" && result && (
          <View style={s.card}>
            <Text style={s.cardLabel}>Deine Antwort:</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
              {result.words.map((w, i) => (
                <View key={i} style={[s.wordChip, w.correct ? s.chipCorrect : s.chipWrong]}>
                  <Text style={[s.chipText, { color: w.correct ? "#15803D" : "#DC2626" }]}>
                    {w.word || "–"}
                  </Text>
                  {!w.correct && (
                    <Text style={{ fontSize: 10, color: "#6B7280" }}>{w.expected}</Text>
                  )}
                </View>
              ))}
            </View>

            {current?.hint && !result.allCorrect && (
              <View style={s.hint}>
                <Text style={{ color: "#92400E", fontSize: 14 }}>
                  💡 <Text style={{ fontWeight: "700" }}>Tipp:</Text> {current.hint}
                </Text>
              </View>
            )}

            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
              <Text style={{ fontSize: 22 }}>
                {result.stars === 3 ? "⭐⭐⭐" : result.stars === 2 ? "⭐⭐" : result.stars === 1 ? "⭐" : ""}
              </Text>
              <Text style={{ fontWeight: "700", fontSize: 16, marginLeft: 6 }}>
                {starsLabel(result.stars)}
              </Text>
              <Text style={{ marginLeft: "auto", color: "#F97316", fontWeight: "900" }}>
                +{Math.round(result.xpEarned)} XP
              </Text>
            </View>
          </View>
        )}

        {/* Action button */}
        {phase === "typing" && (
          <TouchableOpacity
            style={[s.btnPrimary, { width: "100%", opacity: currentState?.typed.trim() ? 1 : 0.4 }]}
            onPress={handleSubmit}
            disabled={!currentState?.typed.trim()}
            activeOpacity={0.8}
          >
            <Text style={s.btnPrimaryText}>Überprüfen ✓</Text>
          </TouchableOpacity>
        )}

        {phase === "result" && (
          <TouchableOpacity style={[s.btnPrimary, { width: "100%" }]} onPress={handleNext} activeOpacity={0.8}>
            <Text style={s.btnPrimaryText}>
              {index + 1 < lesson.sentences.length ? "Nächster Satz →" : "Ergebnis ansehen 🎉"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFBEB" },
  scroll: { padding: 20, alignItems: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  bigFox: { fontSize: 72, marginBottom: 12 },
  heroTitle: { fontSize: 24, fontWeight: "900", color: "#F97316", textAlign: "center", marginBottom: 8 },
  heroSub: { fontSize: 15, color: "#6B7280", textAlign: "center", marginBottom: 8 },
  btnPrimary: {
    backgroundColor: "#F97316", borderRadius: 18, paddingVertical: 14,
    paddingHorizontal: 28, alignItems: "center",
  },
  btnPrimaryText: { color: "white", fontWeight: "900", fontSize: 17 },
  btnSecondary: {
    borderWidth: 2, borderColor: "#F97316", borderRadius: 18,
    paddingVertical: 14, paddingHorizontal: 18, alignItems: "center",
  },
  btnSecondaryText: { color: "#F97316", fontWeight: "900", fontSize: 17 },
  progressBg: { height: 10, borderRadius: 10, backgroundColor: "#FED7AA", overflow: "hidden" },
  progressBar: { height: 10, backgroundColor: "#F97316", borderRadius: 10 },
  foxBubble: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "white", borderRadius: 20, padding: 14,
    marginBottom: 14, width: "100%",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  input: {
    width: "100%", borderWidth: 2, borderColor: "#E5E7EB", borderRadius: 18,
    paddingHorizontal: 18, paddingVertical: 14, fontSize: 20, fontWeight: "700",
    backgroundColor: "white", marginBottom: 14,
  },
  card: {
    width: "100%", backgroundColor: "white", borderRadius: 20, padding: 16,
    marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardLabel: { fontSize: 12, fontWeight: "700", color: "#9CA3AF" },
  wordChip: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, alignItems: "center" },
  chipCorrect: { backgroundColor: "#BBF7D0" },
  chipWrong: { backgroundColor: "#FEE2E2" },
  chipText: { fontWeight: "700", fontSize: 16 },
  hint: {
    marginTop: 10, borderRadius: 12, backgroundColor: "#FFFBEB",
    borderWidth: 1, borderColor: "#FDE68A", padding: 10,
  },
  resultRow: { flexDirection: "row", marginBottom: 6 },
  resultLabel: { fontSize: 14, color: "#6B7280" },
});
