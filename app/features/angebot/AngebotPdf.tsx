import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { getAnwendung, type AnwendungSlug } from '@/data/anwendungen';
import { SLUG_KATEGORIE, NEUKUNDEN_ANGEBOT } from '@/data/preise';
import { RESEARCH, type Studie } from '@/data/research';

const BLAU = '#00244f';
const TUERKIS = '#00a6e5';
const GRAU = '#6b7280';
const HELLGRAU = '#f3f4f6';
const DUNKELGRAU = '#374151';

const VISION_TEXT =
  'Ich habe den Cryopoint Augsburg gegründet, weil ich am eigenen Leib erfahren habe, ' +
  'dass herkömmliche Methoden oft an ihre Grenzen stoßen. Meine Vision ist es, jedem Zugang zu den ' +
  'Technologien zu verschaffen, die sonst nur Profisportlern vorbehalten sind. ' +
  'Wir heilen nicht – wir geben deinem Körper die Ressourcen zurück, sich selbst zu optimieren.';

const KATEGORIE_NAME: Record<string, string> = {
  regenerate: 'Regenerate',
  armstrong: 'Armstrong MMS',
  cryoshaper_focus: 'Cryoshaper Focus',
  cryoshaper_face: 'Cryoshaper Face',
  cryoshaper_body: 'Cryoshaper Body',
  beckenbodenstuhl: 'Beckenbodenstuhl MMS',
};

function formatPreis(preis: number): string {
  if (preis === 0) return 'auf Anfrage';
  return `${preis.toFixed(2).replace('.', ',')} €`;
}

function formatDatum(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: DUNKELGRAU,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 45,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: BLAU,
  },
  logoText: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: BLAU,
    letterSpacing: 2,
  },
  logoSub: {
    fontSize: 9,
    color: TUERKIS,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerLabel: {
    fontSize: 8,
    color: GRAU,
    marginBottom: 2,
  },
  headerName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: BLAU,
  },
  headerDate: {
    fontSize: 8.5,
    color: GRAU,
    marginTop: 2,
  },
  visionBox: {
    backgroundColor: '#eef4ff',
    borderLeftWidth: 4,
    borderLeftColor: BLAU,
    borderStyle: 'solid',
    padding: 12,
    marginBottom: 18,
  },
  visionText: {
    fontSize: 9.5,
    color: DUNKELGRAU,
    lineHeight: 1.65,
    fontStyle: 'italic',
  },
  visionAttrib: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: BLAU,
    marginTop: 6,
  },
  h2: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: BLAU,
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
    paddingBottom: 5,
    marginBottom: 10,
  },
  introText: {
    fontSize: 9.5,
    color: DUNKELGRAU,
    lineHeight: 1.6,
    marginBottom: 12,
  },
  // Tabelle Core-Stack
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: BLAU,
  },
  tableHeaderCell: {
    padding: 8,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: 'white',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  tableRowAlt: {
    backgroundColor: '#f9f9f9',
  },
  tableCell: {
    padding: 10,
  },
  colAnwendung: { flex: 2 },
  colNutzen: { flex: 5 },
  colFrequenz: { flex: 2 },
  tableCellName: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: BLAU,
  },
  tableCellNutzen: {
    fontSize: 9,
    color: DUNKELGRAU,
    lineHeight: 1.55,
  },
  tableCellBegr: {
    fontSize: 8.5,
    color: GRAU,
    lineHeight: 1.5,
    fontStyle: 'italic',
    marginTop: 4,
  },
  tableCellFreq: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: BLAU,
  },
  tableWrapper: {
    marginBottom: 20,
  },
  // CTA-Box
  ctaBox: {
    backgroundColor: BLAU,
    borderRadius: 6,
    padding: 18,
    marginBottom: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: 'white',
    marginBottom: 6,
    textAlign: 'center',
  },
  ctaIntro: {
    fontSize: 9,
    color: '#a0bcd8',
    textAlign: 'center',
    marginBottom: 4,
  },
  ctaPrice: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: 'white',
    marginVertical: 5,
    textAlign: 'center',
  },
  ctaHint: {
    fontSize: 8.5,
    color: '#a0bcd8',
    textAlign: 'center',
    marginTop: 3,
  },
  ctaFolgeTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaFolgeText: {
    fontSize: 9,
    color: '#a0bcd8',
    lineHeight: 1.6,
    textAlign: 'center',
  },
  // Upsell
  upsellBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cccccc',
    backgroundColor: '#fafafa',
    padding: 12,
    marginBottom: 18,
  },
  upsellTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: GRAU,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  upsellItem: {
    marginBottom: 7,
  },
  upsellName: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: DUNKELGRAU,
    marginBottom: 2,
  },
  upsellText: {
    fontSize: 9,
    color: GRAU,
    lineHeight: 1.5,
  },
  // Preise
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: BLAU,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  preisBlock: {
    marginBottom: 12,
  },
  preisKat: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BLAU,
    marginBottom: 4,
  },
  preisRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 3,
  },
  preisItem: {
    fontSize: 9,
    color: GRAU,
  },
  kartenItem: {
    fontSize: 9,
    color: GRAU,
    marginBottom: 2,
  },
  hinweisText: {
    fontSize: 9,
    color: GRAU,
    lineHeight: 1.6,
    backgroundColor: HELLGRAU,
    padding: 10,
    borderRadius: 4,
  },
  // Quellenverzeichnis
  literaturBlock: {
    marginBottom: 5,
  },
  literaturNr: {
    fontSize: 8,
    color: TUERKIS,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 1,
  },
  literaturTitel: {
    fontSize: 8,
    color: DUNKELGRAU,
    lineHeight: 1.4,
  },
  literaturMeta: {
    fontSize: 8,
    color: GRAU,
  },
  literaturErgebnis: {
    fontSize: 8,
    color: GRAU,
    lineHeight: 1.4,
    fontStyle: 'italic',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 45,
    right: 45,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  footerContact: {
    fontSize: 8,
    color: GRAU,
    textAlign: 'center',
    marginBottom: 3,
  },
  legalText: {
    fontSize: 7.5,
    color: GRAU,
    lineHeight: 1.5,
  },
});

