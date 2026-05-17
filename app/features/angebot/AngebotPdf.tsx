import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { getAnwendung } from '@/data/anwendungen';
import { SLUG_KATEGORIE, NEUKUNDEN_ANGEBOT, type Mitgliedschaft } from '@/data/preise';
import { RESEARCH, type Studie } from '@/data/research';
import { SOCIAL_PROOF } from '@/data/socialproof';
import {
  protokollSessionsProMonat,
  berechnePreisvergleich,
  besteLaufzeit,
  formatEuro,
} from './mitgliedschaft-logik';
import { KATEGORIE_LABEL } from './kategorie-label';
import type { AnwendungItem, PreisEntry } from './angebot-data';

export type { AnwendungItem, PreisEntry };

const BLAU = '#00244f';
const TUERKIS = '#00a6e5';
const GRAU = '#6b7280';
const HELLGRAU = '#f3f4f6';
const DUNKELGRAU = '#374151';
const GRUEN = '#0f7b3f';

const VISION_TEXT =
  'Wir verlassen uns heute oft zu sehr auf schnelle Lösungen von außen, anstatt die unglaublichen Fähigkeiten unseres eigenen Körpers zu nutzen. ' +
  'Meine Vision für den Cryopoint Augsburg ist es, dir die Eigenverantwortung für deine Gesundheit zurückzugeben. ' +
  'Ich möchte Teil deiner Lösung sein – egal, ob du Wege suchst, endlich wieder beschwerdefrei zu leben oder deine volle Leistungsfähigkeit auszuschöpfen. ' +
  'Wir bieten dir die Ressourcen, damit du die Veränderung selbst in die Hand nehmen kannst.';

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
  gueltigBadge: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#92400e',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    marginTop: 3,
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
    marginBottom: 14,
  },
  bridgeBox: {
    backgroundColor: '#eef4ff',
    borderRadius: 5,
    padding: 10,
    marginBottom: 14,
  },
  bridgeText: {
    fontSize: 9.5,
    color: BLAU,
    lineHeight: 1.55,
  },
  bridgeBold: {
    fontFamily: 'Helvetica-Bold',
  },
  ctaBox: {
    backgroundColor: BLAU,
    borderRadius: 6,
    padding: 18,
    marginBottom: 14,
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
  ctaGueltig: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#fcd34d',
    textAlign: 'center',
    marginTop: 6,
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
  ctaEmpfBadge: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: BLAU,
    backgroundColor: TUERKIS,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginBottom: 4,
  },
  ctaMitgliedName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: 'white',
    textAlign: 'center',
  },
  ctaMitgliedSessions: {
    fontSize: 9,
    color: '#a0bcd8',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 2,
  },
  ctaLaufzeitRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 4,
  },
  ctaLaufzeitItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ctaLaufzeitItemBest: {
    borderWidth: 1,
    borderColor: TUERKIS,
  },
  ctaLaufzeitMonate: {
    fontSize: 8,
    color: '#a0bcd8',
    textAlign: 'center',
  },
  ctaLaufzeitPreis: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 2,
  },
  ctaLaufzeitBest: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: TUERKIS,
    textAlign: 'center',
    marginTop: 2,
  },
  vergleichBox: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    padding: 12,
    marginBottom: 18,
  },
  vergleichTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: GRUEN,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  vergleichRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  vergleichLabel: {
    fontSize: 9.5,
    color: DUNKELGRAU,
  },
  vergleichWert: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: DUNKELGRAU,
  },
  vergleichErsparnis: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: GRUEN,
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#bbf7d0',
  },
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
  proofBox: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 6,
    padding: 12,
    marginBottom: 18,
  },
  proofTop: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#92400e',
    marginBottom: 6,
  },
  proofTestimonial: {
    marginTop: 6,
  },
  proofText: {
    fontSize: 9,
    color: DUNKELGRAU,
    fontStyle: 'italic',
    lineHeight: 1.55,
  },
  proofName: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: GRAU,
    marginTop: 2,
  },
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

export interface AngebotPdfProps {
  kundenName: string;
  erstelltAm: Date;
  typ: 'neukunde' | 'folge';
  anwendungen: AnwendungItem[];
  preisSnapshot: Record<string, PreisEntry>;
  zusatzhinweis?: string | null;
  einleitung?: string | null;
  mitgliedschaft?: Mitgliedschaft | null;
  gueltigBis?: Date | null;
}

