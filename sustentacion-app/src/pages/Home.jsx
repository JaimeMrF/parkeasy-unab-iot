import { Link, useNavigate } from 'react-router-dom'
import { Suspense, useState } from 'react'
import { motion } from 'framer-motion'
import ParkingScene from '../components/ParkingScene.jsx'
import PageTransition from '../components/PageTransition.jsx'
import Reveal from '../components/Reveal.jsx'
import RippleButton from '../components/animate-ui/RippleButton.jsx'
import SlidingNumber from '../components/animate-ui/SlidingNumber.jsx'
import TiltCard from '../components/animate-ui/TiltCard.jsx'
import { devices } from '../data/devices.js'

const hubs = [
  { to: '/arquitectura', title: 'Arquitectura', desc: 'Las 4 capas — dispositivo, red, plataforma y operación — con una simulación de flujo de datos en vivo.', icon: '🧭', color: '#0284c7' },
  { to: '/parqueadero', title: 'Parqueadero 3D', desc: 'Explora la estación completa en 3D. Haz clic en cada bicicleta, tótem o sensor para inspeccionarlo.', icon: '🚲', color: '#0ea472' },
  { to: '/control-room', title: 'Control Room', desc: 'El dashboard real de IoT Central: KPIs, gráficos y capturas de la aplicación en producción.', icon: '📊', color: '#d97706' },
  { to: '/reglas', title: 'Simulador de Reglas', desc: 'Mueve los sliders y observa en tiempo real cuándo se dispara cada Rule de IoT Central.', icon: '🎛️', color: '#e11d48' },
  { to: '/evidencia', title: 'Evidencia real', desc: 'La línea de tiempo exacta de una desconexión y reconexión capturada en producción.', icon: '📡', color: '#9333ea' },
  { to: '/equipo', title: 'Equipo', desc: 'Quiénes construyeron ParkEasy UNAB.', icon: '👥', color: '#0891b2' },
]

const heroStats = [
  { value: 10, suffix: '', label: 'Dispositivos' },
  { value: 9, suffix: '', label: 'Orígenes de envío' },
  { value: 6, suffix: '', label: 'Intervalos distintos' },
  { value: 3, suffix: '', label: 'Rules activas' },
]

const hexToRgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16)
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
}

export default function Home() {
  const [selectedId, setSelectedId] = useState(null)
  const navigate = useNavigate()

  return (
    <PageTransition>
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <ParkingScene devices={devices} onSelect={setSelectedId} selectedId={selectedId} interactive autoRotate cameraPos={[13, 9, 15]} />
          </Suspense>
        </div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 65% 45% at 50% 26%, #fbfbfa 0%, rgba(251,251,250,0.92) 42%, rgba(251,251,250,0) 72%)' }}
        />
        <div className="relative z-10 h-full flex flex-col items-center justify-start pt-32 text-center px-6 pointer-events-none">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Azure IoT Central · Parcial 1 · 2026-II
          </div>
          <h1 className="font-extrabold tracking-tight leading-[1.02] text-[clamp(2.2rem,6vw,4.6rem)] max-w-4xl">
            El parqueadero inteligente<br />de <span className="text-emerald-600">10 orígenes de datos</span><br />en un solo catálogo.
          </h1>
          <p className="max-w-xl mt-6 text-[var(--color-dim)] text-lg">
            Arrastra la estación 3D. Cada objeto es un dispositivo real de la flota ParkEasy UNAB enviando telemetría en este momento.
          </p>
          <div className="flex gap-3 mt-9 pointer-events-auto">
            <RippleButton
              onClick={() => navigate('/parqueadero')}
              rippleColor="rgba(255,255,255,0.5)"
              className="px-7 py-3.5 rounded-2xl font-semibold bg-[var(--color-ink)] text-white shadow-lg hover:-translate-y-0.5 transition"
            >
              Explorar en 3D →
            </RippleButton>
            <RippleButton
              onClick={() => navigate('/arquitectura')}
              rippleColor="rgba(11,18,32,0.15)"
              className="px-7 py-3.5 rounded-2xl font-semibold border border-[var(--color-line)] bg-white/80 hover:-translate-y-0.5 transition"
            >
              Ver arquitectura
            </RippleButton>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-12 pointer-events-auto">
            {heroStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.08 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 border border-[var(--color-line)] backdrop-blur-sm shadow-sm"
              >
                <span className="text-lg font-extrabold text-emerald-600 flex items-baseline">
                  <SlidingNumber number={s.value} countUp />
                  <span>{s.suffix}</span>
                </span>
                <span className="text-xs text-[var(--color-dim)] font-medium">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1220px] mx-auto px-6 py-24">
        <Reveal>
          <div className="text-center mb-14">
            <div className="text-emerald-600 text-xs font-bold tracking-widest uppercase mb-3">Explora la sustentación</div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Seis rutas, un solo sistema en producción.</h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {hubs.map((h, i) => (
            <Reveal key={h.to} delay={i * 0.06}>
              <TiltCard glowColor={hexToRgb(h.color)} className="rounded-[20px] h-full" style={{ transformStyle: 'preserve-3d' }}>
                <Link to={h.to} className="card p-7 block h-full hover:shadow-xl transition group">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5" style={{ background: h.color + '1a' }}>
                    {h.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{h.title}</h3>
                  <p className="text-sm text-[var(--color-dim)] leading-relaxed">{h.desc}</p>
                  <div className="mt-4 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: h.color }}>
                    Ver más <span>→</span>
                  </div>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>
    </PageTransition>
  )
}
