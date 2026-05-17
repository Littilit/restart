// Vertrauensbelege für die Angebotsseite und das Angebots-PDF.
// Solange `platzhalter` true ist, wird die Social-Proof-Sektion dem Kunden
// NICHT angezeigt — echte Werte eintragen und `platzhalter` auf false setzen.

export interface Testimonial {
  text: string;
  name: string;
  kontext: string;
}

export interface SocialProof {
  platzhalter: boolean;
  bewertung: number;
  bewertungAnzahl: number;
  bewertungQuelle: string;
  mitgliederText: string;
  testimonials: Testimonial[];
}

export const SOCIAL_PROOF: SocialProof = {
  platzhalter: false,
  bewertung: 5.0,
  bewertungAnzahl: 44,
  bewertungQuelle: 'Google',
  mitgliederText: 'Hunderte Menschen trainieren bei uns ihre Regeneration',
  testimonials: [
    {
      text: '[]...] Ich habe mich anschließend super entspannt und richtig gut gefühlt. Besonders positiv war für mich, dass ein seit meiner Knie-OP bestehendes stechendes Gefühl nach der Anwendung deutlich nachgelassen hat. []...]',
      name: 'Dustin T.',
      kontext: 'Mitglied',
    },
    {
      text: 'Sehr gute und kompetente Begleitung durch das Team. Die Kombination Eisbox, Infrarotsauna und Redlight helfen mir meine Gesundheit zu stabilisieren. Absolute Empfehlung',
      name: 'Birgit R.',
      kontext: 'Mitglied',
    },
  ],
};
