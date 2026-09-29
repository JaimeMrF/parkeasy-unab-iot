export const devices = [
  {
    id: 'dev01', slot: 1, name: 'Slot 1 — Seguro y ocupación',
    origin: 'Digital Twin nativo', color: '#0ea472', proto: 'MQTT interno (IoT Central)',
    interval: '60 s', vars: 'lock_state, ocupado, temp_slot',
    archetype: 'bike', lock: 'closed', datasheet: 'Plantilla propia (sin sensor físico)',
  },
  {
    id: 'dev02', slot: 2, name: 'Slot 2 — Carga',
    origin: 'Python + paho (MQTT explícito)', color: '#d97706', proto: 'MQTT/TLS · puerto 8883',
    interval: '60 s', vars: 'estado_carga, corriente_a, ocupado',
    archetype: 'bike-charge', lock: 'open', datasheet: 'Módulo TP4056',
  },
  {
    id: 'dev03', slot: 3, name: 'Slot 3 — Seguro y ocupación',
    origin: 'Python (azure-iot-device SDK)', color: '#0284c7', proto: 'MQTT/TLS · puerto 8883',
    interval: '15 s', vars: 'lock_state, ocupado, lux',
    archetype: 'bike', lock: 'closed', datasheet: 'Cerradura 12V + LDR GL5528',
  },
  {
    id: 'dev04', slot: 4, name: 'Slot 4 — Carga rápida',
    origin: 'Wokwi ESP32 (DHT22 + NTC)', color: '#e11d48', proto: 'MQTT/TLS · puerto 8883',
    interval: '15 s', vars: 'soc_estimado, potencia_w, temp_conector',
    archetype: 'bike-charge', lock: 'open', datasheet: 'DHT22 + NTC 10K',
  },
  {
    id: 'dev05', slot: null, name: 'Tótem de estación',
    origin: 'Puente HTTP/REST (Flask)', color: '#9333ea', proto: 'HTTPS → reenvío MQTT',
    interval: 'evento + heartbeat 30 s', vars: 'cupos_libres, cupos_totales, lock_maestro',
    archetype: 'totem', datasheet: 'Controlador propietario simulado',
  },
  {
    id: 'dev06', slot: null, name: 'Clima del punto',
    origin: 'API pública (Open-Meteo)', color: '#0891b2', proto: 'HTTPS → reenvío MQTT',
    interval: '5 min', vars: 'temp_c, hr_pct, lluvia_mm',
    archetype: 'sensor-pole', datasheet: 'Estación virtual Open-Meteo',
  },
  {
    id: 'dev07', slot: null, name: 'Calidad de aire',
    origin: 'Open-Meteo Air Quality', color: '#059669', proto: 'HTTPS → reenvío MQTT',
    interval: '60 s', vars: 'pm25, aqi',
    archetype: 'sensor-pole', datasheet: 'Equivalente Plantower PMS5003',
  },
  {
    id: 'dev08', slot: null, name: 'Tablero de energía',
    origin: 'Replay de CSV histórico', color: '#ca8a04', proto: 'MQTT/TLS · puerto 8883',
    interval: '45 s', vars: 'kwh, corriente_a, estado_breaker',
    archetype: 'panel', datasheet: 'Medidor PZEM-004T',
  },
  {
    id: 'dev09', slot: null, name: 'Perímetro / evento',
    origin: 'Wokwi ESP32 #2 (PIR + LDR)', color: '#db2777', proto: 'MQTT/TLS · puerto 8883',
    interval: '60 s', vars: 'movimiento, lux_nocturno, puerta',
    archetype: 'camera-pole', datasheet: 'PIR HC-SR501 + LDR GL5528',
  },
  {
    id: 'dev10', slot: null, name: 'Pasarela de sesión',
    origin: 'MQTT sobre WebSockets', color: '#16a34a', proto: 'MQTT-WS/TLS · puerto 443',
    interval: '20 s', vars: 'sesion_activa, usuario_anonimo, ack',
    archetype: 'kiosk', datasheet: 'Lógica de aplicación',
  },
]

