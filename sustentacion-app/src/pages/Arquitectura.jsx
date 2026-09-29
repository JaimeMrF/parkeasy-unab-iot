import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition.jsx'
import Reveal from '../components/Reveal.jsx'
import NetworkDiagram from '../components/NetworkDiagram.jsx'
import MiniDashboard from '../components/MiniDashboard.jsx'

const icons = {
  device: (p) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 2.5V6M15 2.5V6M9 18V21.5M15 18V21.5M2.5 9H6M2.5 15H6M18 9H21.5M18 15H21.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  network: (p) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M4 8.5C8.5 4 15.5 4 20 8.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M7 12C9.8 9.2 14.2 9.2 17 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M10 15.4C11.4 14 12.6 14 14 15.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="19" r="1.6" fill="currentColor" />
    </svg>
  ),
  cloud: (p) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M7.5 18h9.2a3.8 3.8 0 0 0 .5-7.57A5.5 5.5 0 0 0 6.9 9.55 4.2 4.2 0 0 0 7.5 18Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  ),
  bolt: (p) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
}

const layers = [
  {
    num: '01', title: 'Dispositivo', color: '#0ea472', icon: 'device',
    items: ['Digital Twin nativo', 'Wokwi ESP32 ×2 (sensores distintos)', 'Python + azure-iot-device SDK', 'Python + paho-mqtt explícito', 'Puente HTTP/REST (Flask)', 'API pública (Open-Meteo)'],
    detail: 'Diez nodos lógicos, ninguno repite librería, protocolo o feed. Esto es lo que hace la flota heterogénea de verdad — no cinco simuladores clonados con distinto nombre.',
  },
  {
    num: '02', title: 'Red / Telecomunicaciones', color: '#0284c7', icon: 'network',
    items: ['Wi-Fi de campus', 'Wokwi-GUEST (ESP32 virtuales)', 'TLS 1.2 obligatorio · puerto 8883', 'MQTT sobre WebSockets · puerto 443'],
    detail: 'El puerto 443 existe como plan B real: si una red universitaria bloquea 8883, dev10 sigue conectando por el mismo puerto que usa HTTPS.',
  },
  {
    num: '03', title: 'Plataforma (Azure)', color: '#d97706', icon: 'cloud',
    items: ['Device Provisioning Service (DPS)', 'Azure IoT Central — ParkEasy UNAB', '6 Device Templates DTDL v2', 'IoT Hub subyacente'],
    detail: 'DPS resuelve el hub asignado a cada dispositivo con una clave derivada del enrollment de grupo — ningún dispositivo trae su connection string embebido de fábrica.',
  },
  {
    num: '04', title: 'Operación', color: '#9333ea', icon: 'bolt',
    items: ['Views por dispositivo', '3 Rules activas con alerta por correo', 'Dashboard Control Room', 'Explorador de datos (comparativa real)'],
    detail: 'La plataforma no solo grafica: decide. Las 3 Rules evalúan umbrales en tiempo real y disparan notificaciones sin intervención humana.',
  },
]

function hexToRgba(hex, a) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

function Chevron({ isOpen, color }) {
  return (
    <motion.svg
      viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0"
      animate={{ rotate: isOpen ? 180 : 0, color: isOpen ? color : 'var(--color-dim)' }}
      transition={{ duration: 0.3 }}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  )
}

