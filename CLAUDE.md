# Schreibfix

German spelling learning app for children.

## Stack

- **Monorepo**: npm workspaces + Turborepo
- **Web**: Next.js 14 — `apps/web` (`@schreibfix/web`), runs on `localhost:3001`
- **Mobile**: Expo 52 — `apps/mobile` (`@schreibfix/mobile`)
- **Shared**: `packages/core` (`@schreibfix/core`) — types, content, exercises, Supabase client

## Backend

- **Supabase** — URL and anon/service keys in `apps/web/.env.local`
- **Auth**: Supabase email auth, `/auth` page, protected routes via `ProtectedPage` component
- **Database tables**: `profiles`, `progress` (both with RLS enabled)
  - `profiles`: `id` (UUID = auth.uid()), `klasse` (smallint 1–4, nullable)
  - `progress`: `id`, `user_id`, `lesson_id`, `score`, `stars`, `completed_at`
    - Diktat rows: `lesson_id` like `"k1-tiere"`, `"k2-essen"`, etc.
    - Grammar rows: `lesson_id` like `"grammatik-verben"`, `"grammatik-artikel"`, `"grammatik-plural"`

## Features

### Diktat (`/diktat`)
- Lesson picker: all 12 lessons grouped by Klasse (1–4), shows stars if completed
- Per-lesson: TTS playback, word-by-word checking, XP and stars
- Auto-plays TTS when advancing to next sentence; Überprüfen button always visible
- Saves result to Supabase `progress` table on completion

### Übungen (`/uebungen`)
- Three Grammatik exercise types, 5 exercises per session:
  - **Verbkonjugation**: 22 exercises (spielen, laufen, essen, trinken, schreiben, lesen, machen, haben, sein, gehen — Präsens, Klasse 1–3)
  - **Artikel (Der/Die/Das)**: 31 nouns with emoji, Klasse 1–4
  - **Einzahl & Mehrzahl**: 22 exercises, Klasse 1–4
- Immediate feedback (green/red), explanation shown after each answer
- XP award (5 XP per correct answer), saves to Supabase on session completion

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

## Design

- Primary color: orange `#F97316`
- Success color: green `#22C55E`
- Font: Nunito
- All UI in German, child-friendly
- CSS utility classes: `.btn-primary`, `.btn-secondary`, `.card`

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

## Git

Remote: https://github.com/visi6630/Schreibfix.git
