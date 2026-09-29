import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition.jsx'
import Reveal from '../components/Reveal.jsx'
import GmailNotification from '../components/GmailNotification.jsx'
import { rules as ruleDefs } from '../data/devices.js'

function evaluate(operator, value, threshold) {
  return operator === '<' ? value < threshold : value > threshold
}

export default function Reglas() {
  const [values, setValues] = useState(() =>
    Object.fromEntries(ruleDefs.map((r) => [r.id, Math.round((r.min + r.max) / 2)]))
  )
  const [notifs, setNotifs] = useState([])
  const [prevFired, setPrevFired] = useState({})
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    ruleDefs.forEach((r) => {
      const fired = evaluate(r.operator, values[r.id], r.threshold)
      if (fired && !prevFired[r.id]) {
        const id = Date.now() + r.id
        setNotifs((n) => [...n, { id, title: r.title, color: r.color, condition: `${r.variable} ${r.operator} ${r.threshold} → actual ${values[r.id]} ${r.unit}` }])
        setUnread((u) => u + 1)
      }
    })
    setPrevFired(Object.fromEntries(ruleDefs.map((r) => [r.id, evaluate(r.operator, values[r.id], r.threshold)])))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values])

  return (
    <PageTransition>
      <section className="pt-32 pb-24 max-w-[1220px] mx-auto px-6">
        <Reveal>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-emerald-600 text-xs font-bold tracking-widest uppercase">Simulador interactivo</span>
            {unread > 0 && (
              <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">{unread} alertas enviadas</span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight max-w-2xl mb-4">Mueve el slider. Mira la Rule dispararse en vivo.</h1>
          <p className="text-[var(--color-dim)] max-w-xl mb-12">
            Esto no es una captura: es la misma lógica de las 3 Rules activas en IoT Central, re-implementada aquí para defender los umbrales frente al jurado. Cuando una regla se dispara, llega la notificación real de correo.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {ruleDefs.map((r, i) => {
            const value = values[r.id]
            const fired = evaluate(r.operator, value, r.threshold)
            return (
              <Reveal key={r.id} delay={i * 0.08}>
                <div className="card p-6 transition-all duration-300" style={fired ? { boxShadow: `0 0 0 3px ${r.color}33`, borderColor: r.color } : {}}>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: r.color + '1a' }}>{r.icon}</div>
                    <AnimatePresence>
                      {fired && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                          style={{ background: r.color + '1a', color: r.color }}
                        >
                          🔔 Disparada
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <h3 className="font-bold text-base mb-1">{r.title}</h3>
                  <p className="text-xs text-[var(--color-dim)] mb-5 leading-relaxed">{r.desc}</p>

                  <div className="mono text-xs bg-[var(--color-bg)] border border-[var(--color-line)] rounded-lg px-3 py-2 mb-4">
                    {r.variable} {r.operator} {r.threshold}
                    <span className="text-[var(--color-dim)]"> → actual: </span>
                    <b style={{ color: fired ? r.color : 'inherit' }}>{value} {r.unit}</b>
                  </div>

                  <input
                    type="range"
                    min={r.min}
                    max={r.max}
                    value={value}
                    onChange={(e) => setValues((v) => ({ ...v, [r.id]: Number(e.target.value) }))}
                    className="w-full"
                    style={{ accentColor: r.color }}
                  />
                  <div className="flex justify-between text-[10px] text-[var(--color-dim)] mt-1">
                    <span>{r.min} {r.unit}</span>
                    <span>{r.max} {r.unit}</span>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      <GmailNotification items={notifs} onDismiss={(id) => setNotifs((n) => n.filter((x) => x.id !== id))} />
    </PageTransition>
  )
}
