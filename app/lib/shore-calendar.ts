type ParameterValue = string | { val: string; params: Record<string, string> };

function str(v: ParameterValue | undefined): string | undefined {
  if (!v) return undefined;
  return typeof v === 'string' ? v : v.val;
}

export interface Termin {
  uid: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
}

let cache: { time: number; key: string; data: Termin[] } | null = null;
const TTL_MS = 60_000;

export async function getTermine(start: Date, end: Date): Promise<Termin[]> {
  const serverUrl = process.env.SHORE_CALDAV_URL;
  const username = process.env.SHORE_USERNAME;
  const password = process.env.SHORE_PASSWORD;
  if (!serverUrl || !username || !password) {
    throw new Error(
      `Env-Vars fehlen: SHORE_CALDAV_URL=${!!serverUrl}, SHORE_USERNAME=${!!username}, SHORE_PASSWORD=${!!password}`
    );
  }

  const key = `${start.toISOString()}|${end.toISOString()}`;
  if (cache && cache.key === key && Date.now() - cache.time < TTL_MS) {
    return cache.data;
  }

  const { createDAVClient } = await import('tsdav');
  const ical = (await import('node-ical')).default;

  console.log('[Shore] Verbinde zu CalDAV:', serverUrl, 'als', username);
  const client = await createDAVClient({
    serverUrl,
    credentials: { username, password },
    authMethod: 'Basic',
    defaultAccountType: 'caldav',
  });

  const calendars = await client.fetchCalendars();
  console.log('[Shore] Kalender gefunden:', calendars.length, calendars.map((c) => c.displayName));
  if (!calendars.length) return [];

  const objects = await client.fetchCalendarObjects({
    calendar: calendars[0],
    timeRange: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
  });

  const termine: Termin[] = [];
  for (const obj of objects) {
    if (!obj.data) continue;
    const parsed = ical.parseICS(obj.data);
    for (const component of Object.values(parsed)) {
      if (!component || component.type !== 'VEVENT') continue;
      const event = component;
      termine.push({
        uid: event.uid ?? obj.url,
        title: str(event.summary) ?? '(ohne Titel)',
        start: event.start as Date,
        end: event.end as Date,
        description: str(event.description),
      });
    }
  }

  termine.sort((a, b) => a.start.getTime() - b.start.getTime());
  cache = { time: Date.now(), key, data: termine };
  return termine;
}
