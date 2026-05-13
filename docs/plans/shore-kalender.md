# Plan: Shore-Kalender im Restart-Admin einbetten

> **Selbsterklärendes Handbuch — von einem anderen PC ausführbar.**
> Vor dem Start: einmal komplett durchlesen. Alle Code-Blöcke sind copy-paste-fertig.

---

## Kontext

Restart ist der Kunden-Anamnesebogen + CRM-Admin für Cryopoint Augsburg (Next.js 16, Prisma, Coolify-Deploy auf Hetzner). Tim nutzt **Shore** als externen Online-Kalender. Aktuell ständiger Tab-Wechsel zwischen Restart-Admin und Shore.

**Ziel dieser Iteration:** Shore-Kalender als neuer Sidebar-Menüpunkt im Restart-Admin sichtbar machen. Beim Klick keine Ladezeit — der Kalender verhält sich wie ein dauerhaft geöffneter Browser-Tab.

**Tims Entscheidungen (aus der Klärung):**
- Interner Mitarbeiter-Kalender (nicht Buchungs-Widget für Kunden).
- Shore-API-Zugang noch zu prüfen → diese Iteration kommt ohne API aus.
- Automatisches Kunden-Anlegen bei Shore-Buchung wird auf eine zweite Iteration vertagt.

**Wichtiger Caveat:** Shore ist Login-geschützt und setzt höchstwahrscheinlich `X-Frame-Options: DENY` oder `Content-Security-Policy: frame-ancestors`. Ob das iframe-Embedding überhaupt funktioniert, lässt sich nur empirisch testen. Falls blockiert: dieser Plan ist trotzdem nützlich, weil er einen Direkt-Link-Fallback einbaut.

---

## Übertragung dieses Plans an einen anderen PC

Dieser Plan lebt aktuell nur lokal unter `/root/.claude/plans/…` (außerhalb von Git). Damit eine neue Claude-Session am anderen PC ihn findet, muss er ins versionierte Restart-Repo wandern. **Empfohlener Pfad:** `docs/plans/shore-kalender.md` im `restart`-Repo.

```bash
# Auf dem aktuellen PC (Haupt-PC), nach Plan-Approval:
mkdir -p /home/tim/dev/restart/docs/plans
cp /root/.claude/plans/ich-m-chte-den-onlinekalender-merry-ripple.md \
   /home/tim/dev/restart/docs/plans/shore-kalender.md

cd /home/tim/dev/restart
git checkout develop
git add docs/plans/shore-kalender.md
git commit -m "docs: Handover-Plan Shore-Kalender-Einbindung"
# Vor Push einmal kurz bestätigen!
git push origin develop
```

Am anderen PC nach `git clone` ist der Plan automatisch dabei. Eine neue Claude-Session öffnest Du mit:
```bash
cd ~/dev/restart
claude   # oder VS Code Extension öffnen
```
Dann in der Session: „Bitte lies `docs/plans/shore-kalender.md` und führe ihn aus." — Plan + `CLAUDE.md` enthalten alles, was Claude für den Kontext braucht.

### Credentials separat mitnehmen

`~/dev/.env` ist **nicht** in Git. Du brauchst am anderen PC:

| Variable | Woher |
|----------|-------|
| `DATABASE_URL` | Coolify → Service → Environment Variables (kopieren) |
| `AUTH_SECRET` | dito |
| `ADMIN_PASSWORD` | dito |
| `NEXT_PUBLIC_SITE_URL` | dito |
| `AUTH_URL` | dito |
| `NEXT_PUBLIC_STUDIO_PHONE` | dito |
| `SHORE_CALENDAR_URL` | Aus Shore-Account ablesen (Login → Kalender → URL) |
| Coolify API Key | Coolify → Profile → API Tokens — bei Bedarf neu erzeugen |

Lokale Postgres-DB ist optional: Du kannst stattdessen die Dev-DB aus Coolify nutzen (`DATABASE_URL` von dort übernehmen) und `npx prisma db push` lokal überspringen.

---

