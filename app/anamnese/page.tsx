import Link from 'next/link';

export default function AnamnesePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-cp-beige/50 bg-white/80 backdrop-blur-sm">
        <div className="container-cp py-4">
          <p className="text-xs font-bold tracking-widest text-cp-tuerkis uppercase">CRYOPOINT</p>
          <p className="text-[10px] text-cp-braun tracking-[0.2em] uppercase">LONGEVITY SPA · AUGSBURG</p>
        </div>
      </header>

      <main className="flex-1 container-cp py-12 flex flex-col items-center justify-center text-center gap-8">
        <div className="space-y-4">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-cp-tuerkis/10 mx-auto">
            <span className="text-4xl">📋</span>
          </div>
          <h1 className="text-3xl font-bold text-cp-blau">Dein digitaler Anamnesebogen</h1>
          <p className="text-cp-braun max-w-md mx-auto leading-relaxed">
            In ca. 3–4 Minuten erstellst du deinen personalisierten Anwendungsplan für das Cryopoint Longevity Spa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg text-left">
          {[
            { icon: '🎯', text: '6 Schritte, kein Papierkram' },
            { icon: '🔬', text: 'Wissenschaftlich fundiert' },
            { icon: '🔒', text: 'DSGVO-konform gespeichert' },
          ].map((item) => (
            <div key={item.text} className="rounded-xl border border-cp-beige/60 bg-white p-4 flex gap-2 items-start">
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm text-cp-blau font-medium">{item.text}</span>
            </div>
          ))}
        </div>

        <Link
          href="/anamnese/start"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-cp-blau text-white font-semibold h-14 px-8 text-lg shadow-soft hover:bg-cp-schwarzblau transition-colors"
        >
          Jetzt starten →
        </Link>

        <p className="text-xs text-cp-braun/60">
          Deine Angaben werden sicher auf Servern in Deutschland gespeichert.
        </p>
      </main>
    </div>
  );
}
