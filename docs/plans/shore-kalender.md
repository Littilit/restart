# Handoff: Shore-Kalender als Tagestimeline via CalDAV

> Stand: 2026-05-13. Plan vom 47dee41 (Iframe-Ansatz) ist verworfen — Shore blockiert iframe-Embedding via `X-Frame-Options: DENY`. Neue Lösung: CalDAV direkt zu Shore.

## Was implementiert ist

Restart-Admin hat unter `/admin/kalender` eine Tagestimeline (heute + 6 weitere Tage), die Shore-Termine via CalDAV zieht. 60-Sek-In-Memory-Cache pro Container.

**Relevante Dateien:**
- `app/lib/shore-calendar.ts` — CalDAV-Client + iCal-Parser, lazy imports (Turbopack-Workaround)
- `app/admin/(auth)/kalender/page.tsx` — Server Component, `force-dynamic` + `runtime = 'nodejs'`
- `app/admin/AdminNav.tsx` — Sidebar-Link auf `/admin/kalender` mit Active-State
- `next.config.ts` — `serverExternalPackages: ['tsdav', 'node-ical']`

**Packages:** `tsdav`, `node-ical`, `date-fns` (eigene Types bei node-ical, kein `@types/...` nötig).

## Aktueller Stand der Fehlersuche

Drei aufeinanderfolgende Bugs, jeweils mit Fix-Commit:

1. **Build-Crash** `TypeError: h.BigInt is not a function` beim "Collecting page data" → behoben durch `force-dynamic` + lazy `await import('tsdav')` (Commit `15de094`).
2. **Runtime-Crash** mit derselben Meldung beim Rendern der Seite → Verdacht: Turbopack-Bundling-Problem mit tsdav-Dependencies → Fix-Versuch via `serverExternalPackages` in `next.config.ts` (Commit `5bdbfdb`, Deploy `zeub2o9snd7dkw5gb684c2t3` läuft beim Schreiben dieses Handoffs).

**Was als nächstes zu prüfen ist:**
- Nach Deploy-Ende `/admin/kalender` neu laden.
- Falls weiterhin `h.BigInt is not a function`: ist ein hartnäckiges Turbopack-Problem. Fallback: tsdav komplett rauswerfen und CalDAV-REPORT-Request manuell mit `fetch` + raw XML zusammenbauen — kein Bundler-Risiko, aber mehr Code.
- Falls anderer Fehler: die Fehlermeldung ist in der UI sichtbar (Page wirft Detail-Message). Auch Container-Logs in Coolify checken (`[Shore] Verbinde zu CalDAV: ...`).

## Env-Variablen

In Coolify (`restart-dev`) gesetzt werden müssen (falls nicht schon):

| Variable | Wert |
|---|---|
| `SHORE_CALDAV_URL` | `https://sync.shore.com/caldav/user` |
| `SHORE_USERNAME` | Shore-Login-Email |
| `SHORE_PASSWORD` | Shore-Passwort |

`SHORE_CALENDAR_URL` (alt) kann gelöscht werden.

## Deploy

```bash
KEY=$(grep -i '^coolify_api_key' /home/tim/dev/.env | cut -d= -f2- | tr -d '"' | tr -d "'" | xargs)
curl -X GET "https://cool.recovery-augsburg.dev/api/v1/deploy?uuid=ez95ng0eoypmumennsg6iarh" \
  -H "Authorization: Bearer $KEY"
```

Prod-UUID: `vpwm5qa4uvqts68i8nd8dw43` — erst nach Tims OK + Merge `develop → main`.

## Test-Plan

1. `/admin/kalender` öffnen — heute türkis, nächste 6 Tage darunter.
2. Termin in Shore anlegen → max. 60 Sek warten → Reload → Termin erscheint.
3. Fehler-Pfad: `SHORE_PASSWORD` falsch setzen → klare Detail-Fehlermeldung in UI.

## Fallback-Optionen wenn CalDAV weiter Probleme macht

- **Raw HTTP statt tsdav**: CalDAV-REPORT mit `fetch()` + Basic-Auth-Header selbst bauen, Response-XML mit regex/`fast-xml-parser` parsen. Mehr Code, kein Bundler-Risiko.
- **Google-Calendar-iCal-Feed** (verworfen wegen Sync-Verzögerung Shore→Google, bis 30 min) — falls Real-time nicht zwingend nötig, deutlich einfacher.

## Was die nächste Session zuerst tun sollte

1. `git pull origin develop` und `npm install`.
2. Status des laufenden Deploys (`zeub2o9snd7dkw5gb684c2t3`) prüfen — wenn fehlgeschlagen: Coolify-Build-Logs lesen.
3. Wenn Build durch: UI-Fehler an `/admin/kalender` checken und ab da debuggen.
