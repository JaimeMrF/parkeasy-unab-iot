import PageTransition from '../components/PageTransition.jsx'
import Reveal from '../components/Reveal.jsx'
import LiveEventStack from '../components/animate-ui/LiveEventStack.jsx'
import { timelineEvents } from '../data/devices.js'

const stackEvents = [
  { title: 'dev06-clima desconectado', time: '19:50:26', dot: '#e11d48' },
  { title: 'dev06-clima reconectado', time: '19:51:06', dot: '#0ea472' },
  { title: 'dev03-slot3 en vivo, 15 s', time: '20:00:05', dot: '#0284c7' },
]

export default function Evidencia() {
  return (
    <PageTransition>
      <section className="pt-32 pb-24 max-w-[1220px] mx-auto px-6">
        <Reveal>
          <div className="text-emerald-600 text-xs font-bold tracking-widest uppercase mb-3">Asincronía y desconexión real</div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight max-w-2xl mb-4">No lo simulamos: lo capturamos ocurriendo.</h1>
          <p className="text-[var(--color-dim)] max-w-xl mb-14">Estos eventos vienen directo del log "Datos sin procesar" de Azure IoT Central, sin edición posterior.</p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          <Reveal>
            <div className="relative pl-8 border-l-2 border-[var(--color-line)]">
              {timelineEvents.map((t, i) => (
                <div key={i} className="relative mb-9">
                  <span
                    className="absolute -left-[39px] top-1 w-3 h-3 rounded-full"
                    style={{ background: t.dot, boxShadow: `0 0 0 5px ${t.dot}22` }}
                  />
                  <div className="text-xs font-semibold text-[var(--color-dim)] mb-1">{t.time}</div>
                  <div className="font-bold mb-1">{t.title}</div>
                  <div className="text-sm text-[var(--color-dim)] leading-relaxed">{t.desc}</div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl overflow-hidden border border-[var(--color-line)] shadow-xl">
              <img src="/assets/catalogo_10_dispositivos.jpg" alt="Catálogo de 10 dispositivos en IoT Central" className="w-full block" />
            </div>
            <p className="text-xs text-[var(--color-dim)] mt-3 text-center">Catálogo completo de 10 dispositivos, plantillas y estado de aprovisionamiento — vista real de IoT Central.</p>

            <div className="mt-6 flex flex-col items-center">
              <LiveEventStack events={stackEvents} />
              <p className="text-xs text-[var(--color-dim)] mt-3 text-center">Pasa el cursor para expandir la pila de eventos.</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="mt-16">
          <div className="card p-8">
            <h3 className="font-bold text-lg mb-3">¿Por qué esto importa para la sustentación?</h3>
            <p className="text-sm text-[var(--color-dim)] leading-relaxed">
              Los dos códigos que se ejecutan en vivo el día de la defensa son <b className="text-[var(--color-ink)]">dev03</b> (Python + azure-iot-device, MQTT nativo) y <b className="text-[var(--color-ink)]">dev02</b> (Python + paho-mqtt explícito) — dos protocolos y librerías distintas en dos equipos distintos, cumpliendo el requisito formal. dev04 y dev09 (Wokwi) quedan documentados con su código y firmware completos como parte del catálogo de 10 orígenes.
            </p>
          </div>
        </Reveal>
      </section>
    </PageTransition>
  )
}
