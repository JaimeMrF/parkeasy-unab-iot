import PageTransition from '../components/PageTransition.jsx'
import Reveal from '../components/Reveal.jsx'
import GradientBackground from '../components/animate-ui/GradientBackground.jsx'
import { team } from '../data/devices.js'

export default function Equipo() {
  return (
    <PageTransition>
      <section className="pt-32 pb-24 max-w-[1220px] mx-auto px-6">
        <Reveal>
          <div className="text-emerald-600 text-xs font-bold tracking-widest uppercase mb-3">Equipo</div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight max-w-2xl mb-12">Quiénes construyeron ParkEasy UNAB.</h1>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
          {team.map((m, i) => (
            <Reveal key={m.code} delay={i * 0.08}>
              <div className="card p-7 flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0">
                  <GradientBackground colors={m.gradient} className="absolute inset-0" />
                  <span className="absolute inset-0 flex items-center justify-center font-extrabold text-white text-lg">
                    {m.initials}
                  </span>
                </div>
                <div>
                  <div className="font-bold">{m.name}</div>
                  <div className="text-sm text-[var(--color-dim)]">{m.code}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-14">
          <div className="card p-8 max-w-2xl">
            <h3 className="font-bold mb-2">Universidad Autónoma de Bucaramanga</h3>
            <p className="text-sm text-[var(--color-dim)]">IoT + Cloud + Sistemas Distribuidos · Parcial 1 · 2026-II</p>
          </div>
        </Reveal>
      </section>
    </PageTransition>
  )
}
