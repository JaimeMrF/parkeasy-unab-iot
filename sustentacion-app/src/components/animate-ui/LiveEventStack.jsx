// Ported from animate-ui.com (Community / Notification List): a stack of
// cards that fans out on hover. Re-themed in Spanish with the real
// connection/Rule events of ParkEasy UNAB instead of the original npm/build
// placeholder content. https://animate-ui.com/docs/components/community/notification-list
import { motion } from 'framer-motion'

const transition = { type: 'spring', stiffness: 300, damping: 26 }
const textSwitchTransition = { duration: 0.22, ease: 'easeInOut' }

const getCardVariants = (i) => ({
  collapsed: { marginTop: i === 0 ? 0 : -44, scaleX: 1 - i * 0.05 },
  expanded: { marginTop: i === 0 ? 0 : 4, scaleX: 1 },
})

const labelVariants = {
  collapsed: { opacity: 1, y: 0, pointerEvents: 'auto' },
  expanded: { opacity: 0, y: -16, pointerEvents: 'none' },
}
const hintVariants = {
  collapsed: { opacity: 0, y: 16, pointerEvents: 'none' },
  expanded: { opacity: 1, y: 0, pointerEvents: 'auto' },
}

export default function LiveEventStack({ events, title = 'Eventos reales', hint = 'Log nativo de IoT Central' }) {
  return (
    <motion.div
      data-slot="live-event-stack"
      className="card p-3 w-full max-w-xs space-y-3"
      initial="collapsed"
      whileHover="expanded"
      whileTap="expanded"
    >
      <div>
        {events.map((event, i) => (
          <motion.div
            key={event.title}
            className="rounded-xl px-4 py-2.5 relative bg-[var(--color-bg)] border border-[var(--color-line)] shadow-sm hover:shadow-md transition-shadow"
            variants={getCardVariants(i)}
            transition={transition}
            style={{ zIndex: events.length - i }}
          >
            <div className="flex justify-between items-center gap-2">
              <h4 className="text-sm font-bold truncate">{event.title}</h4>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: event.dot }} />
            </div>
            <div className="text-[11px] text-[var(--color-dim)] font-medium mt-0.5">
              <span className="mono">{event.time}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-2 px-1">
        <div className="size-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold shrink-0">
          {events.length}
        </div>
        <span className="grid">
          <motion.span
            className="text-sm font-semibold text-[var(--color-dim)] row-start-1 col-start-1"
            variants={labelVariants}
            transition={textSwitchTransition}
          >
            {title}
          </motion.span>
          <motion.span
            className="text-sm font-semibold text-emerald-600 row-start-1 col-start-1"
            variants={hintVariants}
            transition={textSwitchTransition}
          >
            {hint}
          </motion.span>
        </span>
      </div>
    </motion.div>
  )
}
