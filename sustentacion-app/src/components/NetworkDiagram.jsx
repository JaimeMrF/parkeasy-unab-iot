import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { devices, samplePayload, KPI_MAP } from '../data/devices.js'

const W = 960
const H = 600
const HUB = { x: W / 2, y: H / 2 }

const left = devices.slice(0, 5)
const right = devices.slice(5, 10)
const ySpread = (n, i) => 60 + (i * (H - 120)) / (n - 1)

const positions = {}
left.forEach((d, i) => { positions[d.id] = { x: 130, y: ySpread(5, i), side: 'left' } })
right.forEach((d, i) => { positions[d.id] = { x: W - 130, y: ySpread(5, i), side: 'right' } })

// orthogonal "PCB trace" path: out from chip -> vertical run -> horizontal into hub
function pathFor(p) {
  const midX = p.side === 'left' ? (p.x + HUB.x) / 2 : (p.x + HUB.x) / 2
  const r = 14
  if (p.side === 'left') {
    return `M ${p.x + 26} ${p.y} L ${midX - r} ${p.y} Q ${midX} ${p.y} ${midX} ${p.y + (HUB.y > p.y ? r : -r)} L ${midX} ${HUB.y - (HUB.y > p.y ? r : -r)} Q ${midX} ${HUB.y} ${midX + r} ${HUB.y} L ${HUB.x - 70} ${HUB.y}`
  }
  return `M ${p.x - 26} ${p.y} L ${midX + r} ${p.y} Q ${midX} ${p.y} ${midX} ${p.y + (HUB.y > p.y ? r : -r)} L ${midX} ${HUB.y - (HUB.y > p.y ? r : -r)} Q ${midX} ${HUB.y} ${midX - r} ${HUB.y} L ${HUB.x + 70} ${HUB.y}`
}

