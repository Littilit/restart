import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const KATEGORIE_MAP: Record<string, string> = {
  termin_ausstehend:           'neukunde',
  angebot_nachfassen:          'angebot_nachfassen',
  angebot_erhalten_nachfassen: 'angebot_nachfassen',
  kein_angebot_nachfassen:     'angebot_nachfassen',
  starter_tester:              'startangebot',
  starter:                     'startangebot',
  startangebot:                'startangebot',
  mitglied:                    'mitglied',
  mitglied_karteninhaber:      'mitglied',
  karten_kunde:                'karten_kunde',
  aggregator:                  'aggregator',
  aggregatoren:                'aggregator',
  archiv:                      'kein_kauf',
  kein_kauf:                   'kein_kauf',
};

const VALID_MAIN_FOCUS = ['schmerzen', 'sport', 'vitalitaet', 'bodyforming', 'beckenboden', 'biohacking'];
const VALID_STATUS = ['neukunde', 'startangebot', 'mitglied', 'karten_kunde', 'aggregator', 'angebot_nachfassen', 'kein_kauf'];

export async function POST() {
  const keyB64 = process.env.FIREBASE_KEY_B64;
  if (!keyB64) {
    return NextResponse.json({ error: 'FIREBASE_KEY_B64 nicht gesetzt' }, { status: 500 });
  }

  // Firebase Admin dynamisch initialisieren
  const admin = (await import('firebase-admin')).default;
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(Buffer.from(keyB64, 'base64').toString('utf8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
  const db = admin.firestore();

  const snapshot = await db.collection('anamnesen').get();
  const results: { ok: string[]; skipped: string[]; errors: string[] } = { ok: [], skipped: [], errors: [] };

  for (const doc of snapshot.docs) {
    const d = doc.data();
    const email = (d.email ?? '').trim().toLowerCase();

    if (!email || email.length < 3 || !email.includes('@')) {
      results.skipped.push(`${doc.id}: kein/ungültiges E-Mail-Feld`);
      continue;
    }

    const contraindications = d.contraindications ?? d.contraIndications ?? {};
    const kontraindikationen = {
      blutverduenner:    !!contraindications.blutverduenner,
      epilepsie:         !!contraindications.epilepsie,
      herzerkrankungen:  !!contraindications.herzerkrankungen,
      herzschrittmacher: !!contraindications.herzschrittmacher,
      krebs:             !!contraindications.krebs,
      metallimplantate:  !!contraindications.metallimplantate,
      operation:         !!contraindications.operation,
      schwangerschaft:   !!contraindications.schwangerschaft,
    };
    const keineKontraindikationen = Object.values(kontraindikationen).every((v) => !v);
    const confirmations = d.confirmations ?? {};
    const rawStatus = KATEGORIE_MAP[d.kategorie] ?? 'neukunde';
    const status = VALID_STATUS.includes(rawStatus) ? rawStatus : 'neukunde';
    const mainFocus = VALID_MAIN_FOCUS.includes(d.mainFocus) ? d.mainFocus : null;

    let createdAt = new Date();
    if (d.timestamp?.toDate) createdAt = d.timestamp.toDate();
    else if (d.timestamp?.seconds) createdAt = new Date(d.timestamp.seconds * 1000);

    try {
      const customer = await prisma.customer.upsert({
        where: { email },
        update: {},
        create: {
          vorname:         (d.vorname ?? '').trim(),
          nachname:        (d.nachname ?? '').trim(),
          email,
          telefon:         (d.telefon ?? '').trim(),
          geburtsdatum:    (d.geburtsdatum ?? '').trim(),
          adresse:         (d.adresse ?? '').trim(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status:          status as any,
          consentMarketing: false,
          herkunft:        'firebase-import',
          createdAt,
        },
      });

      await prisma.anamnese.create({
        data: {
          version:                 1,
          customerId:              customer.id,
          vorname:                 (d.vorname ?? '').trim(),
          nachname:                (d.nachname ?? '').trim(),
          email,
          telefon:                 (d.telefon ?? '').trim(),
          geburtsdatum:            (d.geburtsdatum ?? '').trim(),
          adresse:                 (d.adresse ?? '').trim(),
          mainFocus,
          mainFocus2:              null,
          chamber2:                {},
          chamber2b:               {},
          recommendations:         [],
          kontraindikationen,
          keineKontraindikationen,
          consentDsgvo:            !!confirmations.dsgvo,
          consentGesundheitsdaten: !!confirmations.anweisungen,
          consentMarketing:        false,
          signatureDataUrl:        d.signatureDataUrl ?? null,
          herkunft:                'firebase-import',
          userAgent:               '',
          createdAt,
        },
      });

      results.ok.push(`${d.vorname} ${d.nachname} <${email}>`);
    } catch (err) {
      results.errors.push(`${email}: ${(err as Error).message}`);
    }
  }

  return NextResponse.json({
    total: snapshot.size,
    importiert: results.ok.length,
    uebersprungen: results.skipped.length,
    fehler: results.errors.length,
    details: results,
  });
}
