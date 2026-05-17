import { NEUKUNDEN_ANGEBOT } from '@/data/preise';
import {
  berechnePreisvergleich,
  getMitgliedschaft,
  formatEuro,
} from './mitgliedschaft-logik';

interface Props {
  typ: 'neukunde' | 'folge';
  kundenVorname: string;
  fokusLabel?: string | null;
  mitgliedschaftId?: string | null;
  sessionsProMonat?: number | null;
  gueltigBis?: Date | string | null;
}

function Block({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-cp-tuerkis">{titel}</p>
      <div className="mt-1 text-sm leading-relaxed text-gray-700">{children}</div>
    </div>
  );
}

export function Verkaufsleitfaden({
  typ,
  kundenVorname,
  fokusLabel,
  mitgliedschaftId,
  sessionsProMonat,
  gueltigBis,
}: Props) {
  const m = getMitgliedschaft(mitgliedschaftId);
  const spm = sessionsProMonat ?? 0;
  const vergleich = typ === 'folge' && m && spm > 0 ? berechnePreisvergleich(spm, m) : null;
  const gueltigText = gueltigBis
    ? new Date(gueltigBis).toLocaleDateString('de-DE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      })
    : null;

  const fokus = fokusLabel ? fokusLabel.toLowerCase() : 'deine Ziele';

  return (
    <details className="rounded-lg border border-cp-tuerkis/30 bg-cp-tuerkis/5 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-cp-blau">
        Verkaufsleitfaden – so übergibst du das Angebot
      </summary>
      <div className="mt-4 space-y-4">
        <Block titel="Gesprächseinstieg">
          „{kundenVorname}, ich hab mir das nochmal in Ruhe angeschaut. Du hast ja gesagt, dass dir{' '}
          {fokus} wichtig ist – genau darauf ist diese Empfehlung zugeschnitten. Lass uns kurz
          durchgehen, was für dich am meisten Sinn ergibt."
        </Block>

        <Block titel="Kernargument">
          {typ === 'folge' && vergleich && vergleich.ersparnisProMonat > 0 ? (
            <>
              Dein Plan heißt rund <strong>{spm} Sessions/Monat</strong>.
              Einzeln wären das <strong>{formatEuro(vergleich.einzelProMonat)}/Monat</strong> –
              mit dem {m?.name} nur <strong>{formatEuro(vergleich.mitgliedschaftProMonat)}/Monat</strong>.
              Der Kunde gibt also nicht mehr aus, sondern <strong>{formatEuro(vergleich.ersparnisProMonat)}
              {' '}weniger</strong> – und hat seinen kompletten Plan abgedeckt.
            </>
          ) : typ === 'folge' && m ? (
            <>Der {m.name} deckt das empfohlene Protokoll zum besten Konditionspreis ab –
              regelmäßig genutzt immer günstiger als jede Einzelbuchung.</>
          ) : (
            <>{NEUKUNDEN_ANGEBOT.sessions} Sessions für nur {NEUKUNDEN_ANGEBOT.preis} € – ein
              risikoarmer Einstieg, damit {kundenVorname} in den ersten{' '}
              {NEUKUNDEN_ANGEBOT.gueltigkeitWochen} Wochen den eigenen Rhythmus findet und die
              Wirkung selbst spürt.</>
          )}
        </Block>

        <Block titel="Abschlussfrage (direkt stellen)">
          {typ === 'folge' && m
            ? `„Sollen wir dich gleich für den ${m.name} eintragen?"`
            : `„Sollen wir dir das Neukunden-Special direkt mitgeben, damit du diese Woche starten kannst?"`}
        </Block>

        <Block titel="Wenn Einwände kommen">
          <ul className="space-y-2">
            <li>
              <strong>„Zu teuer."</strong>{' '}
              {vergleich && vergleich.ersparnisProMonat > 0
                ? `„Verständlich – schau es dir gerechnet an: einzeln ${formatEuro(vergleich.einzelProMonat)}, mit Mitgliedschaft ${formatEuro(vergleich.mitgliedschaftProMonat)}. Du sparst, du zahlst nicht drauf."`
                : '„Rechne es auf die einzelne Session runter – in der Mitgliedschaft bist du pro Anwendung immer günstiger als bei jeder Einzelbuchung."'}
            </li>
            <li>
              <strong>„Ich muss noch überlegen."</strong>{' '}
              {gueltigText
                ? `„Klar. Damit du nichts verpasst: Das Angebot gilt bis ${gueltigText}. Die Empfehlung ist exakt auf deine Anamnese berechnet – länger warten heißt nur, länger aufs Ergebnis warten."`
                : '„Klar. Die Empfehlung ist exakt auf deine Anamnese berechnet – länger warten heißt nur, länger aufs Ergebnis warten. Womit genau bist du noch unsicher?"'}
            </li>
            <li>
              <strong>„Keine Zeit."</strong>{' '}
              „Genau dafür ist das Protokoll gemacht – eine Session dauert nur wenige Minuten.
              Das bekommst du auch in einer vollen Woche unter. Lieber kurz und regelmäßig als gar nicht."
            </li>
          </ul>
        </Block>

        <Block titel="Beim WhatsApp-Versand">
          Schreib in die Nachricht dazu: <strong>„Antworte mir einfach mit JA, wenn du dabei
          bist – den Rest machen wir vor Ort."</strong> So bekommst du auch ohne Klick auf der
          Seite ein klares Signal.
        </Block>
      </div>
    </details>
  );
}