## Setup auf dem anderen PC (einmalig)

```bash
# 1. Repo clonen
git clone git@github.com:Littilit/restart.git ~/dev/restart
cd ~/dev/restart

# 2. Auf develop wechseln (aktueller Stand: 102f918 oder neuer)
git checkout develop
git pull

# 3. Dependencies
npm install

# 4. Lokale .env.local anlegen (nicht ~/dev/.env — die ist nur auf Tims Haupt-PC)
cp .env.example .env.local
# Dann .env.local befüllen — siehe Abschnitt "Konfiguration" unten

# 5. Lokale Postgres muss laufen (oder Coolify-DB anzapfen):
#    postgresql://dev:devpassword@localhost:5432/dev

# 6. Prisma Client + Schema
npx prisma generate
npx prisma db push

# 7. Dev-Server testen
npm run dev   # → http://localhost:3000
# Login: /admin/login (Passwort aus ADMIN_PASSWORD in .env.local)
```

Falls am anderen PC die Coolify Deploy-UUIDs gebraucht werden — sie stehen weiter unten im Deploy-Abschnitt.

---

## Architektur-Entscheidung: Persistent Iframe

**Problem:** Würde der iframe in `app/admin/(auth)/kalender/page.tsx` gerendert, wird er bei jedem Routen-Wechsel (zu `/admin`, `/admin/kunden/...`) unmountet — der Shore-Login geht verloren, und beim Zurückklicken auf „Kalender" lädt alles neu. Schlechte UX.

**Lösung:** Der iframe wird **einmal im Admin-Layout** (`app/admin/(auth)/layout.tsx`) gemountet. Next.js App Router unmountet Layouts beim Routen-Wechsel innerhalb derselben Layout-Gruppe nicht — der iframe bleibt also im DOM, behält Cookies, Scroll-Position, alles. Sichtbarkeit wird per `display: none/block` über `usePathname()` gesteuert. Erster Mount erfolgt lazy beim ersten Aufruf von `/admin/kalender`.

---

## Konfiguration

### Env-Variable hinzufügen

**Lokal (`.env.local`):**
```
SHORE_CALENDAR_URL="https://app.shore.com/..."
```

Die konkrete URL findest Du, indem Du Dich im Browser bei Shore einloggst und im Admin-Kalender-Bereich die Adresszeile kopierst.

**`.env.example` ergänzen** (damit das Feld dokumentiert ist):
```
SHORE_CALENDAR_URL=
```

**Coolify (Dev + Prod):**
- Dev-Service `restart-dev` → Environment Variables → `SHORE_CALENDAR_URL` eintragen.
- Prod-Service `restart` → genauso.
- Nach Eintrag jeweils Redeploy auslösen (URLs unten).

---

## Code-Änderungen

### Änderung 1 — Sidebar erweitern

**Datei:** `app/admin/AdminNav.tsx`

**a)** Import-Zeile 6 — `Calendar` zur Icon-Liste hinzufügen:

```tsx
import { Users, Tag, UserPlus, ClipboardList, Calendar } from 'lucide-react';
```

**b)** Nach Zeile 16 (`const aufgabeActive = …`) eine neue Zeile einfügen:

```tsx
const kalenderActive = pathname.startsWith('/admin/kalender');
```

**c)** Neuen `<li>`-Block nach „Aufgabe erstellen" einfügen (nach Zeile 69, vor `{tags.length > 0 && …`):

```tsx
<li>
  <Link
    href="/admin/kalender"
    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      kalenderActive
        ? 'bg-cp-tuerkis text-white'
        : 'text-white/60 hover:text-white hover:bg-white/10'
    }`}
  >
    <Calendar size={16} />
    Kalender
  </Link>
</li>
```

---

### Änderung 2 — Persistent Iframe-Komponente

**Neue Datei:** `app/admin/ShoreFrame.tsx`

```tsx
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

