import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Nav from './components/Nav.jsx'
import CursorGlow from './components/CursorGlow.jsx'
import Home from './pages/Home.jsx'
import Arquitectura from './pages/Arquitectura.jsx'
import Parqueadero from './pages/Parqueadero.jsx'
import ControlRoom from './pages/ControlRoom.jsx'
import Reglas from './pages/Reglas.jsx'
import Evidencia from './pages/Evidencia.jsx'
import Equipo from './pages/Equipo.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  const location = useLocation()
  return (
    <div className="bg-dots min-h-screen">
      <CursorGlow />
      <Nav />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/arquitectura" element={<Arquitectura />} />
          <Route path="/parqueadero" element={<Parqueadero />} />
          <Route path="/control-room" element={<ControlRoom />} />
          <Route path="/reglas" element={<Reglas />} />
          <Route path="/evidencia" element={<Evidencia />} />
          <Route path="/equipo" element={<Equipo />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </div>
  )
}
