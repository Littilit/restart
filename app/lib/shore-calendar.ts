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
  const key = `${start.toISOString()}|${end.toISOString()}`;
  if (cache && cache.key === key && Date.now() - cache.time < TTL_MS) {
    return cache.data;
  }

  const { createDAVClient } = await import('tsdav');
  const ical = (await import('node-ical')).default;

  const client = await createDAVClient({
    serverUrl: process.env.SHORE_CALDAV_URL!,
    credentials: {
      username: process.env.SHORE_USERNAME!,
      password: process.env.SHORE_PASSWORD!,
    },
    authMethod: 'Basic',
    defaultAccountType: 'caldav',
  });

  const calendars = await client.fetchCalendars();
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
