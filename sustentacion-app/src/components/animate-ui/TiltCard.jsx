// Pointer-tracked 3D tilt + spotlight border, in the spirit of animate-ui's
// interactive card patterns. Self-built (not a direct port) since the site
// doesn't have a single "tilt card" primitive, but it follows the same
// approach: framer-motion springs driven by raw pointer position, no re-render
// per frame.
import { useRef } from 'react'
import { motion, useMotionTemplate, useSpring } from 'framer-motion'

export default function TiltCard({ children, className = '', style = {}, glowColor = '14,164,114', ...props }) {
  const ref = useRef(null)
  const rotateX = useSpring(0, { stiffness: 220, damping: 20, mass: 0.4 })
  const rotateY = useSpring(0, { stiffness: 220, damping: 20, mass: 0.4 })
  const mx = useSpring(50, { stiffness: 220, damping: 26 })
  const my = useSpring(50, { stiffness: 220, damping: 26 })

  const handleMove = (e) => {
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    rotateY.set((px - 0.5) * 10)
    rotateX.set((0.5 - py) * 10)
    mx.set(px * 100)
    my.set(py * 100)
  }

  const handleLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  const background = useMotionTemplate`radial-gradient(320px circle at ${mx}% ${my}%, rgba(${glowColor},0.14), transparent 70%)`

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 900, ...style }}
      className={className}
      {...props}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-[inherit] pointer-events-none"
        style={{ background }}
      />
      <div style={{ position: 'relative' }}>{children}</div>
    </motion.div>
  )
}
