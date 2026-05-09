import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { getAnwendung, type AnwendungSlug } from '@/data/anwendungen';
import { SLUG_KATEGORIE } from '@/data/preise';

const BLAU = '#00244f';
const TUERKIS = '#00a6e5';
const GRAU = '#6b7280';
const HELLGRAU = '#f3f4f6';

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
    paddingBottom: 50,
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
    marginBottom: 20,
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
    marginBottom: 20,
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
  anwendungCard: {
    backgroundColor: HELLGRAU,
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
  anwendungName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BLAU,
    marginBottom: 3,
  },
  anwendungDetail: {
    fontSize: 9,
    color: TUERKIS,
    marginBottom: 3,
  },
  anwendungBegr: {
    fontSize: 9,
    color: GRAU,
    lineHeight: 1.5,
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
}

export function AngebotPdf({
  kundenName,
  erstelltAm,
  typ,
  anwendungen,
  preisSnapshot,
  zusatzhinweis,
}: AngebotPdfProps) {
  const kategorieToKurzNamen: Record<string, string[]> = {};
  for (const a of anwendungen) {
    const kat = SLUG_KATEGORIE[a.slug];
    if (!kategorieToKurzNamen[kat]) kategorieToKurzNamen[kat] = [];
    try {
      const info = getAnwendung(a.slug);
      kategorieToKurzNamen[kat].push(info.kurzName);
    } catch {
      // unbekannter Slug – überspringen
    }
  }

  const hasPreise = Object.keys(preisSnapshot).length > 0;

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
            <Text style={s.headerLabel}>Angebot für</Text>
            <Text style={s.headerName}>{kundenName}</Text>
            <Text style={s.headerDate}>{formatDatum(erstelltAm)}</Text>
          </View>
        </View>

        {/* Titel */}
        <View style={s.titleSection}>
          <Text style={s.title}>
            {typ === 'neukunde'
              ? 'Ihr persönliches Neukunden-Angebot'
              : 'Ihr persönliches Folgeangebot'}
          </Text>
          <Text style={s.typBadge}>
            Cryopoint Augsburg – Individuelle Empfehlung
          </Text>
        </View>

        {/* Empfohlene Anwendungen */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Empfohlene Anwendungen</Text>
          {anwendungen.map((a, i) => {
            let anwName: string = a.slug;
            try {
              anwName = getAnwendung(a.slug).name;
            } catch {
              // unbekannter Slug
            }
            return (
              <View key={i} style={s.anwendungCard}>
                <Text style={s.anwendungName}>{String(anwName)}</Text>
                <Text style={s.anwendungDetail}>Häufigkeit: {a.haeufigkeitText}</Text>
                <Text style={s.anwendungBegr}>{a.begruendung}</Text>
              </View>
            );
          })}
        </View>

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
                    {label}
                    {namen?.length ? ` (${namen.join(', ')})` : ''}
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

        {/* Zusatzhinweis */}
        {zusatzhinweis && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Hinweise</Text>
            <Text style={s.hinweisText}>{zusatzhinweis}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            Cryopoint Augsburg · Tel. +49 821 8998881 · restart.recovery-augsburg.dev
          </Text>
        </View>
      </Page>
    </Document>
  );
}
