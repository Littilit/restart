import { FlaskConical, Star } from 'lucide-react';
import { getAnwendung } from '@/data/anwendungen';
import { RESEARCH } from '@/data/research';
import { NEUKUNDEN_ANGEBOT } from '@/data/preise';
import { SOCIAL_PROOF } from '@/data/socialproof';
import { KATEGORIE_LABEL } from './kategorie-label';
import {
  berechnePreisvergleich,
  besteLaufzeit,
  formatEuro,
} from './mitgliedschaft-logik';
import { AngebotZusage } from './AngebotZusage';
import type { AngebotDaten } from './angebot-data';

const STUDIO_TELEFON = process.env.NEXT_PUBLIC_STUDIO_PHONE ?? '+49 821 8998881';

const VISION_TEXT =
  'Wir verlassen uns heute oft zu sehr auf schnelle Lösungen von außen, anstatt die ' +
  'unglaublichen Fähigkeiten unseres eigenen Körpers zu nutzen. Meine Vision für den ' +
  'Cryopoint Augsburg ist es, dir die Eigenverantwortung für deine Gesundheit ' +
  'zurückzugeben. Ich möchte Teil deiner Lösung sein – egal, ob du Wege suchst, endlich ' +
  'wieder beschwerdefrei zu leben oder deine volle Leistungsfähigkeit auszuschöpfen.';

