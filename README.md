# 🦊 Schreibfix

Deutsche Lern-App für Grundschulkinder (Klasse 1–4).

## Monorepo-Struktur

```
schreibfix/
├── apps/
│   ├── web/          Next.js 14 (App Router) + Tailwind CSS
│   └── mobile/       Expo (React Native) + Expo Router
├── packages/
│   └── core/         Shared TypeScript types, exercise logic, content
├── turbo.json
└── package.json
```

## Schnellstart

```bash
# Alle Dependencies installieren
npm install

# Core-Paket bauen (vor dem ersten Start nötig)
npm run build --workspace=packages/core

# Web-App starten
npm run web          # → http://localhost:3000

# Mobile-App starten (Expo Dev Client)
npm run mobile       # → Expo Go scannen
```

## Features

| Feature | Status |
|---------|--------|
| Diktat (TTS + Fehlerprüfung) | ✅ Web + Mobile |
| Rechtschreibübungen | 🔜 Scaffold |
| Grammatikübungen | 🔜 Scaffold |
| Fortschritt / XP | 🔜 Scaffold (Supabase) |

## Tech Stack

- **Monorepo**: Turborepo + npm workspaces
- **Web**: Next.js 14, Tailwind CSS, Web Speech API
- **Mobile**: Expo 52, Expo Router, Expo Speech
- **Shared**: `@schreibfix/core` (tsup, strict TypeScript)
- **Backend** (geplant): Supabase (Auth, DB, Storage)
