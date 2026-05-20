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

### Auth-Flow

```
proxy.ts (Middleware-Matcher) → getSessionFromToken (Cookie) → /admin/login wenn ungültig
app/lib/auth.ts → createSession / deleteSession / getSession (jose JWT, HS256, 30d)
```

`AUTH_SECRET` **muss** gesetzt sein — kein Fallback, wirft harten Fehler beim Start. Alle Routen unter `/api/admin/*` geben automatisch 401 zurück wenn nicht authentifiziert — kein eigener Auth-Guard in Route Handlers nötig.

### Anamnese-Flow

Single-Page-Wizard mit Zustand-Store. Kein Page-Router pro Step — alles in `AnamneseFlow.tsx` mit `currentStep`-State.

```
AnamneseShell (Layout) → AnamneseFlow (Step-Switch) → Step-Komponenten
```

Step-Reihenfolge via `STEP_ORDER` in `app/features/anamnese/types.ts`:
`anwendung → kategorie → details → ziel → kontraindikationen → daten → consent → signatur → plan`

`COUNTED_STEPS` filtert `plan` heraus (Fortschrittsanzeige: „Schritt X von 8"). `ziel` ist optional — der Weiter-Button ist immer aktiv.

**Empfehlungslogik:** `app/features/anamnese/empfehlung.ts` — berechnet aus `mainFocus` + `chamber2`-Antworten (+ optionalem Zweit-Fokus). Wird bei jeder Antwort-Änderung neu berechnet.

**Persistenz:** Zustand-Store persistiert via localStorage (`restart-anamnese-draft`). Nach Submit: `POST /api/anamnesen` → Customer upsert by email + `samePersonByName` → Anamnese create.

### Admin / CRM

Server Components für Datenladung, Client Components für Interaktivität.

**Dashboard** (`app/admin/(auth)/page.tsx`) — Alarme oben in dieser Reihenfolge:
1. `NeueLeadsSektion` — neue Leads aus Lead-Listen (grün), höchste Priorität
2. `AufgabenSektion` — Admin-Aufgaben (blau)
3. `ServicegesprachAlarmSektion` — Kunden mit `erstTermin` ≥ 7 Tage + kein `servicegesprachAm` (orange)

Alle drei Sektionen: kein Cron — reine Echtzeit-Queries beim Seitenaufruf. `LeadAutoSync` (Client Component, rendert `null`) triggert zusätzlich einen non-blocking Sync aller Lead-Listen.

**Editor-Pattern:** Inline-Client-Komponenten pro Feld (z. B. `StatusEditor`, `TagsEditor`) — PATCH-Request + `router.refresh()` + `useTransition`.

### Datenmodell (Prisma)

```
Customer (1) ──< Anamnese   (onDelete: SetNull)
Customer (1) ──< Empfehlung (onDelete: Cascade)
Customer (1) ──< Note       (onDelete: Cascade)
Customer (1) ──< Task       (onDelete: SetNull)
Customer (1) ──< CheckIn    (onDelete: Cascade)
Customer (1) ──< Card       (onDelete: Cascade)
Customer (1) ──< Lead       (onDelete: SetNull)
LeadList  (1) ──< Lead      (onDelete: Cascade)
```

`CustomerStatus`: `neukunde | startangebot | mitglied | karten_kunde | aggregator | angebot_nachfassen | kein_kauf`

`LeadStatus`: `neu | erreicht | termin_vereinbart | kein_interesse`

`Task`: optionales `customerId`, `skript` (Telefonskript), `erledigtAm` (null = offen), `faelligAm` (null oder Vergangenheit = erscheint im Dashboard).

`Customer.monatsKontingent` + `unbegrenzt` — Longevity-Kontingent, auto-reset via Monatsfilter in Query (kein Cron).

`Customer.alternativeEmails` / `alternativeTelefone` — nach Kunden-Merge, in Dashboard-Suche auffindbar.

### Customer-Dedup

`app/lib/name-similarity.ts` → `samePersonByName()`: gleiche E-Mail + Name-Substring-Match (≥ 3 Zeichen) = gleiche Person. Wird in `POST /api/anamnesen` und im Lead-Sync verwendet.

### Lead-Listen-Feature

`app/lib/sheets.ts` — parst Google-Sheets-URL, fetcht CSV-Export (`/export?format=csv`). Erkennt private Sheets via Content-Type/HTML-Heuristik (HTTP 200 + HTML-Body = privat, wirft `SheetError`). Timeout 10s via `AbortController`.

`app/lib/csv.ts` — RFC-4180-Parser ohne externe Dependency. BOM-stripping, Quote-Escaping.

`app/lib/lead-sync.ts` — `syncLeadList()` / `syncAllLists()`. Throttle: pro Liste max. 1 Sync alle 3 Min (via `lastSyncedAt`). Dedup innerhalb Liste: `@@unique([leadListId, dedupeKey])`, dedupeKey = normalisierte E-Mail oder Telefon. Customer-Dedup global via `samePersonByName`. Jeder neue Lead legt automatisch einen Customer an (`herkunft` = Listenname).

`LeadList.spalteName/Vorname/Nachname/Email/Telefon` — Mapping per **Header-Name** (nicht Index), wird bei jedem Sync neu aufgelöst (robust gegen Spaltenumordnung). `nameModus: "getrennt" | "kombiniert"` — bei `kombiniert` wird am ersten Leerzeichen gesplittet.

### Check-in-Feature

`app/admin/(auth)/check-in/` — Suchseite mit Inline-Eincheck. `app/admin/KundenCheckIns.tsx` — Tab in Kundenmaske (Kontingent-Editor, Kartenverwaltung, Historie). FIFO-Kartenverbrauch: älteste aktive Karte zuerst. Longevity-Karte (`LONGEVITY_CARD_SLUG`) hat Vorrang vor Monatskontingent.

### PDF-Generierung

Route `app/p/[token]/route.ts` — öffentlich per `shareToken`. Rendert `AngebotPdf` via `@react-pdf/renderer`. Die `as unknown as`-Casts sind eine bekannte Inkompatibilität zwischen `@react-pdf/renderer` und React 19 — nicht anfassen.

`EmpfehlungTyp`: `neukunde` | `folge`. Editor zeigt Wirkmechanismen aus `app/data/research.ts` als read-only Kontext.

## Wichtige Dateien

| Datei | Zweck |
|-------|-------|
| `app/features/anamnese/types.ts` | MainFocus, AnamneseData, STEP_ORDER |
| `app/features/anamnese/store.ts` | Zustand + localStorage-Persist |
| `app/features/anamnese/fragen.ts` | Fragensystem (chamber2-Logik) |
| `app/features/anamnese/empfehlung.ts` | Empfehlungs-Algorithmus |
| `app/data/anwendungen.ts` | LONGEVITY_ANWENDUNGEN + KARTEN_ANWENDUNGEN |
| `app/data/preise.ts` | Preise + SLUG_KATEGORIE-Map |
| `app/lib/lead-sync.ts` | Sync-Logik Lead-Listen (Throttle, Dedup, Customer-Anlage) |
| `app/lib/sheets.ts` | Google-Sheets CSV-Fetch + URL-Parse |
| `app/lib/name-similarity.ts` | Customer-Dedup (samePersonByName) |
| `app/api/anamnesen/route.ts` | POST – Anamnese + Customer-Upsert |
| `app/api/admin/customers/route.ts` | POST – Kunden anlegen (Zod: vorname/nachname min 2, email, telefon min 6) |
| `app/api/admin/customers/[id]/route.ts` | PATCH – u.a. servicegesprachErledigt, monatsKontingent |
| `app/admin/(auth)/page.tsx` | Dashboard – Queries + Alarm-Reihenfolge |
| `proxy.ts` | Auth-Middleware (Matcher: /admin/*, /api/admin/*) |

## Coolify Deployment

| Umgebung | Subdomain | Branch | UUID |
|----------|-----------|--------|------|
| Prod | `restart.recovery-augsburg.dev` | `main` | `vpwm5qa4uvqts68i8nd8dw43` |
| Dev | `restart-dev.recovery-augsburg.dev` | `develop` | `ez95ng0eoypmumennsg6iarh` |

`entrypoint.sh` führt `prisma db push` automatisch bei jedem Container-Start aus — Schema-Änderungen brauchen keinen manuellen Schritt in Coolify.

Env-Variablen in Coolify: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_STUDIO_PHONE`, `ADMIN_PASSWORD`
