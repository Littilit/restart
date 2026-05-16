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
    color: BLAU,
    paddingTop: 40,
    paddingBottom: 55,
    paddingHorizontal: 45,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: TUERKIS,
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
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: BLAU,
  },
  headerDate: {
    fontSize: 9,
    color: GRAU,
    marginTop: 2,
  },
  titleSection: {
    marginTop: 18,
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: TUERKIS,
  },
  typBadge: {
    marginTop: 5,
    fontSize: 9,
    color: GRAU,
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
  visionBox: {
    backgroundColor: HELLGRAU,
    borderRadius: 4,
    padding: 12,
  },
  visionText: {
    fontSize: 9.5,
    color: DUNKELGRAU,
    lineHeight: 1.65,
    fontStyle: 'italic',
  },
  visionAttrib: {
    fontSize: 8.5,
    color: GRAU,
    marginTop: 6,
  },
  einleitungText: {
    fontSize: 9.5,
    color: DUNKELGRAU,
    lineHeight: 1.6,
    backgroundColor: HELLGRAU,
    padding: 10,
    borderRadius: 4,
  },
  anwendungBlock: {
    marginBottom: 12,
  },
  anwendungName: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: BLAU,
    marginBottom: 3,
  },
  anwendungLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: TUERKIS,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
    marginTop: 4,
  },
  anwendungMechanism: {
    fontSize: 9,
    color: GRAU,
    lineHeight: 1.55,
    marginBottom: 3,
  },
  anwendungFrequenz: {
    fontSize: 9,
    color: DUNKELGRAU,
    marginBottom: 3,
  },
  anwendungBegr: {
    fontSize: 9,
    color: GRAU,
    lineHeight: 1.5,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginTop: 8,
    marginBottom: 4,
  },
  ctaBox: {
    backgroundColor: HELLGRAU,
    borderRadius: 4,
    padding: 12,
  },
  ctaHighlight: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: TUERKIS,
    marginBottom: 4,
  },
  ctaDetail: {
    fontSize: 10,
    color: BLAU,
    marginBottom: 2,
  },
  ctaHinweis: {
    fontSize: 8.5,
    color: GRAU,
    lineHeight: 1.5,
    marginTop: 4,
  },
  ctaFolgeText: {
    fontSize: 9.5,
    color: DUNKELGRAU,
    lineHeight: 1.6,
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
  legalText: {
    fontSize: 8,
    color: GRAU,
    lineHeight: 1.5,
    marginTop: 6,
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
  footerText: {
    fontSize: 8,
    color: GRAU,
    textAlign: 'center',
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

  // Studiensammlung für Literaturverzeichnis
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
    } catch {
      // unbekannter Slug
    }
  }

  const hasPreise = Object.keys(preisSnapshot).length > 0;

  function renderAnwendungBlock(a: AnwendungItem) {
    let anwName: string = a.slug;
    try { anwName = getAnwendung(a.slug).name; } catch { /* unbekannter Slug */ }
    const research = RESEARCH[a.slug];
    return (
      <View key={a.slug} style={s.anwendungBlock}>
        <Text style={s.anwendungName}>{anwName}</Text>
        {research && (
          <>
            <Text style={s.anwendungLabel}>Warum für dich?</Text>
            <Text style={s.anwendungMechanism}>{research.mechanism}</Text>
          </>
        )}
        <Text style={s.anwendungLabel}>Empfehlung</Text>
        <Text style={s.anwendungFrequenz}>{a.haeufigkeitText || research?.sessions || '–'}</Text>
        {a.begruendung ? (
          <Text style={s.anwendungBegr}>{a.begruendung}</Text>
        ) : null}
        <View style={s.divider} />
      </View>
    );
  }

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* 1. Header */}
        <View style={s.header}>
          <View>
            <Text style={s.logoText}>CRYOPOINT</Text>
            <Text style={s.logoSub}>Augsburg</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerLabel}>Angebot für</Text>
            <Text style={s.headerName}>{kundenName}</Text>
            <Text style={s.headerDate}>{formatDatum(erstelltAm)}</Text>
          </View>
        </View>

        {/* 2. Titel */}
        <View style={s.titleSection}>
          <Text style={s.title}>
            {typ === 'neukunde'
              ? 'Dein persönliches Neukunden-Angebot'
              : 'Dein persönliches Folgeangebot'}
          </Text>
          <Text style={s.typBadge}>Cryopoint Augsburg – Individuelle Empfehlung</Text>
        </View>

        {/* 3. Vision */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Warum das für dich Sinn macht</Text>
          <View style={s.visionBox}>
            <Text style={s.visionText}>
              {`Dein Körper ist anpassungsfähiger, als du glaubst. Die richtigen Reize zur richtigen Zeit – das ist das Prinzip hinter allem, was wir bei Cryopoint tun. Deine Empfehlung heute ist kein Standard – sie ist der Einstieg in eine Routine, die zu dir passt.`}
            </Text>
            <Text style={s.visionAttrib}>– Tim Lischke, Cryopoint Augsburg</Text>
          </View>
        </View>

        {/* 4. Individuelle Strategie */}
        {einleitung && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Deine individuelle Strategie</Text>
            <Text style={s.einleitungText}>{einleitung}</Text>
          </View>
        )}

        {/* 5. Core-Regenerations-Stack */}
        {coreAnwendungen.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Core-Regenerations-Stack</Text>
            {coreAnwendungen.map(renderAnwendungBlock)}
          </View>
        )}

        {/* 6. Bodyforming- & Funktions-Block (Upsell) – nur wenn vorhanden */}
        {upsellAnwendungen.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Bodyforming- &amp; Funktions-Block (Upsell)</Text>
            {upsellAnwendungen.map(renderAnwendungBlock)}
          </View>
        )}

        {/* 7. CTA – typabhängig */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Dein nächster Schritt</Text>
          {typ === 'neukunde' ? (
            <View style={s.ctaBox}>
              <Text style={s.ctaHighlight}>
                Neukunden-Special: {NEUKUNDEN_ANGEBOT.sessions} Sessions · {NEUKUNDEN_ANGEBOT.preis} € · {NEUKUNDEN_ANGEBOT.gueltigkeitWochen} Wochen
              </Text>
              <Text style={s.ctaDetail}>
                Starte jetzt mit deinem persönlichen Einstiegspaket – frei auf alle Core-Anwendungen aufteilbar.
              </Text>
              <Text style={s.ctaHinweis}>{NEUKUNDEN_ANGEBOT.hinweis}</Text>
              <Text style={s.ctaHinweis}>
                Langfristig empfehlen wir dir eine unserer Mitgliedschaften für die regelmäßige Nutzung.
              </Text>
            </View>
          ) : (
            <View style={s.ctaBox}>
              <Text style={s.ctaHighlight}>Deine Mitgliedschaft – die wirtschaftlich sinnvollste Langfristlösung</Text>
              <Text style={s.ctaFolgeText}>
                Als regelmäßiger Nutzer von Cryopoint empfehlen wir dir eine Mitgliedschaft – unbegrenzt oder mit Monatskontingent. So holst du das Maximum aus deiner Routine heraus, zu den besten Konditionen.
              </Text>
            </View>
          )}
        </View>

        {/* 8. Preisübersicht */}
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

        {/* 9. Hinweise */}
        {zusatzhinweis && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Hinweise</Text>
            <Text style={s.hinweisText}>{zusatzhinweis}</Text>
          </View>
        )}

        {/* 10. Wissenschaftliches Quellenverzeichnis */}
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

        {/* 11. Footer + Rechtlicher Hinweis */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            Cryopoint Augsburg · Tel. +49 821 8998881 · restart.recovery-augsburg.dev
          </Text>
          <Text style={s.legalText}>
            Diese Empfehlung dient der Orientierung und stellt keine Heilaussage dar. Cryopoint Augsburg ist keine medizinische Einrichtung. Bei gesundheitlichen Beschwerden wende dich an einen Arzt.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
