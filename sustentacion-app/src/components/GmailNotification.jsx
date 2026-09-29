import { motion, AnimatePresence } from 'framer-motion'

function MailIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 48 48" className="shrink-0">
      <rect x="2" y="8" width="44" height="32" rx="4" fill="#fff" stroke="#e2e5e9" strokeWidth="1.5" />
      <path d="M4 10 L24 26 L44 10" fill="none" stroke="#ea4335" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 10 L4 38" stroke="#4285f4" strokeWidth="3" strokeLinecap="round" />
      <path d="M44 10 L44 38" stroke="#34a853" strokeWidth="3" strokeLinecap="round" />
      <path d="M4 38 L18 26" stroke="#fbbc05" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

export default function GmailNotification({ items, onDismiss }) {
  return (
    <div className="fixed top-24 right-6 z-[100] w-[360px] space-y-3 pointer-events-none">
      <AnimatePresence>
        {items.map((n) => (
          <motion.div
            key={n.id}
            initial={{ x: 420, opacity: 0, rotate: 2 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            exit={{ x: 420, opacity: 0, transition: { duration: 0.25 } }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="pointer-events-auto rounded-2xl bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.28)] border border-[#e2e5e9] overflow-hidden"
          >
            <div className="flex gap-3 p-4">
              <MailIcon />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#202124]">Alertas ParkEasy UNAB</span>
                  <button onClick={() => onDismiss(n.id)} className="text-[#5f6368] hover:text-[#202124] text-sm leading-none ml-2">✕</button>
                </div>
                <div className="text-[11px] text-[#5f6368] mb-1">alerts@parkeasy-unab.iotcentral · ahora</div>
                <div className="text-[13px] font-semibold text-[#202124] truncate">🚨 Regla disparada: {n.title}</div>
                <div className="text-[12px] text-[#5f6368] mt-0.5 mono truncate">{n.condition}</div>
              </div>
            </div>
            <motion.div
              className="h-[3px]"
              style={{ background: n.color }}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 4, ease: 'linear' }}
              onAnimationComplete={() => onDismiss(n.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
