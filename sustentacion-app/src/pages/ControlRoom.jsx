import { useState } from 'react'
import PageTransition from '../components/PageTransition.jsx'
import Reveal from '../components/Reveal.jsx'
import SlidingNumber from '../components/animate-ui/SlidingNumber.jsx'

const shots = [
  { id: 'top', label: 'Vista superior', img: '/assets/dashboard_control_room.jpg' },
  { id: 'bottom', label: 'Gráficos en vivo', img: '/assets/dashboard_control_room_2.jpg' },
]

const kpis = [
  { value: 4, decimals: 0, suffix: '', l: 'Cupos libres (en vivo)' },
  { value: 13.3, decimals: 1, suffix: '', l: 'PM2.5 µg/m³ (Open-Meteo real)' },
  { value: 24.9, decimals: 1, suffix: '°C', l: 'Temp. máx. conector' },
  { value: 8, decimals: 0, suffix: '/10', l: 'Dispositivos conectados ahora' },
]

export default function ControlRoom() {
  const [tab, setTab] = useState('top')
  const active = shots.find((s) => s.id === tab)

  return (
    <PageTransition>
      <section className="pt-32 pb-24 max-w-[1220px] mx-auto px-6">
        <Reveal>
          <div className="text-emerald-600 text-xs font-bold tracking-widest uppercase mb-3">Control Room</div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight max-w-2xl mb-4">Un dashboard que un operador sin código puede leer.</h1>
          <p className="text-[var(--color-dim)] max-w-xl mb-10">Logo, mapa de zonas, KPIs en vivo y cuatro gráficos con datos reales — capturados directamente de la aplicación en producción, sin retoque.</p>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="flex gap-2 mb-5">
            {shots.map((s) => (
              <button
                key={s.id}
                onClick={() => setTab(s.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${tab === s.id ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]' : 'bg-white border-[var(--color-line)]'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="rounded-2xl overflow-hidden border border-[var(--color-line)] shadow-xl bg-white">
            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#f4f5f6] border-b border-[var(--color-line)]">
              <i className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <i className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <i className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-3 text-xs text-[var(--color-dim)] mono">claseclima2026.azureiotcentral.com/dashboards</span>
            </div>
            <img src={active.img} alt={active.label} className="w-full block" />
          </div>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          {kpis.map((k, i) => (
            <Reveal key={k.l} delay={i * 0.05}>
              <div className="card p-5 text-center">
                <div className="text-2xl font-extrabold text-emerald-600 flex items-baseline justify-center">
                  <SlidingNumber number={k.value} decimalPlaces={k.decimals} countUp />
                  <span>{k.suffix}</span>
                </div>
                <div className="text-xs text-[var(--color-dim)] mt-1">{k.l}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </PageTransition>
  )
}
