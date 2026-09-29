// Ported from animate-ui.com (Primitives / Texts / Sliding Number), trimmed
// down (no TS, no thousand-separator/padStart/in-view options — this app
// always renders the tiles already in view) and re-implemented the measuring
// hook with a plain ResizeObserver instead of pulling in react-use-measure.
// https://animate-ui.com/docs/primitives/texts/sliding-number
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

function useElementHeight() {
  const ref = useRef(null)
  const [height, setHeight] = useState(0)

  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const ro = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height))
    ro.observe(node)
    return () => ro.disconnect()
  }, [])

  return [ref, height]
}

function DigitFace({ motionValue, digit, height }) {
  const y = useTransform(motionValue, (latest) => {
    if (!height) return 0
    const current = latest % 10
    const offset = (10 + digit - current) % 10
    let translateY = offset * height
    if (offset > 5) translateY -= 10 * height
    return translateY
  })

  if (!height) {
    return (
      <span style={{ visibility: 'hidden', position: 'absolute' }}>{digit}</span>
    )
  }

  return (
    <motion.span
      style={{ y, position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {digit}
    </motion.span>
  )
}

function DigitColumn({ value, place, transition, countUp }) {
  const target = Math.floor(value / place) % 10
  const animated = useSpring(countUp ? 0 : target, transition)
  const [measureRef, height] = useElementHeight()

  useEffect(() => {
    animated.set(target)
  }, [target, animated])

  return (
    <span
      ref={measureRef}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: '1ch',
        overflowX: 'visible',
        overflowY: 'clip',
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <span style={{ visibility: 'hidden' }}>0</span>
      {Array.from({ length: 10 }, (_, i) => (
        <DigitFace key={i} motionValue={animated} digit={i} height={height} />
      ))}
    </span>
  )
}

export default function SlidingNumber({
  number,
  decimalPlaces = 0,
  transition = { stiffness: 200, damping: 22, mass: 0.4 },
  className = '',
  countUp = false,
  ...props
}) {
  const value = Number.isFinite(number) ? number : 0
  const abs = Math.abs(value)
  const numberStr = abs.toFixed(decimalPlaces)
  const [intStrRaw, decStr = ''] = numberStr.split('.')
  const intStr = intStrRaw || '0'

  const intPlaces = Array.from({ length: intStr.length }, (_, i) => Math.pow(10, intStr.length - i - 1))
  const decPlaces = decStr ? Array.from({ length: decStr.length }, (_, i) => Math.pow(10, decStr.length - i - 1)) : []
  const intValue = parseInt(intStr, 10)
  const decValue = decStr ? parseInt(decStr, 10) : 0

  return (
    <span
      data-slot="sliding-number"
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center' }}
      {...props}
    >
      {value < 0 && <span style={{ marginRight: 2 }}>-</span>}
      {intPlaces.map((place) => (
        <DigitColumn key={`i${place}`} value={intValue} place={place} transition={transition} countUp={countUp} />
      ))}
      {decStr && (
        <>
          <span>.</span>
          {decPlaces.map((place) => (
            <DigitColumn key={`d${place}`} value={decValue} place={place} transition={transition} countUp={countUp} />
          ))}
        </>
      )}
    </span>
  )
}