export interface AnwendungItem {
  slug: AnwendungSlug;
  haeufigkeitText: string;
  begruendung: string;
}

export interface PreisEntry {
  probe: number;
  einzel: number;
  karten: { menge: number; preis: number }[];
}

export interface AngebotPdfProps {
  kundenName: string;
  erstelltAm: Date;
  typ: 'neukunde' | 'folge';
  anwendungen: AnwendungItem[];
  preisSnapshot: Record<string, PreisEntry>;
  zusatzhinweis?: string | null;
  einleitung?: string | null;
}

export function AngebotPdf({
  kundenName,
  erstelltAm,
  typ,
  anwendungen,
  preisSnapshot,
  zusatzhinweis,
  einleitung,
}: AngebotPdfProps) {
  const coreAnwendungen = anwendungen.filter((a) => {
    try { return getAnwendung(a.slug).kategorie === 'longevity'; } catch { return false; }
  });
  const upsellAnwendungen = anwendungen.filter((a) => {
    try { return getAnwendung(a.slug).kategorie === 'bodyforming'; } catch { return false; }
  });

  const allStudien: Array<{ studie: Studie; globalNr: number }> = [];
  let globalNr = 1;
  for (const a of anwendungen) {
    const research = RESEARCH[a.slug];
    if (research) {
      for (const studie of research.studien) {
        allStudien.push({ studie, globalNr: globalNr++ });
      }
    }
  }

  const kategorieToKurzNamen: Record<string, string[]> = {};
  for (const a of anwendungen) {
    const kat = SLUG_KATEGORIE[a.slug];
    if (!kategorieToKurzNamen[kat]) kategorieToKurzNamen[kat] = [];
    try {
      kategorieToKurzNamen[kat].push(getAnwendung(a.slug).kurzName);
    } catch { /* unbekannter Slug */ }
  }

  const hasPreise = Object.keys(preisSnapshot).length > 0;

  function renderTableRow(a: AnwendungItem, index: number) {
    let anwName: string = a.slug;
    try { anwName = getAnwendung(a.slug).kurzName; } catch { /* */ }
    const research = RESEARCH[a.slug];
    const isAlt = index % 2 === 1;
    return (
      <View key={a.slug} style={[s.tableRow, isAlt ? s.tableRowAlt : {}]}>
        <View style={[s.tableCell, s.colAnwendung]}>
          <Text style={s.tableCellName}>{anwName}</Text>
        </View>
        <View style={[s.tableCell, s.colNutzen]}>
          <Text style={s.tableCellNutzen}>{research?.nutzen ?? '–'}</Text>
          {a.begruendung ? (
            <Text style={s.tableCellBegr}>{a.begruendung}</Text>
          ) : null}
        </View>
        <View style={[s.tableCell, s.colFrequenz]}>
          <Text style={s.tableCellFreq}>
            {a.haeufigkeitText || research?.sessions || '–'}
          </Text>
        </View>
      </View>
    );
  }

  function renderUpsellItem(a: AnwendungItem) {
    let anwName: string = a.slug;
    try { anwName = getAnwendung(a.slug).name; } catch { /* */ }
    const research = RESEARCH[a.slug];
    return (
      <View key={a.slug} style={s.upsellItem}>
        <Text style={s.upsellName}>
          {anwName}{a.haeufigkeitText ? ` · ${a.haeufigkeitText}` : ''}
        </Text>
        <Text style={s.upsellText}>
          {a.begruendung || research?.nutzen || '–'}
        </Text>
      </View>
    );
  }

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.logoText}>CRYOPOINT</Text>
            <Text style={s.logoSub}>Augsburg</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerLabel}>
              {typ === 'neukunde' ? 'Expertenempfehlung für' : 'Folgeangebot für'}
            </Text>
            <Text style={s.headerName}>{kundenName}</Text>
            <Text style={s.headerDate}>{formatDatum(erstelltAm)}</Text>
          </View>
        </View>

        {/* Vision */}
        <View style={s.visionBox}>
          <Text style={s.visionText}>{`"${VISION_TEXT}"`}</Text>
          <Text style={s.visionAttrib}>— Tim Lischke, Inhaber</Text>
        </View>

        {/* Strategie-Überschrift + Einleitung */}
        <Text style={s.h2}>Deine individuelle Biohacking-Strategie</Text>
        {einleitung ? (
          <Text style={s.introText}>{einleitung}</Text>
        ) : null}

        {/* Core-Stack Tabelle */}
        {coreAnwendungen.length > 0 && (
          <View style={s.tableWrapper}>
            <View style={s.tableHeaderRow}>
              <View style={[s.tableHeaderCell, s.colAnwendung]}>
                <Text>Anwendung</Text>
              </View>
              <View style={[s.tableHeaderCell, s.colNutzen]}>
                <Text>Dein Nutzen</Text>
              </View>
              <View style={[s.tableHeaderCell, s.colFrequenz]}>
                <Text>Frequenz</Text>
              </View>
            </View>
            {coreAnwendungen.map((a, i) => renderTableRow(a, i))}
          </View>
        )}

        {/* CTA */}
        <View style={s.ctaBox}>
          {typ === 'neukunde' ? (
            <>
              <Text style={s.ctaTitle}>Dein Start: Das Neukunden-Special</Text>
              <Text style={s.ctaIntro}>
                Etabliere deinen persönlichen Rhythmus in den ersten {NEUKUNDEN_ANGEBOT.gueltigkeitWochen} Wochen:
              </Text>
              <Text style={s.ctaPrice}>
                {NEUKUNDEN_ANGEBOT.sessions} Sessions für {NEUKUNDEN_ANGEBOT.preis} €
              </Text>
              <Text style={s.ctaHint}>{NEUKUNDEN_ANGEBOT.hinweis}</Text>
              <Text style={s.ctaHint}>Frei aufteilbar auf alle Core-Anwendungen.</Text>
            </>
          ) : (
            <>
              <Text style={s.ctaFolgeTitle}>
                Deine Mitgliedschaft – die wirtschaftlich sinnvollste Langfristlösung
              </Text>
              <Text style={s.ctaFolgeText}>
                Als regelmäßiger Nutzer empfehlen wir dir eine Mitgliedschaft – unbegrenzt oder mit Monatskontingent.
                So holst du das Maximum aus deiner Routine heraus, zu den besten Konditionen.
              </Text>
            </>
          )}
        </View>

        {/* Upsell */}
        {upsellAnwendungen.length > 0 && (
          <View style={s.upsellBox}>
            <Text style={s.upsellTitle}>Zusatz-Fokus: Bodyforming & Funktion</Text>
            {upsellAnwendungen.map(renderUpsellItem)}
          </View>
        )}

        {/* Preisübersicht */}
        {hasPreise && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Preisübersicht</Text>
            {Object.entries(preisSnapshot).map(([kat, preise]) => {
              const namen = kategorieToKurzNamen[kat];
              const label = KATEGORIE_NAME[kat] ?? kat;
              return (
                <View key={kat} style={s.preisBlock}>
                  <Text style={s.preisKat}>
                    {label}{namen?.length ? ` (${namen.join(', ')})` : ''}
                  </Text>
                  <View style={s.preisRow}>
                    {preise.probe > 0 && (
                      <Text style={s.preisItem}>Probe: {formatPreis(preise.probe)}</Text>
                    )}
                    {preise.einzel > 0 && (
                      <Text style={s.preisItem}>Einzel: {formatPreis(preise.einzel)}</Text>
                    )}
                  </View>
                  {preise.karten
                    .filter((k) => k.preis > 0)
                    .map((k, j) => (
                      <Text key={j} style={s.kartenItem}>
                        {k.menge}er Karte: {formatPreis(k.preis)}
                      </Text>
                    ))}
                </View>
              );
            })}
          </View>
        )}

        {/* Hinweise */}
        {zusatzhinweis && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Hinweise</Text>
            <Text style={s.hinweisText}>{zusatzhinweis}</Text>
          </View>
        )}

        {/* Quellenverzeichnis */}
        {allStudien.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Wissenschaftliche Quellen</Text>
            {allStudien.map(({ studie, globalNr: nr }) => (
              <View key={nr} style={s.literaturBlock}>
                <Text style={s.literaturNr}>[{nr}]</Text>
                <Text style={s.literaturTitel}>{studie.titel}</Text>
                <Text style={s.literaturMeta}>{studie.autoren}, {studie.jahr}</Text>
                <Text style={s.literaturErgebnis}>{studie.ergebnis}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerContact}>
            Cryopoint Augsburg · Tel. +49 821 8998881 · restart.recovery-augsburg.dev
          </Text>
          <Text style={s.legalText}>
            Rechtlicher Hinweis: Unsere Anwendungen dienen der allgemeinen Gesundheitsförderung und Regeneration.
            Sie ersetzen keine ärztliche Behandlung oder Diagnose. Wir geben ausdrücklich keine Heilversprechen ab.
            Alle genannten Erfahrungen basieren auf Kundenberichten und der aktuellen Studienlage.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