function Chip({ p, device, active, onClick }) {
  const w = 52, h = 34
  const pins = 4
  return (
    <g
      transform={`translate(${p.x - w / 2}, ${p.y - h / 2})`}
      className="cursor-pointer"
      onClick={onClick}
    >
      {/* pins */}
      {Array.from({ length: pins }).map((_, i) => {
        const py = 5 + (i * (h - 10)) / (pins - 1)
        return (
          <g key={i}>
            <rect x={p.side === 'left' ? -8 : w} y={py - 1.5} width="8" height="3" fill="#9aa4b2" />
            <rect x={p.side === 'left' ? w : -8} y={py - 1.5} width="8" height="3" fill="#9aa4b2" />
          </g>
        )
      })}
      <rect
        width={w} height={h} rx="5"
        fill={active ? device.color : '#12141a'}
        stroke={active ? device.color : '#2a2f3a'}
        strokeWidth="1.5"
      />
      <text x={w / 2} y={h / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="'SF Mono','Courier New',monospace" fill={active ? '#0b1220' : '#e8eef7'}>
        {device.id.slice(3)}
      </text>
      {/* status LED */}
      <circle cx={w - 7} cy={7} r="2.6" fill={device.color}>
        <animate attributeName="opacity" values="1;0.25;1" dur="1.6s" repeatCount="indefinite" begin={`${Math.random()}s`} />
      </circle>
    </g>
  )
}

export default function NetworkDiagram({ onDeliver }) {
  const [activeId, setActiveId] = useState(null)
  const [particlePos, setParticlePos] = useState(null)
  const [tooltip, setTooltip] = useState(null)
  const [log, setLog] = useState([])
  const pathRefs = useRef({})
  const rafRef = useRef(null)

  function fire(device) {
    setActiveId(device.id)
    setTooltip(null)
    const path = pathRefs.current[device.id]
    if (!path) return
    const len = path.getTotalLength()
    const duration = 950
    const start = performance.now()

    setLog((l) => [{ id: Date.now(), text: `CONNECT  ${device.id} → mqtts://iotc-hub:8883  [TLS OK]`, kind: 'info' }, ...l].slice(0, 6))

    cancelAnimationFrame(rafRef.current)
    function tick(now) {
      const t = Math.min(1, (now - start) / duration)
      const pt = path.getPointAtLength(t * len)
      setParticlePos({ x: pt.x, y: pt.y })
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        const payload = samplePayload(device.id)
        setTooltip({ device: device.id, payload, color: device.color })
        onDeliver && onDeliver({ id: Date.now(), device: device.id, payload, kpi: KPI_MAP[device.id] })
        setLog((l) => [{ id: Date.now() + 1, text: `PUBLISH  devices/${device.id}/messages/events/  ${JSON.stringify(payload)}`, kind: 'ok', color: device.color }, ...l].slice(0, 6))
        setTimeout(() => setParticlePos(null), 200)
        setTimeout(() => setTooltip(null), 2600)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="text-sm font-semibold text-[var(--color-dim)]">Haz clic en un chip para simular su envío hasta IoT Central</div>
        {activeId && <div className="text-xs mono text-emerald-600 font-bold">TX ← {activeId}</div>}
      </div>

      <div className="relative" style={{ background: '#0b0f16' }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none block">
          <defs>
            <pattern id="pcb-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1a2030" strokeWidth="1" />
            </pattern>
            <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0ea472" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0ea472" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width={W} height={H} fill="url(#pcb-grid)" />

          {/* traces */}
          {devices.map((d) => (
            <path
              key={d.id}
              ref={(el) => { if (el) pathRefs.current[d.id] = el }}
              d={pathFor(positions[d.id])}
              fill="none"
              stroke={activeId === d.id ? d.color : '#232838'}
              strokeWidth={activeId === d.id ? 2.4 : 1.4}
              style={{ transition: 'stroke 0.25s' }}
            />
          ))}
          {/* trace joints (solder dots) */}
          {devices.map((d) => {
            const p = positions[d.id]
            return <circle key={d.id + 'dot'} cx={p.side === 'left' ? p.x + 26 : p.x - 26} cy={p.y} r="2" fill="#3a4150" />
          })}

          {/* hub */}
          <circle cx={HUB.x} cy={HUB.y} r="110" fill="url(#hubGlow)" />
          <g>
            <rect x={HUB.x - 72} y={HUB.y - 44} width="144" height="88" rx="10" fill="#12161f" stroke="#0ea472" strokeWidth="1.6" />
            <text x={HUB.x} y={HUB.y - 10} textAnchor="middle" fontSize="12.5" fontWeight="800" fontFamily="'SF Mono',monospace" fill="#e8eef7">AZURE IOT</text>
            <text x={HUB.x} y={HUB.y + 8} textAnchor="middle" fontSize="12.5" fontWeight="800" fontFamily="'SF Mono',monospace" fill="#0ea472">CENTRAL</text>
            <text x={HUB.x} y={HUB.y + 27} textAnchor="middle" fontSize="9" fontFamily="'SF Mono',monospace" fill="#5b6472">hub · dps · 8883/443</text>
            {[-52, -32, -12].map((dx, i) => (
              <circle key={i} cx={HUB.x + dx + 60} cy={HUB.y - 34} r="2" fill={i === 0 ? '#0ea472' : '#2a2f3a'}>
                {i === 0 && <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />}
              </circle>
            ))}
          </g>

          {/* device chips */}
          {devices.map((d) => (
            <Chip key={d.id} p={positions[d.id]} device={d} active={activeId === d.id} onClick={() => fire(d)} />
          ))}

          {/* labels outside chips */}
          {devices.map((d) => {
            const p = positions[d.id]
            const isLeft = p.side === 'left'
            return (
              <text
                key={d.id + 'lbl'}
                x={isLeft ? p.x - 40 : p.x + 40}
                y={p.y + 4}
                textAnchor={isLeft ? 'end' : 'start'}
                fontSize="10.5"
                fontFamily="'SF Mono',monospace"
                fill="#7d8899"
              >
                {d.origin.split(' ')[0].replace(/[()]/g, '')}
              </text>
            )
          })}

          {particlePos && (
            <g>
              <circle cx={particlePos.x} cy={particlePos.y} r="10" fill={devices.find((d) => d.id === activeId)?.color} opacity="0.25" />
              <circle cx={particlePos.x} cy={particlePos.y} r="4" fill="#fff" />
            </g>
          )}
        </svg>

        <AnimatePresence>
          {tooltip && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="absolute left-1/2 -translate-x-1/2 bottom-4 max-w-md rounded-xl px-4 py-3 border"
              style={{ background: '#12161f', borderColor: tooltip.color }}
            >
              <div className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: tooltip.color }}>
                ✓ 200 OK · recibido en IoT Central
              </div>
              <div className="mono text-xs text-[#9aa4b2] break-all">{JSON.stringify(tooltip.payload)}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* terminal log */}
      <div className="bg-[#0b0f16] border-t border-[#1a2030] px-5 py-3 font-mono text-[11px] leading-6 max-h-[132px] overflow-hidden">
        <AnimatePresence initial={false}>
          {log.length === 0 && <div className="text-[#4b5566]">$ esperando eventos MQTT…</div>}
          {log.map((l) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="whitespace-nowrap overflow-hidden text-ellipsis"
            >
              <span className="text-[#4b5566]">$ </span>
              <span style={{ color: l.kind === 'ok' ? (l.color || '#0ea472') : '#38bdf8' }}>{l.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
