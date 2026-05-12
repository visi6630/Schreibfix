# Schreibfix

German spelling learning app for children.

## Stack

- **Monorepo**: npm workspaces + Turborepo
- **Web**: Next.js 14 — `apps/web` (`@schreibfix/web`), runs on `localhost:3001`
- **Mobile**: Expo 52 — `apps/mobile` (`@schreibfix/mobile`)
- **Shared**: `packages/core` (`@schreibfix/core`) — types, content, exercises, Supabase client, spaced repetition

## Backend

- **Supabase** — URL and anon/service keys in `apps/web/.env.local`
- **Auth**: Supabase email auth, `/auth` page, protected routes via `ProtectedPage` component
- **Database tables**: `profiles`, `progress`, `weak_words` (all with RLS enabled)
  - `profiles`: `id` (UUID = auth.uid()), `klasse` (smallint 1–4, nullable), `is_admin` (boolean), `email` (text), `registered_at` (timestamptz), `last_seen` (timestamptz), `vorname` (text), `nachname` (text), `avatar` (text default '🦊')
    - Migration for profile columns: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vorname TEXT; ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nachname TEXT; ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '🦊';`
  - `progress`: `id`, `user_id`, `lesson_id`, `score`, `stars`, `completed_at`
    - Diktat rows: `lesson_id` like `"k1-tiere"`, `"k2-essen"`, etc.
    - Grammar rows: `lesson_id` like `"grammatik-verben"`, `"grammatik-adjektive"`, etc.
  - `weak_words`: `id` (UUID), `user_id` (UUID), `word` (text), `sentence_id` (text),
    `wrong_count` (int), `last_seen` (timestamptz), `next_review` (timestamptz)
    - Unique constraint on `(user_id, word)` for upsert
    - Migration: `CREATE TABLE weak_words (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id UUID REFERENCES auth.users(id), word TEXT NOT NULL, sentence_id TEXT NOT NULL, wrong_count INT DEFAULT 1, last_seen TIMESTAMPTZ DEFAULT now(), next_review TIMESTAMPTZ DEFAULT now(), UNIQUE(user_id, word));`

## AI Integration

- **API key**: `ANTHROPIC_API_KEY` in `apps/web/.env.local` (server-side only)
- **Server functions**: `apps/web/lib/ai-content.ts` — four typed functions using `claude-haiku-4-5-20251001`
  - `generateDiktatSentences(grade, weakWords, topic?)` → `DiktatSentenceAI[]`
  - `generateVerbConjugation(grade, count)` → `VerbConjugationAI[]`
  - `generateArtikelExercises(grade, count)` → `ArtikelExerciseAI[]`
  - `generateReadingText(grade, topic?)` → `ReadingTextAI`
  - All functions have fallback to static content on error
- **API routes** in `apps/web/app/api/ai/`:
  - `POST /api/ai/diktat` — called by LessonPickerClient for KI-Diktat
  - `POST /api/ai/verben` — called by UebungenClient for AI verb exercises
  - `POST /api/ai/artikel` — called by UebungenClient for AI artikel exercises
  - `POST /api/ai/lesen` — called by LesenClient for AI reading texts
  - `POST /api/ai/encouragement` — called by ElternClient for parent dashboard text

## Features

### Diktat (`/diktat`)
- Lesson picker: all 20 lessons grouped by Klasse (1–4), shows stars if completed
- **KI-Diktat**: special purple card at top — calls Claude API for 5 fresh sentences tailored to child's grade and weak words; loading spinner shown while waiting
- **Meine Schwächen**: special lesson shown if user has weak words — uses the 5 most-wrong sentences from `weak_words` table
- Per-lesson: TTS playback, word-by-word checking, XP and stars
- Auto-plays TTS when advancing to next sentence; Überprüfen button always visible
- Saves result to Supabase `progress` table on completion
- Saves misspelled words to `weak_words` table (upsert with wrong_count increment)

### Übungen (`/uebungen`)
- Nine exercise types shown as hub cards (3×3 grid), grouped into Grammatik and Rechtschreibung
- 5 exercises per session, random selection from pool filtered to user's Klasse
- "Zufällige Übung" button picks a random exercise type
- **🤖 Neue Aufgaben** button on Verbkonjugation and Artikel cards — calls Claude API for fresh exercises
- **Grammatik section** (6 types):
  - **Verbkonjugation**: 22 exercises (Klasse 1–3)
  - **Artikel (Der/Die/Das)**: 31 nouns with emoji (Klasse 1–4)
  - **Einzahl & Mehrzahl**: 22 exercises (Klasse 1–4)
  - **Adjektiv-Steigerung**: 22 adjectives — Komparativ & Superlativ (Klasse 2–4)
  - **Wortarten**: 30 words — Nomen / Verb / Adjektiv / Artikel (Klasse 1–4)
  - **Präteritum**: 25 exercises — common irregular verbs (Klasse 3–4)
- **Rechtschreibung section** (3 types):
  - **Satzzeichen**: 25 sentences — pick . / ? / ! (Klasse 1–4)
  - **Großschreibung**: 25 sentences — find the incorrectly lowercased noun (Klasse 1–4)
  - **Satzbau**: 20 scrambled sentences — pick the correct word order (Klasse 2–4)
- Immediate feedback (green/red), explanation shown after each answer
- XP award (5 XP per correct answer), saves to Supabase on session completion
- Grammar lesson IDs: `grammatik-verben`, `grammatik-artikel`, `grammatik-plural`,
  `grammatik-adjektive`, `grammatik-wortarten`, `grammatik-zeitformen`,
  `grammatik-satzzeichen`, `grammatik-grossschreibung`, `grammatik-satzbau`

### Lesen (`/lesen`)
- Generates a fresh AI reading text appropriate for child's grade on each load
- Text displayed at 22px+ with title; "Schreibfix denkt nach…" loading state
- 3 comprehension questions with 3 multiple-choice answers (wrong options built from other answers)
- **Laut vorlesen** (Web Speech API, de-DE): voice input mode that records the child reading the text and highlights correct/wrong words in green/red; fluency score shown
- Voice feature silently hidden if Web Speech API not supported
- Saves to Supabase `progress` table with `lesson_id = "lesen-ai"` (10 XP per correct question)
- 4th tab in bottom navigation

### Fortschritt (`/fortschritt`)
- Total XP with level titles: Junger Fuchs → Neugieriger → Fleißiger → Schlauer → Toller → Super-Fuchs → Schreibfix-Held (500 XP)
- XP bar showing progress to next level
- Weekly streak counter (🔥) based on active days
- Motivational fox message based on XP level
- Separate sections for Diktat and Grammatik results

### Home (`/`)
- First-login grade selector: "In welche Klasse gehst du?" (1–4), saved to `profiles.klasse`
- Grade badge displayed on home screen after selection
- "Klasse ändern" link to re-select grade
- Lesson/exercise content filtered to match selected grade
- Small "Elternportal" link in footer

### Elternportal (`/eltern`)
- Accessible via small footer link on home screen
- Professional design (white, clean) — different from child UI but same brand colors
- Shows: total XP, Klasse, weekly exercise count, current level title
- AI-generated encouragement text (Claude) based on progress data
- Bar chart of daily activity (last 7 days)
- Top 5 most misspelled words with frequency bars
- List of 10 most recent exercises with date and score

## Design

- Primary color: orange `#F97316`
- Success color: green `#22C55E`
- Font: Nunito
- All UI in German, child-friendly
- CSS utility classes: `.btn-primary`, `.btn-secondary`, `.card`

