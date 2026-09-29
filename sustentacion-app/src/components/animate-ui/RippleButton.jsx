// Ported from animate-ui.com (Buttons / Ripple Button), simplified into a
// single self-contained component (no Radix Slot / cva variant system) so it
// drops straight into this project's Tailwind classes.
// https://animate-ui.com/docs/components/buttons/ripple
import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../../lib/cn'

export default function RippleButton({
  children,
  className = '',
  rippleColor = 'rgba(255,255,255,0.55)',
  hoverScale = 1.03,
  tapScale = 0.97,
  onClick,
  ...props
}) {
  const [ripples, setRipples] = useState([])
  const btnRef = useRef(null)

  const handleClick = useCallback(
    (event) => {
      const button = btnRef.current
      if (button) {
        const rect = button.getBoundingClientRect()
        const id = Date.now()
        setRipples((prev) => [...prev, { id, x: event.clientX - rect.left, y: event.clientY - rect.top }])
        setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 650)
      }
      onClick?.(event)
    },
    [onClick],
  )

  return (
    <motion.button
      ref={btnRef}
      type="button"
      data-slot="ripple-button"
      onClick={handleClick}
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
      className={cn('relative isolate overflow-hidden', className)}
      {...props}
    >
      {children}
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            initial={{ scale: 0, opacity: 0.55 }}
            animate={{ scale: 9, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: r.y - 10,
              left: r.x - 10,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: rippleColor,
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  )
}
