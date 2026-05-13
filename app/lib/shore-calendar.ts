import { createDAVClient } from 'tsdav';
import ical from 'node-ical';

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

export async function getTermine(start: Date, end: Date): Promise<Termin[]> {
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
      const event = component as ical.VEvent;
      termine.push({
        uid: event.uid ?? obj.url,
        title: str(event.summary) ?? '(ohne Titel)',
        start: event.start as Date,
        end: event.end as Date,
        description: str(event.description),
      });
    }
  }

  return termine.sort((a, b) => a.start.getTime() - b.start.getTime());
}
