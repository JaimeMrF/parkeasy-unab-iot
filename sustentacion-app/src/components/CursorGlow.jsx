// Ambient spotlight that trails the cursor across the whole app — inspired by
// animate-ui's Cursor component category, but implemented as a lightweight
// fixed-position glow (direct DOM writes, no re-renders) so it stays smooth
// even while heavy pages (the 3D scene) are mounted.
import { useEffect, useRef } from 'react'

export default function CursorGlow() {
  const dotRef = useRef(null)
  const pos = useRef({ x: -200, y: -200 })
  const target = useRef({ x: -200, y: -200 })

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return undefined

    const handleMove = (e) => {
      target.current.x = e.clientX
      target.current.y = e.clientY
    }
    window.addEventListener('pointermove', handleMove, { passive: true })

    let raf
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.14
      pos.current.y += (target.current.y - pos.current.y) * 0.14
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="fixed top-0 left-0 z-[1] pointer-events-none hidden md:block"
      style={{
        width: 520,
        height: 520,
        marginLeft: -260,
        marginTop: -260,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14,164,114,0.12) 0%, rgba(14,164,114,0.05) 35%, rgba(14,164,114,0) 70%)',
        willChange: 'transform',
      }}
    />
  )
}
