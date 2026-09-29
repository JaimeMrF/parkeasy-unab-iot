import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/arquitectura', label: 'Arquitectura' },
  { to: '/parqueadero', label: 'Parqueadero 3D' },
  { to: '/control-room', label: 'Control Room' },
  { to: '/reglas', label: 'Reglas' },
  { to: '/evidencia', label: 'Evidencia' },
  { to: '/equipo', label: 'Equipo' },
]

export default function Nav() {
  const { pathname } = useLocation()

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-[1120px]"
    >
      <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-2xl backdrop-blur-xl bg-white/75 border border-[var(--color-line)] shadow-[0_10px_40px_-16px_rgba(15,23,42,0.25)]">
        <NavLink to="/" className="flex items-center gap-2 font-extrabold tracking-tight text-[15px] pl-2 shrink-0">
          <span className="relative flex items-center justify-center w-2.5 h-2.5">
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60" />
            <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </span>
          ParkEasy <span className="text-emerald-600">UNAB</span>
        </NavLink>
        <div className="hidden lg:flex items-center gap-0.5 text-sm font-medium text-[var(--color-dim)] bg-[var(--color-bg)] rounded-xl p-1 border border-[var(--color-line)]">
          {links.map((l) => {
            const isActive = pathname === l.to
            return (
              <NavLink
                key={l.to}
                to={l.to}
                className="relative px-3.5 py-1.5 rounded-lg transition-colors"
                style={{ color: isActive ? 'var(--color-ink)' : undefined }}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-white shadow-[0_4px_14px_-6px_rgba(15,23,42,0.3)] border border-[var(--color-line)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{l.label}</span>
              </NavLink>
            )
          })}
        </div>
      </div>
    </motion.nav>
  )
}
