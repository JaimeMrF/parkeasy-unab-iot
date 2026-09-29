import { useEffect, useRef } from 'react'
import { devices } from '../data/devices.js'

const LAYERS = [
  { label: 'Dispositivo', color: '#0ea472' },
  { label: 'Red / TLS', color: '#0284c7' },
  { label: 'Plataforma (Azure)', color: '#d97706' },
  { label: 'Operación', color: '#9333ea' },
]

export default function DataFlowSim({ height = 440 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let W, H, DPR, raf

    function resize() {
      DPR = Math.min(window.devicePixelRatio, 2)
      W = canvas.clientWidth
      H = canvas.clientHeight
      canvas.width = W * DPR
      canvas.height = H * DPR
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }
    window.addEventListener('resize', resize)
    resize()

    const cols = devices.length
    const particles = devices.map((d, i) => ({
      x: (i + 0.5) / cols,
      speed: 0.15 + Math.random() * 0.12,
      offset: Math.random(),
      color: d.color,
      wob: Math.random() * Math.PI * 2,
    }))

    function draw(t) {
      ctx.clearRect(0, 0, W, H)
      const bandH = H / 4
      LAYERS.forEach((l, i) => {
        const y0 = i * bandH
        ctx.fillStyle = i % 2 === 0 ? 'rgba(15,23,42,0.02)' : 'rgba(15,23,42,0.04)'
        ctx.fillRect(0, y0, W, bandH)
        ctx.fillStyle = '#616b7a'
        ctx.font = '600 12px Inter, sans-serif'
        ctx.fillText(l.label.toUpperCase(), 16, y0 + 20)
        ctx.strokeStyle = 'rgba(15,23,42,0.07)'
        ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0); ctx.stroke()
      })
      for (let i = 0; i < cols; i++) {
        const x = ((i + 0.5) / cols) * W
        ctx.strokeStyle = 'rgba(15,23,42,0.05)'
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      particles.forEach((p) => {
        const cycle = ((t * 0.001 * p.speed) + p.offset) % 1
        const y = cycle * H
        const wobble = Math.sin(t * 0.002 + p.wob) * 6
        const x = p.x * W + wobble
        const grad = ctx.createLinearGradient(x, y - 40, x, y)
        grad.addColorStop(0, 'rgba(0,0,0,0)')
        grad.addColorStop(1, p.color)
        ctx.strokeStyle = grad
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(x, Math.max(0, y - 40)); ctx.lineTo(x, y); ctx.stroke()
        ctx.beginPath(); ctx.fillStyle = p.color; ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.fillStyle = p.color + '33'; ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div className="card overflow-hidden">
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height }} />
      <div className="flex flex-wrap gap-4 px-6 py-4 border-t border-[var(--color-line)]">
        {LAYERS.map((l) => (
          <span key={l.label} className="flex items-center gap-2 text-xs text-[var(--color-dim)]">
            <i className="w-2 h-2 rounded-full inline-block" style={{ background: l.color }} /> {l.label}
          </span>
        ))}
      </div>
    </div>
  )
}
