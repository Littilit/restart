# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projekt

Öffentlicher Kunden-Anamnesebogen + CRM-Admin für Cryopoint Augsburg.

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

Vor dem Start: `.env.local` aus `.env.example` anlegen. Lokale Dev-DB: `postgresql://dev:devpassword@localhost:5432/dev`

## Tech-Stack

- **Next.js 16 (App Router) + React 19 + TypeScript strict**
- **Tailwind CSS 4** — CSS-first `@theme` in `app/globals.css`
- **Prisma 6 + PostgreSQL**
- **Zustand** (Anamnese-Store + localStorage-Persist)
- **React Hook Form + Zod v4**
- **react-signature-canvas** (Signatur)
- **@react-pdf/renderer** (PDF-Generierung)

**Alias:** `@/*` → `app/*`

## Architektur

### Zwei getrennte Welten

**Öffentlich** (`/`, `/anamnese`, `/anamnese/start`): Anamnese-Flow für Endkunden. Kein Auth.

**Admin** (`/admin/**`): CRM für Mitarbeiter. Geschützt via Cookie-Session (`admin_session`). Einziger Login: `ADMIN_PASSWORD` env-var, verglichen in `/api/admin/login`. Kein User-Model aktiv genutzt.

### Anamnese-Flow

Der Flow ist ein Single-Page-Wizard mit Zustand-Store. Kein Page-Router pro Step — alles in `AnamneseFlow.tsx` mit `currentStep`-State.

```
AnamneseShell (Layout) → AnamneseFlow (Step-Switch) → Step-Komponenten
```

Step-Reihenfolge via `STEP_ORDER` in `app/features/anamnese/types.ts`:
`anwendung → kategorie → details → kontraindikationen → daten → consent → signatur → plan`

Schritte 1–7 zeigen StepProgress (`Schritt X von 7`). `plan` hat keinen Progress-Header.

**Empfehlungslogik:** `app/features/anamnese/empfehlung.ts` — berechnet Anwendungs-Empfehlungen aus `mainFocus` + `chamber2`-Antworten (+ optionalem Zweit-Fokus `mainFocus2` / `chamber2b`). Wird bei jeder Antwort-Änderung neu berechnet und im Store gespeichert.

**Persistenz:** Zustand-Store persistiert via localStorage (`restart-anamnese-draft`). Nach Submit: `POST /api/anamnesen` → Customer upsert by email → Anamnese create.

### Admin / CRM

Server Components für Datenladung, Client Components für Interaktivität — konsistentes Pattern.

**Dashboard** (`app/admin/(auth)/page.tsx`): Lädt offene Aufgaben + Servicegespräch-Alarme + Kundenliste (mit Status/Tag/Textsuche via URL-Params).

**Alarme oben auf dem Dashboard (Reihenfolge):**
1. `AufgabenSektion` — vom Admin erstellte Aufgaben (blau), müssen abgehakt werden
2. `ServicegesprachAlarmSektion` — Kunden mit erstTermin ≥ 7 Tage ohne Servicegespräch (orange)

**Editor-Pattern:** Inline-Client-Komponenten pro Feld (z. B. `StatusEditor`, `TagsEditor`, `ErstTerminEditor`, `NotizenEditor`) — jede macht ihren eigenen PATCH-Request und ruft `router.refresh()`.

### Datenmodell (Prisma)

```
Customer (1) ──< Anamnese   (onDelete: SetNull)
Customer (1) ──< Empfehlung (onDelete: Cascade)
Customer (1) ──< Note       (onDelete: Cascade)
Customer (1) ──< Task       (onDelete: SetNull)
```

`CustomerStatus` enum: `neukunde | startangebot | mitglied | karten_kunde | aggregator | angebot_nachfassen | kein_kauf`

`Task`: Admin-Aufgaben mit optionalem `customerId`, optionalem `skript` (Telefonskript), `erledigtAm` (null = offen).

### PDF-Generierung

Route `app/p/[token]/route.ts` — öffentlich erreichbar per `shareToken`. Rendert via `@react-pdf/renderer` entweder `AngebotPdf` oder `ExpertenPdf`. Die `as unknown as`-Casts sind eine bekannte Inkompatibilität zwischen `@react-pdf/renderer` und React 19.

### Auth-Flow

```
middleware.ts → getSessionFromToken (Cookie) → /admin/login wenn ungültig
app/lib/auth.ts → createSession / deleteSession / getSession (jose JWT, HS256, 30d)
```

`AUTH_SECRET` **muss** gesetzt sein — kein Fallback, wirft harten Fehler beim Start.

## Wichtige Dateien

| Datei | Zweck |
|-------|-------|
| `app/features/anamnese/types.ts` | MainFocus, AnamneseData, STEP_ORDER |
| `app/features/anamnese/store.ts` | Zustand + localStorage-Persist |
| `app/features/anamnese/fragen.ts` | Fragensystem (chamber2-Logik) |
| `app/features/anamnese/empfehlung.ts` | Empfehlungs-Algorithmus (dualer Fokus) |
| `app/data/anwendungen.ts` | 7 Anwendungen (Single Source of Truth) |
| `app/data/preise.ts` | Preise + SLUG_KATEGORIE-Map |
| `app/data/research.ts` | Wissenschaftliche Kurzinhalte pro Anwendung |
| `app/api/anamnesen/route.ts` | POST – Anamnese + Customer-Upsert |
| `app/api/admin/customers/route.ts` | POST – Kunden direkt anlegen |
| `app/api/admin/tasks/route.ts` | POST – Aufgabe erstellen |
| `app/admin/AufgabenSektion.tsx` | Blaue Aufgaben-Karten auf Dashboard |
| `app/admin/ServicegesprachAlarmSektion.tsx` | Orange Alarm-Karten auf Dashboard |

## Coolify Deployment

| Umgebung | Subdomain | Branch |
|----------|-----------|--------|
| Dev | `restart-dev.recovery-augsburg.dev` | `develop` |
| Prod | `restart.recovery-augsburg.dev` | `main` |

`entrypoint.sh` führt `prisma db push` automatisch bei jedem Container-Start aus — Schema-Änderungen brauchen keinen manuellen Schritt in Coolify.

Env-Variablen in Coolify: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_STUDIO_PHONE`, `ADMIN_PASSWORD`