function formatDatum(d: Date): string {
  return new Date(d).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function AngebotView({ angebot, token }: { angebot: AngebotDaten; token: string }) {
  const vorname = angebot.kundenName.split(' ')[0];
  const coreAnwendungen = angebot.anwendungen.filter((a) => {
    try { return getAnwendung(a.slug).kategorie === 'longevity'; } catch { return false; }
  });
  const upsellAnwendungen = angebot.anwendungen.filter((a) => {
    try { return getAnwendung(a.slug).kategorie === 'bodyforming'; } catch { return false; }
  });

  const spm = angebot.sessionsProMonat;
  const m = angebot.mitgliedschaft;
  const vergleich = angebot.typ === 'folge' && m && spm ? berechnePreisvergleich(spm, m) : null;
  const beste = m ? besteLaufzeit(m) : null;
  const zeigeSocialProof = !SOCIAL_PROOF.platzhalter;

  return (
    <main className="min-h-screen bg-cp-grauweis pb-16">
      <div className="mx-auto max-w-xl px-4 py-6 space-y-6">

        {/* Header */}
        <header className="flex items-end justify-between border-b-2 border-cp-blau pb-3">
          <div>
            <p className="text-xl font-bold tracking-widest text-cp-blau">CRYOPOINT</p>
            <p className="text-xs text-cp-tuerkis">Augsburg</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-500">
              {angebot.typ === 'neukunde' ? 'Persönliche Empfehlung für' : 'Folgeangebot für'}
            </p>
            <p className="text-sm font-bold text-cp-blau">{angebot.kundenName}</p>
            <p className="text-[11px] text-gray-400">{formatDatum(angebot.erstelltAm)}</p>
          </div>
        </header>

        {angebot.gueltigBis && (
          <div className="rounded-lg bg-amber-100 px-3 py-2 text-center text-sm font-semibold text-amber-900">
            Dieses Angebot gilt bis {formatDatum(angebot.gueltigBis)}
          </div>
        )}

        {/* Vision */}
        <section className="rounded-xl border-l-4 border-cp-blau bg-[#eef4ff] px-4 py-3">
          <p className="text-xs italic leading-relaxed text-gray-600">„{VISION_TEXT}"</p>
          <p className="mt-1.5 text-xs font-bold text-cp-blau">— Tim Lischke, Inhaber</p>
        </section>

        {/* Individuelle Analyse */}
        {angebot.einleitung && (
          <section>
            <h1 className="text-base font-bold text-cp-blau mb-1">
              {vorname}, das ist deine individuelle Strategie
            </h1>
            <p className="text-sm leading-relaxed text-gray-700">{angebot.einleitung}</p>
          </section>
        )}

        {/* Protokoll */}
        {coreAnwendungen.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-cp-braun/70">
              Dein Protokoll
            </h2>
            {coreAnwendungen.map((a) => {
              const anwendung = getAnwendung(a.slug);
              const research = RESEARCH[a.slug];
              return (
                <div
                  key={a.slug}
                  className="rounded-xl border border-cp-blau/10 bg-white px-4 py-4 space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl leading-none" aria-hidden>{anwendung.emoji}</span>
                    <p className="font-bold text-cp-blau">{anwendung.name}</p>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700">
                    {research?.nutzen ?? anwendung.teaser}
                  </p>
                  {a.begruendung && (
                    <p className="text-sm italic leading-relaxed text-cp-braun">{a.begruendung}</p>
                  )}
                  {research?.shortClaim && (
                    <div className="flex gap-2 pt-0.5">
                      <FlaskConical className="mt-0.5 h-3 w-3 shrink-0 text-cp-tuerkis" />
                      <p className="text-xs leading-relaxed text-gray-400">{research.shortClaim}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* Brücke Protokoll → Mitgliedschaft */}
        {angebot.typ === 'folge' && m && spm && spm > 0 && (
          <section className="rounded-xl bg-[#eef4ff] px-4 py-3">
            <p className="text-sm leading-relaxed text-cp-blau">
              Dein Plan umfasst rund{' '}
              <span className="font-bold">{spm} Sessions pro Monat</span>. Genau dafür ist der{' '}
              <span className="font-bold">{m.name}</span> gemacht – damit du deinen Plan ohne
              Rechnerei durchziehen kannst.
            </p>
          </section>
        )}

        {/* Angebot / CTA-Block */}
        {angebot.typ === 'neukunde' ? (
          <section className="rounded-xl bg-cp-blau p-6 text-center text-white">
            <p className="text-sm font-semibold text-cp-tuerkis">Dein Start</p>
            <p className="mt-1 text-base font-bold">Das Neukunden-Special</p>
            <p className="mt-3 text-3xl font-extrabold">
              {NEUKUNDEN_ANGEBOT.sessions} Sessions für {NEUKUNDEN_ANGEBOT.preis} €
            </p>
            <p className="mt-2 text-xs text-white/70">{NEUKUNDEN_ANGEBOT.hinweis}</p>
            <p className="text-xs text-white/70">
              Frei aufteilbar auf alle Core-Anwendungen – etabliere deinen Rhythmus in den
              ersten {NEUKUNDEN_ANGEBOT.gueltigkeitWochen} Wochen.
            </p>
          </section>
        ) : m ? (
          <section className="rounded-xl bg-cp-blau p-5 text-white">
            <p className="text-center text-sm font-semibold text-white/80">
              Deine Mitgliedschaft – die wirtschaftlich sinnvollste Langfristlösung
            </p>
            <div className="mt-3 text-center">
              <span className="inline-block rounded-full bg-cp-tuerkis px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                Für dich empfohlen
              </span>
              <p className="mt-2 text-2xl font-extrabold">{m.name}</p>
              <p className="text-xs text-white/70">{m.inkludierteSessions}</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {m.laufzeiten.map((lz) => {
                const istBest = beste ? lz.monate === beste.monate : false;
                return (
                  <div
                    key={lz.monate}
                    className={`rounded-xl px-2 py-3 text-center ${
                      istBest ? 'bg-white/15 ring-1 ring-cp-tuerkis' : 'bg-white/5'
                    }`}
                  >
                    <p className="text-[10px] text-white/60">
                      {lz.monate} {lz.monate === 1 ? 'Monat' : 'Monate'}
                    </p>
                    <p className="mt-0.5 text-sm font-bold">{formatEuro(lz.monatsbeitrag)}</p>
                    <p className="text-[9px] text-white/50">/ Monat</p>
                    {istBest && (
                      <p className="mt-1 text-[9px] font-bold uppercase leading-tight text-cp-tuerkis">
                        Bestes Preis-Leistungs-Verhältnis
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {m.zusatzSession !== null && (
              <p className="mt-3 text-center text-xs text-white/60">
                Jede weitere Session: {formatEuro(m.zusatzSession)}
              </p>
            )}
            <p className="mt-1 text-center text-xs text-white/60">
              monatlich kündbar nach der gewählten Laufzeit
            </p>
          </section>
        ) : (
          <section className="rounded-xl bg-cp-blau p-5 text-center text-white">
            <p className="text-base font-bold">Deine Mitgliedschaft</p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              Als regelmäßiger Nutzer holst du mit einer Mitgliedschaft das Maximum aus deiner
              Routine – zu den besten Konditionen. Wir finden gemeinsam den passenden Tarif.
            </p>
          </section>
        )}

        {/* Preisvergleich */}
        {vergleich && (
          <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
              Was sich für dich rechnet
            </p>
            <div className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Einzeln gebucht ({vergleich.sessions} × {formatEuro(vergleich.einzelpreis)})
                </span>
                <span className="font-semibold text-gray-700">
                  {formatEuro(vergleich.einzelProMonat)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Mit {m?.name} ({vergleich.laufzeitMonate} Monate)
                </span>
                <span className="font-semibold text-gray-700">
                  {formatEuro(vergleich.mitgliedschaftProMonat)}
                </span>
              </div>
            </div>
            {vergleich.ersparnisProMonat > 0 && (
              <p className="mt-3 border-t border-emerald-200 pt-3 text-base font-bold text-emerald-700">
                Du sparst {formatEuro(vergleich.ersparnisProMonat)} pro Monat – rund{' '}
                {formatEuro(vergleich.ersparnisProJahr)} im Jahr.
              </p>
            )}
          </section>
        )}

        {/* Bodyforming-Upsell */}
        {upsellAnwendungen.length > 0 && (
          <section className="rounded-xl border border-dashed border-gray-300 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Zusatz-Fokus: Bodyforming &amp; Funktion
            </p>
            <div className="mt-3 space-y-3">
              {upsellAnwendungen.map((a) => {
                const anwendung = getAnwendung(a.slug);
                const research = RESEARCH[a.slug];
                return (
                  <div key={a.slug}>
                    <p className="text-sm font-semibold text-cp-blau">
                      {anwendung.emoji} {anwendung.name}
                    </p>
                    <p className="text-sm leading-relaxed text-gray-600">
                      {a.begruendung || research?.nutzen || anwendung.teaser}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Social Proof */}
        {zeigeSocialProof && (
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <p className="text-sm font-bold text-amber-900">
                {SOCIAL_PROOF.bewertung.toFixed(1).replace('.', ',')} / 5 bei{' '}
                {SOCIAL_PROOF.bewertungQuelle}
                {SOCIAL_PROOF.bewertungAnzahl > 0
                  ? ` (${SOCIAL_PROOF.bewertungAnzahl} Bewertungen)`
                  : ''}
              </p>
            </div>
            <p className="mt-1 text-xs text-amber-800">{SOCIAL_PROOF.mitgliederText}</p>
            <div className="mt-3 space-y-3">
              {SOCIAL_PROOF.testimonials.map((t, i) => (
                <div key={i} className="border-t border-amber-200 pt-3 first:border-0 first:pt-0">
                  <p className="text-sm italic leading-relaxed text-gray-700">„{t.text}"</p>
                  <p className="mt-1 text-xs font-semibold text-gray-500">
                    — {t.name}, {t.kontext}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Zusage-CTA */}
        <AngebotZusage
          token={token}
          typ={angebot.typ}
          bereitsZugesagt={angebot.zugesagtAm !== null}
          studioTelefon={STUDIO_TELEFON}
        />

        {/* Preisübersicht */}
        {Object.keys(angebot.preisSnapshot).length > 0 && (
          <details className="rounded-xl border border-gray-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-semibold text-cp-blau">
              Vollständige Preisübersicht
            </summary>
            <div className="mt-3 space-y-3">
              {Object.entries(angebot.preisSnapshot).map(([kat, preise]) => (
                <div key={kat}>
                  <p className="text-sm font-semibold text-cp-blau">
                    {KATEGORIE_LABEL[kat] ?? kat}
                  </p>
                  <p className="text-xs text-gray-500">
                    {preise.probe > 0 && `Probe: ${formatEuro(preise.probe)}`}
                    {preise.probe > 0 && preise.einzel > 0 && '  ·  '}
                    {preise.einzel > 0 && `Einzel: ${formatEuro(preise.einzel)}`}
                  </p>
                  {preise.karten
                    .filter((k) => k.preis > 0)
                    .map((k) => (
                      <p key={k.menge} className="text-xs text-gray-500">
                        {k.menge}er Karte: {formatEuro(k.preis)}
                      </p>
                    ))}
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Hinweise */}
        {angebot.zusatzhinweis && (
          <section className="rounded-xl bg-cp-creme/60 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-cp-braun">Hinweise</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700">{angebot.zusatzhinweis}</p>
          </section>
        )}

        {/* Footer */}
        <footer className="space-y-3 border-t border-gray-200 pt-4 text-center">
          <a
            href={`/p/${token}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-cp-tuerkis underline"
          >
            Angebot als PDF herunterladen
          </a>
          <p className="text-xs text-gray-400">Cryopoint Augsburg · Tel. {STUDIO_TELEFON}</p>
          <p className="text-[11px] leading-relaxed text-gray-400">
            Rechtlicher Hinweis: Unsere Anwendungen dienen der allgemeinen
            Gesundheitsförderung und Regeneration. Sie ersetzen keine ärztliche Behandlung
            oder Diagnose. Wir geben ausdrücklich keine Heilversprechen ab. Alle genannten
            Erfahrungen basieren auf Kundenberichten und der aktuellen Studienlage.
          </p>
        </footer>
      </div>
    </main>
  );
}