export default function ShoreFrame({ shoreUrl }: { shoreUrl: string | null }) {
  const pathname = usePathname();
  const visible = pathname.startsWith('/admin/kalender');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible && !mounted) setMounted(true);
  }, [visible, mounted]);

  if (!mounted) return null;

  return (
    <div
      style={{ display: visible ? 'flex' : 'none' }}
      className="fixed top-0 bottom-0 left-56 right-0 z-30 flex-col bg-cp-grauweis"
    >
      <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-200 bg-white">
        <h1 className="text-sm font-semibold text-neutral-700">Shore-Kalender</h1>
        {shoreUrl && (
          <a
            href={shoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-cp-tuerkis hover:underline"
          >
            <ExternalLink size={14} />
            In neuem Tab öffnen
          </a>
        )}
      </div>

      {shoreUrl ? (
        <iframe
          src={shoreUrl}
          className="flex-1 w-full border-0"
          title="Shore Kalender"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md text-center space-y-3">
            <p className="text-sm font-medium text-neutral-700">
              Shore-Kalender ist nicht konfiguriert
            </p>
            <p className="text-xs text-neutral-500">
              Setze die Umgebungsvariable <code className="bg-neutral-100 px-1 py-0.5 rounded">SHORE_CALENDAR_URL</code> in <code className="bg-neutral-100 px-1 py-0.5 rounded">.env.local</code> (lokal) bzw. in Coolify (Dev/Prod).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
```

Hinweis: `left-56` matched die Sidebar-Breite aus `AdminNav.tsx` (`w-56`).

---

### Änderung 3 — Layout einhängen

**Datei:** `app/admin/(auth)/layout.tsx`

**a)** Import nach Zeile 6 ergänzen:

```tsx
import ShoreFrame from '../ShoreFrame';
```

**b)** Direkt vor dem schließenden `</div>` (zwischen `</main>` und `</div>`, also nach Zeile 24):

```tsx
<ShoreFrame shoreUrl={process.env.SHORE_CALENDAR_URL ?? null} />
```

Die Env-Variable wird in einer Server Component gelesen und als Prop an die Client Component übergeben — Next.js-Standard.

---

### Änderung 4 — Routing-Ziel

**Neue Datei:** `app/admin/(auth)/kalender/page.tsx`

Die Seite ist absichtlich minimal — der eigentliche Inhalt liegt im persistenten `ShoreFrame`, der via `z-30` darüber liegt. Diese Page existiert nur, damit der Sidebar-Link eine gültige Route hat und `usePathname()` matcht.

```tsx
export default function KalenderPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] text-sm text-neutral-400">
      Kalender wird geladen…
    </div>
  );
}
```

---

## Kritische Dateien (Übersicht)

| Datei | Aktion |
|-------|--------|
| `app/admin/AdminNav.tsx` | Edit — Sidebar-Menüpunkt ergänzen |
| `app/admin/ShoreFrame.tsx` | Write (neu) — Persistent-Iframe-Komponente |
| `app/admin/(auth)/layout.tsx` | Edit — `ShoreFrame` einhängen |
| `app/admin/(auth)/kalender/page.tsx` | Write (neu) — Routing-Stub |
| `.env.local` | Edit — `SHORE_CALENDAR_URL` |
| `.env.example` | Edit — `SHORE_CALENDAR_URL=` dokumentieren |
| Coolify `restart-dev` | Env-Var setzen + Redeploy |
| Coolify `restart` | Env-Var setzen + Redeploy (erst nach Tims OK) |

---

## Verifikation

### Lokal

```bash
npm run dev
```

1. Browser auf `http://localhost:3000/admin/login` → einloggen.
2. In einem **zweiten Tab desselben Browsers** bei Shore einloggen.
3. Im Restart-Admin auf „Kalender" in der Sidebar klicken — iframe sollte Shore zeigen.
4. **Persistenz-Test (Kern-Akzeptanzkriterium):**
   - Auf „Kunden" wechseln, dann zurück auf „Kalender".
   - iframe darf **nicht neu laden**, Scroll-Position bleibt erhalten.
   - DevTools → Network: kein neuer Shore-Request beim Zurückwechseln.
5. **Andere Routen:** Kunden-Liste, „Neuer Kunde", „Aufgabe erstellen" verhalten sich unverändert. ShoreFrame darf nicht klick-blockierend dazwischenliegen (`display: none` muss greifen).
6. **Active-State:** „Kalender" ist hervorgehoben, andere nicht.
7. **Fehlende Env-Variable:** `SHORE_CALENDAR_URL` aus `.env.local` entfernen, Dev-Server neu starten — auf „Kalender" sollte Setup-Hinweis erscheinen, kein Crash.

### Wenn Shore-Embedding blockiert ist

Falls der iframe leer/grau bleibt:
- DevTools → Console: Meldung wie „Refused to display in a frame because it set 'X-Frame-Options' to 'deny'".
- „In neuem Tab öffnen"-Button rechts oben funktioniert trotzdem.
- Persistenz-Feature ist in diesem Fall wertlos für den iframe-Pfad — als Fallback bleibt der externe Tab.
- Entscheidung mit Tim: Option A — externe Browser-Extension für SSO; Option B — eigene Kalender-UI auf Basis Shore-API (sofern Tarif sie freischaltet). Beides außerhalb dieses Plans.

### Deploy

```bash
# Auf develop committen + pushen (Conventional Commits)
git checkout develop
git add app/admin/AdminNav.tsx app/admin/ShoreFrame.tsx \
        app/admin/\(auth\)/layout.tsx app/admin/\(auth\)/kalender \
        .env.example
git commit -m "feat: Shore-Kalender als persistenten Sidebar-Menüpunkt einbinden"
# Vor dem Push einmal Tim fragen!
git push origin develop

# Coolify Dev-Deploy (UUID aus Memory project_restart_quirks.md):
curl -X GET "https://cool.recovery-augsburg.dev/api/v1/deploy?uuid=ez95ng0eoypmumennsg6iarh" \
  -H "Authorization: Bearer $COOLIFY_API_KEY"
# COOLIFY_API_KEY liegt in /home/tim/dev/.env auf Tims Haupt-PC

# → testen auf https://restart-dev.recovery-augsburg.dev
# Erst nach Tims OK Merge nach main:
git checkout main
git merge develop
git push origin main

# Coolify Prod-Deploy:
curl -X GET "https://cool.recovery-augsburg.dev/api/v1/deploy?uuid=vpwm5qa4uvqts68i8nd8dw43" \
  -H "Authorization: Bearer $COOLIFY_API_KEY"
```

---

## Zweite Iteration (Vorbereitung, nicht hier umsetzen)

Wenn Tim später automatisches Kunden-Anlegen bei Shore-Buchung umsetzen will:

- **Neuer Endpoint:** `app/api/webhooks/shore/route.ts`.
- **Auth:** HMAC-Signatur prüfen (Header je nach Shore- oder Zapier-Konfiguration). Cookie-Auth via `middleware.ts` **nicht** anwenden — entweder Route aus dem Matcher ausnehmen oder explizit als public deklarieren.
- **Customer-Logik wiederverwenden:** Pattern aus `app/api/anamnesen/route.ts` (Zeilen 50–78): `findMany` nach Email → `samePersonByName` aus `app/lib/name-similarity.ts` → `update` oder `create`.
- **Feld-Mapping:** Shore `firstName/lastName/email/phone` → Customer `vorname/nachname/email/telefon`. Termin-Datum → `erstTermin`.
- **Voraussetzung:** Tim klärt Shore-Tarif (Token Manager im Kasse Manager). Falls keine direkten Webhooks: Zapier vorschalten.

---

## Offene Punkte (an Tim)

- Konkrete `SHORE_CALENDAR_URL` aus Shore-Account heraussuchen (Login → Kalender → URL kopieren).
- Shore-Tarif / API-Zugang prüfen (bestimmt die zweite Iteration).
- Nach erstem Test: Entscheidung, falls iframe blockiert ist — siehe „Wenn Shore-Embedding blockiert ist".