## Static Content Pools (packages/core/src/content/)

- `verb-conjugation-pool.ts` — 80 conjugation exercises, `getRandomVerbExercises(n)`
- `artikel-pool.ts` — 100 der/die/das exercises, `getRandomArtikelExercises(n, maxKlasse?)`
- `reading-texts-pool.ts` — 20 reading texts per grade (80 total), `getRandomReadingTexts(n, klasse?)`
- Used as fallback in `ai-content.ts` when Claude API call fails

## Dev

```bash
# Run web only
npm run web

# Run all apps
npm run dev

# After any package changes or directory moves
npm install   # always run from project root

# Rebuild core package after changing packages/core/src/**
cd packages/core && npm run build
```

## Vercel Deployment

- `vercel.json` at project root — builds only `apps/web` via `turbo run build --filter=@schreibfix/web`
- Turbo's dependency graph ensures `packages/core` is built first (before `apps/web`)
- **Vercel dashboard**: Root Directory must be set to `/` (project root, not `apps/web`)
- Output directory: `apps/web/.next` (Vercel's Root Directory must be `/`; the build runs from root so the full relative path is needed)
- **Required Vercel environment variables**:
  - `ANTHROPIC_API_KEY` — Claude AI features (Diktat, Übungen, Lesen, Elternportal)
  - `ELEVENLABS_API_KEY` — ElevenLabs TTS (Charlotte voice, ID: `XB0fDUnXU5powFXDhCwa`); falls back to Web Speech API if missing
  - `SUPABASE_SERVICE_ROLE_KEY` — service role key (Project Settings → API); used server-side to bypass RLS for admin checks (`/api/check-admin`)

## Deploy Check Script

```bash
node scripts/check-deploy.mjs
```

Reads the latest Vercel deployment via the Vercel API. If the deployment failed it prints
the last 100 lines of the build log. Requires `VERCEL_TOKEN` and `VERCEL_PROJECT_ID` set in
`apps/web/.env.local` (see placeholders already added there).

**When a deployment fails**: paste the Vercel error log here with the message
"Fix this Vercel deployment error" — Claude Code reads CLAUDE.md and will fix it automatically.

## Git

Remote: https://github.com/visi6630/Schreibfix.git
