import { AnimatePresence, motion } from 'framer-motion'

export default function DeviceDrawer({ device, onClose }) {
  return (
    <AnimatePresence>
      {device && (
        <motion.div
          initial={{ x: 360, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 360, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="fixed top-24 right-6 w-[320px] z-40 card p-6"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-[11px] font-bold tracking-widest text-[var(--color-dim)]">{device.id.toUpperCase()}</div>
              <h3 className="text-lg font-extrabold leading-tight mt-1">{device.name}</h3>
            </div>
            <button onClick={onClose} className="text-[var(--color-dim)] hover:text-[var(--color-ink)] text-xl leading-none">×</button>
          </div>
          <span className="inline-block text-[11px] font-bold px-3 py-1 rounded-full mb-4" style={{ background: device.color + '1a', color: device.color }}>
            {device.origin}
          </span>
          <div className="space-y-2 text-sm">
            <Row label="Protocolo" value={device.proto} />
            <Row label="Intervalo" value={device.interval} />
            <Row label="Variables" value={device.vars} mono />
            <Row label="Datasheet" value={device.datasheet} />
            {device.lock && <Row label="Estado seguro" value={device.lock === 'closed' ? 'Cerrado 🔒' : 'Abierto 🔓'} />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex flex-col gap-0.5 border-t border-[var(--color-line)] pt-2 first:border-0 first:pt-0">
      <span className="text-[11px] uppercase tracking-wide text-[var(--color-dim)] font-semibold">{label}</span>
      <span className={mono ? 'mono text-[13px]' : 'text-[14px] font-medium'}>{value}</span>
    </div>
  )
}