export function AngebotPdf({
  kundenName,
  erstelltAm,
  typ,
  anwendungen,
  preisSnapshot,
  zusatzhinweis,
  einleitung,
  mitgliedschaft,
  gueltigBis,
}: AngebotPdfProps) {
  const coreAnwendungen = anwendungen.filter((a) => {
    try { return getAnwendung(a.slug).kategorie === 'longevity'; } catch { return false; }
  });
  const upsellAnwendungen = anwendungen.filter((a) => {
    try { return getAnwendung(a.slug).kategorie === 'bodyforming'; } catch { return false; }
  });

  const sessionsProMonat = protokollSessionsProMonat(coreAnwendungen);
  const vergleich =
    typ === 'folge' && mitgliedschaft
      ? berechnePreisvergleich(sessionsProMonat, mitgliedschaft)
      : null;
  const beste = mitgliedschaft ? besteLaufzeit(mitgliedschaft) : null;

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
  const zeigeSocialProof = !SOCIAL_PROOF.platzhalter;

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
            {gueltigBis ? (
              <Text style={s.gueltigBadge}>Gültig bis {formatDatum(gueltigBis)}</Text>
            ) : null}
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

        {/* Protokoll → Mitgliedschaft-Brücke */}
        {typ === 'folge' && mitgliedschaft && sessionsProMonat > 0 && (
          <View style={s.bridgeBox}>
            <Text style={s.bridgeText}>
              Dein Protokoll entspricht rund{' '}
              <Text style={s.bridgeBold}>{sessionsProMonat} Sessions pro Monat</Text>.
              {' '}Genau dafür ist der{' '}
              <Text style={s.bridgeBold}>{mitgliedschaft.name}</Text> gemacht.
            </Text>
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
              {gueltigBis ? (
                <Text style={s.ctaGueltig}>Sichere dir das Special bis {formatDatum(gueltigBis)}</Text>
              ) : null}
            </>
          ) : mitgliedschaft ? (
            <>
              <Text style={s.ctaFolgeTitle}>
                Deine Mitgliedschaft – die wirtschaftlich sinnvollste Langfristlösung
              </Text>
              <Text style={s.ctaEmpfBadge}>FÜR DICH EMPFOHLEN</Text>
              <Text style={s.ctaMitgliedName}>{mitgliedschaft.name}</Text>
              <Text style={s.ctaMitgliedSessions}>{mitgliedschaft.inkludierteSessions}</Text>
              {mitgliedschaft.zusatzSession !== null && (
                <Text style={s.ctaHint}>
                  Jede weitere Session: {mitgliedschaft.zusatzSession.toFixed(2).replace('.', ',')} €
                </Text>
              )}
              <View style={s.ctaLaufzeitRow}>
                {mitgliedschaft.laufzeiten.map((lz) => {
                  const istBest = beste ? lz.monate === beste.monate : false;
                  return (
                    <View
                      key={lz.monate}
                      style={[s.ctaLaufzeitItem, istBest ? s.ctaLaufzeitItemBest : {}]}
                    >
                      <Text style={s.ctaLaufzeitMonate}>{lz.monate} {lz.monate === 1 ? 'Monat' : 'Monate'}</Text>
                      <Text style={s.ctaLaufzeitPreis}>{lz.monatsbeitrag.toFixed(2).replace('.', ',')} €</Text>
                      {istBest ? <Text style={s.ctaLaufzeitBest}>BESTER PREIS</Text> : null}
                    </View>
                  );
                })}
              </View>
              <Text style={s.ctaHint}>monatlich, keine Mindestlaufzeit außer gewählter Laufzeit</Text>
              {gueltigBis ? (
                <Text style={s.ctaGueltig}>Dieses Angebot gilt bis {formatDatum(gueltigBis)}</Text>
              ) : null}
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
              {gueltigBis ? (
                <Text style={s.ctaGueltig}>Dieses Angebot gilt bis {formatDatum(gueltigBis)}</Text>
              ) : null}
            </>
          )}
        </View>

        {/* Preisvergleich */}
        {vergleich && (
          <View style={s.vergleichBox}>
            <Text style={s.vergleichTitle}>Was sich für dich rechnet</Text>
            <View style={s.vergleichRow}>
              <Text style={s.vergleichLabel}>
                Einzeln gebucht ({vergleich.sessions} Sessions × {formatEuro(vergleich.einzelpreis)})
              </Text>
              <Text style={s.vergleichWert}>{formatEuro(vergleich.einzelProMonat)} / Monat</Text>
            </View>
            <View style={s.vergleichRow}>
              <Text style={s.vergleichLabel}>
                Mit {mitgliedschaft?.name} ({vergleich.laufzeitMonate} Monate)
              </Text>
              <Text style={s.vergleichWert}>{formatEuro(vergleich.mitgliedschaftProMonat)} / Monat</Text>
            </View>
            {vergleich.ersparnisProMonat > 0 && (
              <Text style={s.vergleichErsparnis}>
                Du sparst {formatEuro(vergleich.ersparnisProMonat)} pro Monat
                {' '}– rund {formatEuro(vergleich.ersparnisProJahr)} im Jahr.
              </Text>
            )}
          </View>
        )}

        {/* Upsell */}
        {upsellAnwendungen.length > 0 && (
          <View style={s.upsellBox}>
            <Text style={s.upsellTitle}>Zusatz-Fokus: Bodyforming & Funktion</Text>
            {upsellAnwendungen.map(renderUpsellItem)}
          </View>
        )}

        {/* Social Proof */}
        {zeigeSocialProof && (
          <View style={s.proofBox}>
            <Text style={s.proofTop}>
              {SOCIAL_PROOF.bewertung.toFixed(1).replace('.', ',')} / 5 bei {SOCIAL_PROOF.bewertungQuelle}
              {SOCIAL_PROOF.bewertungAnzahl > 0 ? ` (${SOCIAL_PROOF.bewertungAnzahl} Bewertungen)` : ''}
              {'  ·  '}{SOCIAL_PROOF.mitgliederText}
            </Text>
            {SOCIAL_PROOF.testimonials.map((t, i) => (
              <View key={i} style={s.proofTestimonial}>
                <Text style={s.proofText}>{`"${t.text}"`}</Text>
                <Text style={s.proofName}>— {t.name}, {t.kontext}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Preisübersicht */}
        {hasPreise && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Preisübersicht</Text>
            {Object.entries(preisSnapshot).map(([kat, preise]) => {
              const namen = kategorieToKurzNamen[kat];
              const label = KATEGORIE_LABEL[kat] ?? kat;
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