function LayerCard({ l, isOpen, onToggle }) {
  const Icon = icons[l.icon]
  return (
    <div className="relative pl-[60px] md:pl-[72px]">
      {/* spine node — dark PCB-chip style, matches the diagram above */}
      <div className="absolute left-0 top-0 w-12 md:w-[60px] flex justify-center">
        <motion.div
          animate={{
            borderColor: isOpen ? l.color : '#2a2f3a',
            boxShadow: isOpen ? `0 0 0 4px ${hexToRgba(l.color, 0.12)}` : '0 0 0 0 rgba(0,0,0,0)',
          }}
          transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
          className="relative z-10 w-11 h-11 rounded-xl border-[1.5px] flex items-center justify-center"
          style={{ background: '#12141a' }}
        >
          <Icon className="w-[18px] h-[18px]" style={{ color: isOpen ? l.color : '#5b6472' }} />
        </motion.div>
      </div>

      <motion.div
        className="rounded-2xl border bg-white overflow-hidden mb-3 transition-colors"
        animate={{ borderColor: isOpen ? hexToRgba(l.color, 0.35) : 'var(--color-line)' }}
        transition={{ duration: 0.25 }}
        style={{ boxShadow: isOpen ? `0 16px 32px -24px ${hexToRgba(l.color, 0.3)}` : '0 1px 2px rgba(15,23,42,0.03)' }}
      >
        <button onClick={onToggle} className="w-full text-left px-5 md:px-6 py-4 flex items-center justify-between gap-6 group cursor-pointer">
          <div className="flex items-baseline gap-3 min-w-0">
            <span className="mono text-[10.5px] font-bold tracking-widest shrink-0" style={{ color: l.color }}>CAPA {l.num}</span>
            <span className="font-bold text-[15px] truncate">{l.title}</span>
          </div>
          <Chevron isOpen={isOpen} color={l.color} />
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <div className="px-5 md:px-6 pb-5">
                <div className="border-t border-[var(--color-line)] pt-4 mb-4">
                  <div className="grid sm:grid-cols-2 gap-x-6">
                    {l.items.map((it, idx) => (
                      <div
                        key={it}
                        className="flex items-center gap-2.5 py-2 text-[13px] text-[var(--color-ink)]/90"
                        style={{ borderTop: idx > 1 ? '1px solid var(--color-line)' : 'none' }}
                      >
                        <span className="w-1 h-1 rounded-full shrink-0" style={{ background: l.color }} />
                        <span className="mono text-[12.5px]">{it}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-[13px] text-[var(--color-dim)] leading-relaxed pl-3 border-l-2" style={{ borderColor: hexToRgba(l.color, 0.35) }}>
                  {l.detail}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default function Arquitectura() {
  const [open, setOpen] = useState(0)
  const [pulse, setPulse] = useState(null)

  return (
    <PageTransition>
      <section className="pt-32 pb-16 max-w-[1220px] mx-auto px-6">
        <Reveal>
          <div className="text-emerald-600 text-xs font-bold tracking-widest uppercase mb-3">Arquitectura de referencia</div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight max-w-2xl mb-4">Así viaja un paquete real, de punta a punta.</h1>
          <p className="text-[var(--color-dim)] max-w-xl mb-12">
            Haz clic en cualquier dispositivo del diagrama: verás el paquete viajar hasta Azure IoT Central y el Control Room reaccionar en vivo — la misma mecánica que corre en producción, simulada aquí de forma didáctica.
          </p>
        </Reveal>

        <Reveal delay={0.05} className="grid lg:grid-cols-[1.5fr_1fr] gap-6 items-start mb-16">
          <NetworkDiagram onDeliver={setPulse} />
          <MiniDashboard pulse={pulse} />
        </Reveal>

        <Reveal delay={0.05}>
          <div className="text-center mb-8">
            <div className="text-emerald-600 text-xs font-bold tracking-widest uppercase mb-2">Las cuatro capas</div>
            <h2 className="text-2xl font-extrabold tracking-tight">De lo físico a la decisión de negocio.</h2>
          </div>
        </Reveal>

        <div className="relative max-w-3xl mx-auto">
          {/* connecting spine */}
          <div className="absolute left-[22px] md:left-[28px] top-6 bottom-6 w-px bg-[var(--color-line)]" />
          <div className="space-y-3">
            {layers.map((l, i) => (
              <Reveal key={l.num} delay={i * 0.05}>
                <LayerCard l={l} isOpen={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
