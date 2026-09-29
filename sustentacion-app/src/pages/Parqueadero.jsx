import { Suspense, useEffect, useRef, useState } from 'react'
import ParkingScene from '../components/ParkingScene.jsx'
import DeviceDrawer from '../components/DeviceDrawer.jsx'
import PageTransition from '../components/PageTransition.jsx'
import { devices } from '../data/devices.js'

export default function Parqueadero() {
  const [selectedId, setSelectedId] = useState(null)
  const [autoRotate, setAutoRotate] = useState(true)
  const [touring, setTouring] = useState(false)
  const tourIndex = useRef(0)
  const intervalRef = useRef(null)

  const selected = devices.find((d) => d.id === selectedId) || null

  useEffect(() => {
    if (touring) {
      setAutoRotate(false)
      intervalRef.current = setInterval(() => {
        setSelectedId(devices[tourIndex.current % devices.length].id)
        tourIndex.current += 1
      }, 3200)
      setSelectedId(devices[0].id)
      tourIndex.current = 1
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [touring])

  return (
    <PageTransition>
      <section className="pt-28 pb-4 max-w-[1220px] mx-auto px-6">
        <div className="text-emerald-600 text-xs font-bold tracking-widest uppercase mb-3">Parqueadero 3D interactivo</div>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight max-w-xl">Haz clic en cualquier objeto de la estación para inspeccionarlo.</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setTouring((v) => !v)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${touring ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]' : 'bg-white border-[var(--color-line)] hover:-translate-y-0.5'}`}
            >
              {touring ? '⏸ Detener modo sustentación' : '▶ Modo sustentación (tour automático)'}
            </button>
            <button
              onClick={() => setAutoRotate((v) => !v)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-[var(--color-line)] bg-white hover:-translate-y-0.5 transition"
            >
              {autoRotate ? '⏹ Detener rotación' : '🔄 Rotar automático'}
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-[1220px] mx-auto px-6 pb-10">
        <div className="card overflow-hidden relative" style={{ height: '68vh' }}>
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-[var(--color-dim)]">Cargando escena 3D…</div>}>
            <ParkingScene devices={devices} onSelect={(id) => { setSelectedId(id); setTouring(false) }} selectedId={selectedId} interactive autoRotate={autoRotate} />
          </Suspense>
          <div className="absolute bottom-4 left-4 text-[11px] text-[var(--color-dim)] bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-[var(--color-line)]">
            🖱️ Arrastra para rotar · rueda para zoom · clic en un objeto para inspeccionarlo
          </div>
        </div>
      </section>

      <section className="max-w-[1220px] mx-auto px-6 pb-24">
        <div className="text-sm font-semibold text-[var(--color-dim)] mb-3">Selección rápida por dispositivo</div>
        <div className="flex flex-wrap gap-2">
          {devices.map((d) => (
            <button
              key={d.id}
              onClick={() => { setSelectedId(d.id); setTouring(false) }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold border transition"
              style={{
                borderColor: selectedId === d.id ? d.color : '#e7e9ec',
                background: selectedId === d.id ? d.color + '14' : '#fff',
                color: selectedId === d.id ? d.color : '#0b1220',
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
              {d.id.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      <DeviceDrawer device={selected} onClose={() => setSelectedId(null)} />
    </PageTransition>
  )
}