const r = (min, max, dec = 0) => {
  const v = Math.random() * (max - min) + min
  return dec ? Number(v.toFixed(dec)) : Math.round(v)
}

export function samplePayload(deviceId) {
  const ts = new Date().toISOString().split('T')[1].slice(0, 8)
  switch (deviceId) {
    case 'dev01': return { lock_state: 'closed', ocupado: Math.random() > 0.4, temp_slot: r(18, 32, 1), _ts: ts }
    case 'dev02': return { estado_carga: 'charging', corriente_a: r(0.5, 2.4, 2), ocupado: true, _ts: ts }
    case 'dev03': return { lock_state: 'closed', ocupado: Math.random() > 0.3, lux: r(60, 380, 1), _ts: ts }
    case 'dev04': return { soc_estimado: r(20, 100), potencia_w: r(5, 28, 1), temp_conector: r(30, 52, 1), _ts: ts }
    case 'dev05': return { cupos_libres: r(0, 4), cupos_totales: 4, lock_maestro: 'armed', _ts: ts }
    case 'dev06': return { temp_c: r(18, 26, 1), hr_pct: r(70, 98), lluvia_mm: r(0, 2, 1), _ts: ts }
    case 'dev07': return { pm25: r(10, 60, 1), aqi: r(20, 130), _ts: ts }
    case 'dev08': return { kwh: r(6, 14, 1), corriente_a: r(1, 4, 1), estado_breaker: 'on', _ts: ts }
    case 'dev09': return { movimiento: Math.random() > 0.5, lux_nocturno: r(0, 40, 1), puerta: 'closed', _ts: ts }
    case 'dev10': return { sesion_activa: Math.random() > 0.5, usuario_anonimo: 'anon-' + r(100, 999), ack: true, _ts: ts }
    default: return {}
  }
}

// which mini-dashboard KPI each device updates when its packet "arrives"
export const KPI_MAP = {
  dev05: 'cupos', dev04: 'temp', dev02: 'temp', dev07: 'pm25', dev08: 'kwh',
}

export const rules = [
  { id: 'r1', title: 'Ocupación alta', variable: 'cupos_libres', operator: '<', threshold: 1, min: 0, max: 4, unit: 'cupos', color: '#0ea472', icon: '🅿️', desc: 'Notifica cuando la estación se llena, para redirigir usuarios a otro punto.' },
  { id: 'r2', title: 'Sobretemperatura de carga', variable: 'temp_conector', operator: '>', threshold: 45, min: 15, max: 70, unit: '°C', color: '#e11d48', icon: '🌡️', desc: 'Detecta riesgo térmico en el conector antes de que sea una falla.' },
  { id: 'r3', title: 'Calidad de aire crítica', variable: 'aqi', operator: '>', threshold: 100, min: 0, max: 200, unit: 'AQI', color: '#0284c7', icon: '🌫️', desc: 'Alerta si el aire del andén se vuelve dañino para ciclistas.' },
]

export const timelineEvents = [
  { time: '19:50:26 → 19:51:06', dot: '#e11d48', title: 'dev06-clima se desconecta', desc: 'Corte real durante el reinicio de los procesos de la flota. IoT Central registra "Dispositivo desconectado" de forma nativa.' },
  { time: '19:51:06', dot: '#0ea472', title: 'Reconexión automática', desc: 'El script de Python vuelve a registrar el dispositivo vía DPS y retoma el envío cada 5 minutos, sin intervención manual.' },
  { time: '20:00:05', dot: '#0284c7', title: 'dev03-slot3 sigue en vivo', desc: '15 segundos de intervalo sostenidos durante toda la ventana — evidencia de asincronía real frente a los 5 min de dev06.' },
]

export const team = [
  { name: 'Jaime Alejandro Vega Barbosa', code: 'U00178766', initials: 'JV', gradient: 'from-emerald-500 to-sky-500' },
  { name: 'Juan Sebastián Jiménez Daza', code: 'U00177874', initials: 'JJ', gradient: 'from-purple-500 to-rose-500' },
]
