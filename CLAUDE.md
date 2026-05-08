# CLAUDE.md – restart

## Projekt

Öffentlicher Kunden-Anamnesebogen für Cryopoint Augsburg.
Gebaut auf der UX-Struktur von `start` (Vite-SPA), angereichert mit Research-Inhalten aus `crmbig`.

**Subdomain:** `restart.recovery-augsburg.dev` (Prod) / `restart-dev.recovery-augsburg.dev` (Dev)

## Kommandos

```bash
npm run dev          # Dev-Server auf :3000
npm run build        # Production Build
npm run start        # Production Server
npx prisma db push   # Schema → DB (ohne Migration)
npx prisma generate  # Prisma Client neu generieren
npx prisma studio    # DB-Browser
```

Vor dem Start: `.env.local` aus `.env.example` anlegen.

## Tech-Stack

- **Next.js 16 (App Router) + React 19 + TypeScript strict**
- **Tailwind CSS 4** – CSS-first `@theme` in `app/globals.css`
- **Prisma 6 + PostgreSQL**
- **Zustand** (Anamnese-Store + localStorage-Persist)
- **React Hook Form + Zod v4**
- **react-signature-canvas** (Signatur)

## Alias

`@/*` → `app/*` (in tsconfig.json)

## Anamnese-Flow

Neue Step-Reihenfolge (UX-Fix, kein vorzeitiger „Fertig"-Eindruck):

1. **Kategorie** – Hauptfokus (+ optional 2. Fokus)
2. **Details** – Unterfragen je Fokus (chamber2 / chamber2b)
3. **Kontraindikationen**
4. **Persönliche Daten**
5. **Einwilligungen**
6. **Signatur + Submit**
7. **Plan + Danke** (kein Progress-Balken – ist die Belohnung)

Schritte 1–6 zeigen StepProgress (`Schritt X von 6`).
Schritt 7 (StepPlan) hat keinen Progress-Header.

## Wichtige Dateien

| Datei | Zweck |
|-------|-------|
| `app/features/anamnese/types.ts` | MainFocus, AnamneseData, STEP_ORDER |
| `app/features/anamnese/store.ts` | Zustand + localStorage-Persist |
| `app/features/anamnese/fragen.ts` | Fragensystem (chamber2-Logik) |
| `app/features/anamnese/empfehlung.ts` | Empfehlungs-Algorithmus (dualer Fokus) |
| `app/data/anwendungen.ts` | 7 Anwendungen (Single Source of Truth) |
| `app/data/research.ts` | Wissenschaftliche Kurzinhalte pro Anwendung |
| `app/api/anamnesen/route.ts` | POST – Anamnese speichern |

## Coolify Deployment

| Umgebung | Subdomain | Branch |
|----------|-----------|--------|
| Dev | `restart-dev.recovery-augsburg.dev` | `develop` |
| Prod | `restart.recovery-augsburg.dev` | `main` |

Env-Variablen in Coolify:
- `DATABASE_URL` – PostgreSQL-Connection-String
- `AUTH_SECRET` – `openssl rand -base64 32`
- `AUTH_URL` – HTTPS-URL der jeweiligen Umgebung
- `NEXT_PUBLIC_SITE_URL` – HTTPS-URL der jeweiligen Umgebung
- `NEXT_PUBLIC_STUDIO_PHONE` – `+49 821 8998881`
