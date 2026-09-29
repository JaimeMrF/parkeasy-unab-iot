import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SlidingNumber from './animate-ui/SlidingNumber.jsx'

const TILES = [
  { key: 'cupos', label: 'Cupos libres', unit: '', init: 4 },
  { key: 'temp', label: 'Temp. conector', unit: '°C', init: 24.9 },
  { key: 'pm25', label: 'PM2.5', unit: 'µg/m³', init: 13.3 },
  { key: 'kwh', label: 'Energía tablero', unit: 'kWh', init: 11.2 },
]

export default function MiniDashboard({ pulse }) {
  const [values, setValues] = useState(() => Object.fromEntries(TILES.map((t) => [t.key, t.init])))
  const [flash, setFlash] = useState(null)
  const [feed, setFeed] = useState([])

  useEffect(() => {
    if (!pulse) return
    const { kpi, device, payload } = pulse
    if (kpi) {
      setValues((v) => {
        const cur = v[kpi]
        const delta = (Math.random() - 0.5) * (kpi === 'cupos' ? 2 : cur * 0.15)
        let next = cur + delta
        if (kpi === 'cupos') next = Math.max(0, Math.min(4, Math.round(next)))
        else next = Number(next.toFixed(1))
        return { ...v, [kpi]: next }
      })
      setFlash(kpi)
      setTimeout(() => setFlash(null), 900)
    }
    setFeed((f) => [{ id: pulse.id, device, payload }, ...f].slice(0, 5))
  }, [pulse])

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#f4f5f6] border-b border-[var(--color-line)]">
        <i className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <i className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <i className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs text-[var(--color-dim)] mono">ParkEasy UNAB — Control Room (simulación didáctica)</span>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {TILES.map((t) => (
            <motion.div
              key={t.key}
              animate={flash === t.key ? { scale: [1, 1.06, 1] } : {}}
              transition={{ duration: 0.5 }}
              className="rounded-xl border p-3.5 text-center relative overflow-hidden"
              style={{ borderColor: flash === t.key ? '#0ea472' : 'var(--color-line)', background: flash === t.key ? '#e6f7f0' : '#fff' }}
            >
              <div className="text-xl font-extrabold text-emerald-600 flex items-baseline justify-center">
                <SlidingNumber number={values[t.key]} decimalPlaces={t.key === 'cupos' ? 0 : 1} />
                <span>{t.unit}</span>
              </div>
              <div className="text-[10px] text-[var(--color-dim)] mt-0.5">{t.label}</div>
            </motion.div>
          ))}
        </div>
        <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-dim)] mb-2">Feed en vivo</div>
        <div className="space-y-1.5 min-h-[110px]">
          <AnimatePresence initial={false}>
            {feed.length === 0 && (
              <div className="text-xs text-[var(--color-dim)] italic py-4 text-center">Haz clic en un dispositivo del diagrama para simular el envío →</div>
            )}
            {feed.map((f) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="mono text-[10.5px] bg-[var(--color-bg)] border border-[var(--color-line)] rounded-lg px-2.5 py-1.5 leading-relaxed truncate"
              >
                <span className="font-bold text-emerald-600">{f.device}</span> → {JSON.stringify(f.payload)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
