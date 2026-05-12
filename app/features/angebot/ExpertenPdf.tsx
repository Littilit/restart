import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { getAnwendung, type AnwendungSlug } from '@/data/anwendungen';
import { RESEARCH, type Studie } from '@/data/research';

const BLAU = '#00244f';
const TUERKIS = '#00a6e5';
const GRAU = '#6b7280';
const HELLGRAU = '#f3f4f6';
const DUNKELGRAU = '#374151';

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
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: BLAU,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  section: {
    marginBottom: 22,
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
    marginBottom: 14,
  },
  anwendungHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 6,
  },
  anwendungName: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: BLAU,
  },
  anwendungFrequenz: {
    fontSize: 9,
    color: TUERKIS,
    marginBottom: 4,
  },
  anwendungBegruendung: {
    fontSize: 9,
    color: DUNKELGRAU,
    lineHeight: 1.5,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  mechanismusLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: BLAU,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  mechanismusText: {
    fontSize: 9,
    color: GRAU,
    lineHeight: 1.55,
    marginBottom: 4,
  },
  studieRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  studieNr: {
    fontSize: 8,
    color: TUERKIS,
    width: 14,
    flexShrink: 0,
  },
  studieText: {
    fontSize: 8,
    color: GRAU,
    lineHeight: 1.5,
    flex: 1,
  },
  protokollRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  protokollName: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: BLAU,
    width: 150,
    flexShrink: 0,
  },
  protokollFrequenz: {
    fontSize: 9,
    color: DUNKELGRAU,
    flex: 1,
  },
  literaturBlock: {
    marginBottom: 4,
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
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 10,
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

export interface ExpertenPdfProps {
  kundenName: string;
  erstelltAm: Date;
  anwendungen: AnwendungItem[];
  einleitung?: string | null;
  zusatzhinweis?: string | null;
}

export function ExpertenPdf({
  kundenName,
  erstelltAm,
  anwendungen,
  einleitung,
  zusatzhinweis,
}: ExpertenPdfProps) {
  // Alle Studien gesammelt mit globalem Index
  const allStudien: Array<{ studie: Studie; globalNr: number; slug: AnwendungSlug }> = [];
  let globalNr = 1;
  for (const a of anwendungen) {
    const research = RESEARCH[a.slug];
    if (research) {
      for (const s of research.studien) {
        allStudien.push({ studie: s, globalNr: globalNr++, slug: a.slug });
      }
    }
  }

  // Mapping slug → Studien-Nummern für Anwendungs-Sektion
  const slugToNummern: Record<string, number[]> = {};
  for (const { slug, globalNr: nr } of allStudien) {
    if (!slugToNummern[slug]) slugToNummern[slug] = [];
    slugToNummern[slug].push(nr);
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
            <Text style={s.headerLabel}>Expertenempfehlung für</Text>
            <Text style={s.headerName}>{kundenName}</Text>
            <Text style={s.headerDate}>{formatDatum(erstelltAm)}</Text>
          </View>
        </View>

        {/* Titel */}
        <View style={s.titleSection}>
          <Text style={s.title}>Wissenschaftlich fundierte Therapieempfehlung</Text>
          <Text style={s.typBadge}>Cryopoint Augsburg – Individuelle Expertenempfehlung</Text>
        </View>

        {/* 1. Einleitung */}
        {einleitung && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Einleitung & Zielsetzung</Text>
            <Text style={s.einleitungText}>{einleitung}</Text>
          </View>
        )}

        {/* 2. Pro Anwendung: Wirkmechanismus + Studien */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Empfohlene Anwendungen – Wirkmechanismus & Studienlage</Text>
          {anwendungen.map((a) => {
            const anw = (() => {
              try { return getAnwendung(a.slug); } catch { return null; }
            })();
            const research = RESEARCH[a.slug];
            const nummern = slugToNummern[a.slug] ?? [];

            return (
              <View key={a.slug} style={s.anwendungBlock}>
                <View style={s.anwendungHeader}>
                  <Text style={s.anwendungName}>{anw?.name ?? a.slug}</Text>
                </View>

                <Text style={s.anwendungFrequenz}>
                  Protokoll: {a.haeufigkeitText || (research?.sessions ?? '–')}
                </Text>

                {a.begruendung ? (
                  <Text style={s.anwendungBegruendung}>{a.begruendung}</Text>
                ) : null}

                {research && (
                  <>
                    <Text style={s.mechanismusLabel}>Wirkmechanismus</Text>
                    <Text style={s.mechanismusText}>{research.mechanism}</Text>

                    {nummern.length > 0 && (
                      <>
                        <Text style={s.mechanismusLabel}>
                          Studienlage [{nummern.join(', ')}]
                        </Text>
                        {research.studien.map((st, si) => (
                          <View key={si} style={s.studieRow}>
                            <Text style={s.studieNr}>[{nummern[si]}]</Text>
                            <Text style={s.studieText}>
                              {st.autoren} ({st.jahr}): {st.ergebnis}
                            </Text>
                          </View>
                        ))}
                      </>
                    )}
                  </>
                )}

                <View style={s.divider} />
              </View>
            );
          })}
        </View>

        {/* 3. Gesamtprotokoll */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Gesamtprotokoll</Text>
          {anwendungen.map((a) => {
            const anw = (() => {
              try { return getAnwendung(a.slug); } catch { return null; }
            })();
            return (
              <View key={a.slug} style={s.protokollRow}>
                <Text style={s.protokollName}>{anw?.name ?? a.slug}</Text>
                <Text style={s.protokollFrequenz}>
                  {a.haeufigkeitText || RESEARCH[a.slug]?.sessions || '–'}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Zusatzhinweis */}
        {zusatzhinweis && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Zusatzhinweise</Text>
            <Text style={s.einleitungText}>{zusatzhinweis}</Text>
          </View>
        )}

        {/* 4. Literaturverzeichnis */}
        {allStudien.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Literaturverzeichnis</Text>
            {allStudien.map(({ studie, globalNr: nr }) => (
              <View key={nr} style={s.literaturBlock}>
                <Text style={s.literaturNr}>[{nr}]</Text>
                <Text style={s.literaturTitel}>{studie.titel}</Text>
                <Text style={s.literaturMeta}>
                  {studie.autoren}, {studie.jahr}
                </Text>
                <Text style={s.literaturErgebnis}>{studie.ergebnis}</Text>
              </View>
            ))}
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
