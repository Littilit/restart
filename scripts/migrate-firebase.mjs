/**
 * Firebase → PostgreSQL Migration
 * Collection: anamnesen
 *
 * Ausführen:
 *   node scripts/migrate-firebase.mjs
 *
 * Voraussetzung: firebase-key.json im Projektstamm
 */

import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// .env laden
const dotenv = await import('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// firebase-admin dynamisch laden (wird ggf. vorher installiert)
let admin;
try {
  admin = (await import('firebase-admin')).default;
} catch {
  console.error('firebase-admin fehlt. Installieren mit: npm install firebase-admin');
  process.exit(1);
}

// Prisma
const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient();

// --- Konfiguration ---
const KEY_PATH = path.join(__dirname, '..', 'firebase-key.json');
const COLLECTION = 'anamnesen';

// Mapping Firebase-Kategorie → restart-Status
// Alle bekannten Werte hier eintragen; unbekannte → neukunde
// Firebase-Kategorie → restart-Status
// Labels im alten Dashboard → wahrscheinliche Firebase-Feldwerte (snake_case)
const KATEGORIE_MAP = {
  // "Termin ausstehend" → noch kein Kauf
  termin_ausstehend:            'neukunde',
  // "Angebot erhalten – nachfassen"
  angebot_nachfassen:           'angebot_nachfassen',
  angebot_erhalten_nachfassen:  'angebot_nachfassen',
  // "Kein Angebot – nachfassen"
  kein_angebot_nachfassen:      'angebot_nachfassen',
  // "Starter / Tester"
  starter_tester:               'startangebot',
  startangebot:                 'startangebot',
  // "Mitglied / Karteninhaber"
  mitglied:                     'mitglied',
  mitglied_karteninhaber:       'mitglied',
  karten_kunde:                 'karten_kunde',
  // "Aggregatoren & Kooperationspartner"
  aggregator:                   'aggregator',
  aggregatoren:                 'aggregator',
  // "Archiv"
  archiv:                       'kein_kauf',
  kein_kauf:                    'kein_kauf',
};

const VALID_MAIN_FOCUS = ['schmerzen', 'sport', 'vitalitaet', 'bodyforming', 'beckenboden', 'biohacking'];

// --- Init Firebase ---
const serviceAccount = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// --- Migration ---
async function run() {
  const snapshot = await db.collection(COLLECTION).get();
  console.log(`${snapshot.size} Dokumente gefunden.`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const doc of snapshot.docs) {
    const d = doc.data();

    const email = (d.email ?? '').trim().toLowerCase();
    if (!email) {
      console.warn(`  [SKIP] Kein E-Mail-Feld in Dokument ${doc.id}`);
      skipped++;
      continue;
    }

    const contraindications = d.contraindications ?? d.contraIndications ?? {};
    const kontraindikationen = {
      blutverduenner:   !!contraindications.blutverduenner,
      epilepsie:        !!contraindications.epilepsie,
      herzerkrankungen: !!contraindications.herzerkrankungen,
      herzschrittmacher:!!contraindications.herzschrittmacher,
      krebs:            !!contraindications.krebs,
      metallimplantate: !!contraindications.metallimplantate,
      operation:        !!contraindications.operation,
      schwangerschaft:  !!contraindications.schwangerschaft,
    };
    const keineKontraindikationen = Object.values(kontraindikationen).every((v) => !v);

    const confirmations = d.confirmations ?? {};
    const status = KATEGORIE_MAP[d.kategorie] ?? 'neukunde';
    if (d.kategorie && !KATEGORIE_MAP[d.kategorie]) {
      console.warn(`  [WARN] Unbekannte Kategorie "${d.kategorie}" bei ${email} → neukunde`);
    }
    const mainFocus = VALID_MAIN_FOCUS.includes(d.mainFocus) ? d.mainFocus : null;

    // Timestamp → Date
    let createdAt = new Date();
    if (d.timestamp?.toDate) createdAt = d.timestamp.toDate();
    else if (d.timestamp?.seconds) createdAt = new Date(d.timestamp.seconds * 1000);

    try {
      // Customer upsert (key: email)
      const customer = await prisma.customer.upsert({
        where: { email },
        update: {},  // vorhandene Kunden nicht überschreiben
        create: {
          vorname:         (d.vorname ?? '').trim(),
          nachname:        (d.nachname ?? '').trim(),
          email,
          telefon:         (d.telefon ?? '').trim(),
          geburtsdatum:    (d.geburtsdatum ?? '').trim(),
          adresse:         (d.adresse ?? '').trim(),
          status,
          consentMarketing: false,
          herkunft:        'firebase-import',
          createdAt,
        },
      });

      // Anamnese anlegen
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

      console.log(`  [OK] ${d.vorname} ${d.nachname} <${email}> → Status: ${status}`);
      created++;
    } catch (err) {
      console.error(`  [ERROR] ${email}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\nFertig: ${created} importiert, ${skipped} übersprungen, ${errors} Fehler.`);
  await prisma.$disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
