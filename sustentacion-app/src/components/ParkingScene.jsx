import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Text, RoundedBox, Line } from '@react-three/drei'
import * as THREE from 'three'

const POSITIONS = {
  dev01: [-4.5, 0, 2],
  dev02: [-1.5, 0, 2],
  dev03: [1.5, 0, 2],
  dev04: [4.5, 0, 2],
  dev05: [0, 0, -2.6],
  dev06: [-6.8, 0, -0.5],
  dev07: [6.8, 0, -0.5],
  dev08: [-6.8, 0, -4],
  dev09: [6.8, 0, -4],
  dev10: [0, 0, 5],
}
const CLOUD_POS = [0, 6.2, -0.5]

function Wheel({ position }) {
  return (
    <mesh position={position} rotation={[0, 0, Math.PI / 2]} castShadow>
      <torusGeometry args={[0.42, 0.06, 12, 28]} />
      <meshStandardMaterial color="#1f2430" roughness={0.6} metalness={0.2} />
    </mesh>
  )
}

function Bike({ color, locked, charging, hovered }) {
  const glow = hovered ? 0.9 : 0.5
  return (
    <group position={[0, 0.42, 0]}>
      <Wheel position={[-0.55, 0, 0]} />
      <Wheel position={[0.55, 0, 0]} />
      {/* frame */}
      <mesh position={[0, 0.05, 0]} rotation={[0, 0, 0.5]} castShadow>
        <boxGeometry args={[0.9, 0.06, 0.06]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow * 0.3} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0.15, 0.28, 0]} rotation={[0, 0, -0.35]} castShadow>
        <boxGeometry args={[0.55, 0.05, 0.05]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow * 0.3} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0.4, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.28, 8]} />
        <meshStandardMaterial color="#3a4150" />
      </mesh>
      <mesh position={[0.4, 0.65, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.32, 8]} />
        <meshStandardMaterial color="#3a4150" />
      </mesh>
      <mesh position={[-0.35, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.22, 8]} />
        <meshStandardMaterial color="#3a4150" />
      </mesh>
      <mesh position={[-0.35, 0.44, 0]} castShadow>
        <boxGeometry args={[0.16, 0.04, 0.09]} />
        <meshStandardMaterial color="#111318" />
      </mesh>
      {/* lock indicator */}
      <mesh position={[-0.15, 0.12, 0.12]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial
          color={locked ? '#0ea472' : '#e11d48'}
          emissive={locked ? '#0ea472' : '#e11d48'}
          emissiveIntensity={0.9}
        />
      </mesh>
      {charging && (
        <mesh position={[0.75, 0.15, 0]} castShadow>
          <boxGeometry args={[0.12, 0.3, 0.12]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.3} metalness={0.4} emissive={color} emissiveIntensity={0.15} />
        </mesh>
      )}
    </group>
  )
}

function Totem({ color, hovered }) {
  return (
    <group>
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.5, 2.2, 0.35]} />
        <meshStandardMaterial color="#e9edf1" roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.5, 0.19]}>
        <planeGeometry args={[0.36, 0.5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 1.1 : 0.7} />
      </mesh>
      <Text position={[0, 1.5, 0.2]} fontSize={0.14} color="white" anchorX="center" anchorY="middle">
        4/4{'\n'}LIBRES
      </Text>
    </group>
  )
}

function SensorPole({ color, hovered }) {
  const ref = useRef()
  useFrame((s) => { if (ref.current) ref.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * 2) * 0.15) })
  return (
    <group>
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 2, 10]} />
        <meshStandardMaterial color="#c7cdd6" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 2.05, 0]} castShadow>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 1 : 0.6} />
      </mesh>
      <mesh ref={ref} position={[0, 2.05, 0]}>
        <torusGeometry args={[0.22, 0.006, 8, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

function EnergyPanel({ color, hovered }) {
  return (
    <group>
      <RoundedBox args={[0.7, 1.1, 0.4]} radius={0.05} position={[0, 0.55, 0]} castShadow>
        <meshStandardMaterial color="#eef1f3" roughness={0.4} metalness={0.15} />
      </RoundedBox>
      <mesh position={[0, 0.75, 0.21]}>
        <planeGeometry args={[0.46, 0.28]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 1 : 0.6} />
      </mesh>
      {[0.35, 0.2, 0.05].map((y, i) => (
        <mesh key={i} position={[0, y, 0.205]}>
          <boxGeometry args={[0.4, 0.02, 0.01]} />
          <meshStandardMaterial color="#9aa4b2" />
        </mesh>
      ))}
    </group>
  )
}

function CameraPole({ color, hovered }) {
  return (
    <group>
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 2.6, 10]} />
        <meshStandardMaterial color="#c7cdd6" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 2.5, 0.08]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[0.18, 0.14, 0.26]} />
        <meshStandardMaterial color="#20242c" roughness={0.3} metalness={0.5} emissive={color} emissiveIntensity={hovered ? 0.6 : 0.2} />
      </mesh>
      <mesh position={[0, 2.15, 0.55]} rotation={[1.15, 0, 0]}>
        <coneGeometry args={[0.55, 1.1, 24, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function Kiosk({ color, hovered }) {
  return (
    <group>
      <RoundedBox args={[0.55, 1.35, 0.5]} radius={0.08} position={[0, 0.68, 0]} castShadow>
        <meshStandardMaterial color="#f2f4f6" roughness={0.35} metalness={0.1} />
      </RoundedBox>
      <mesh position={[0, 0.95, 0.26]}>
        <planeGeometry args={[0.38, 0.55]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 1 : 0.6} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.35, 6]} />
        <meshStandardMaterial color="#3a4150" />
      </mesh>
    </group>
  )
}

function DataArc({ from, to, color, speed = 0.3, offset = 0 }) {
  const points = useMemo(() => {
    const start = new THREE.Vector3(...from)
    const end = new THREE.Vector3(...to)
    const pts = []
    for (let t = 0; t <= 1; t += 0.04) {
      const p = start.clone().lerp(end, t)
      p.y += Math.sin(t * Math.PI) * 1.6
      pts.push(p)
    }
    return pts
  }, [from, to])

  const particleRef = useRef()
  useFrame((s) => {
    const t = ((s.clock.elapsedTime * speed) + offset) % 1
    const start = new THREE.Vector3(...from)
    const end = new THREE.Vector3(...to)
    const p = start.clone().lerp(end, t)
    p.y += Math.sin(t * Math.PI) * 1.6
    if (particleRef.current) particleRef.current.position.copy(p)
  })

  return (
    <>
      <Line points={points} color={color} transparent opacity={0.28} lineWidth={1} />
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </>
  )
}

function CloudNode() {
  const ref = useRef()
  const wireRef = useRef()
  useFrame((s) => {
    const t = s.clock.elapsedTime
    if (ref.current) ref.current.position.y = CLOUD_POS[1] + Math.sin(t * 0.7) * 0.2
    if (wireRef.current) { wireRef.current.rotation.y = t * 0.25; wireRef.current.position.y = ref.current.position.y }
  })
  return (
    <group>
      <mesh ref={ref} position={CLOUD_POS} castShadow>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.05} emissive="#0ea472" emissiveIntensity={0.18} />
      </mesh>
      <mesh ref={wireRef} position={CLOUD_POS}>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshBasicMaterial color="#0ea472" wireframe transparent opacity={0.3} />
      </mesh>
      <Text position={[CLOUD_POS[0], CLOUD_POS[1] + 2, CLOUD_POS[2]]} fontSize={0.32} color="#0b1220" fontWeight={700} anchorX="center">
        Azure IoT Central
      </Text>
    </group>
  )
}

function DeviceObject({ device, hovered }) {
  switch (device.archetype) {
    case 'bike': return <Bike color={device.color} locked={device.lock === 'closed'} charging={false} hovered={hovered} />
    case 'bike-charge': return <Bike color={device.color} locked={device.lock === 'closed'} charging hovered={hovered} />
    case 'totem': return <Totem color={device.color} hovered={hovered} />
    case 'sensor-pole': return <SensorPole color={device.color} hovered={hovered} />
    case 'panel': return <EnergyPanel color={device.color} hovered={hovered} />
    case 'camera-pole': return <CameraPole color={device.color} hovered={hovered} />
    case 'kiosk': return <Kiosk color={device.color} hovered={hovered} />
    default: return null
  }
}

function DeviceMarker({ device, onSelect, selectedId, interactive }) {
  const [hovered, setHovered] = useState(false)
  const pos = POSITIONS[device.id]
  const isSelected = selectedId === device.id

  return (
    <group
      position={pos}
      onClick={(e) => { if (!interactive) return; e.stopPropagation(); onSelect(device.id) }}
      onPointerOver={(e) => { if (!interactive) return; e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
    >
      <DeviceObject device={device} hovered={hovered || isSelected} />
      {(hovered || isSelected) && (
        <Text position={[0, 3, 0]} fontSize={0.22} color={device.color} anchorX="center" outlineWidth={0.008} outlineColor="#ffffff">
          {device.id.toUpperCase()}
        </Text>
      )}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.05, 32]} />
          <meshBasicMaterial color={device.color} transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  )
}

function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#eef1f3" roughness={0.95} />
      </mesh>
      <gridHelper args={[40, 40, '#d6dbe0', '#e6e9ec']} position={[0, 0, 0]} />
    </group>
  )
}

function Rig({ autoRotate }) {
  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      autoRotate={autoRotate}
      autoRotateSpeed={0.6}
      minDistance={7}
      maxDistance={26}
      minPolarAngle={0.3}
      maxPolarAngle={1.45}
      target={[0, 1, 0]}
      enableDamping
      dampingFactor={0.08}
    />
  )
}

export default function ParkingScene({ devices, onSelect, selectedId, interactive = true, autoRotate = true, cameraPos = [11, 8, 13] }) {
  return (
    <Canvas shadows camera={{ position: cameraPos, fov: 40 }} dpr={[1, 2]}>
      <color attach="background" args={['#fbfbfa']} />
      <fog attach="fog" args={['#fbfbfa', 14, 36]} />
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <pointLight position={CLOUD_POS} intensity={1.2} color="#0ea472" distance={14} />

      <Ground />
      <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={30} blur={2} far={10} />

      <CloudNode />

      {devices.map((d) => (
        <group key={d.id}>
          <DeviceMarker device={d} onSelect={onSelect} selectedId={selectedId} interactive={interactive} />
          <DataArc from={[POSITIONS[d.id][0], 0.6, POSITIONS[d.id][2]]} to={CLOUD_POS} color={d.color} speed={0.15 + Math.random() * 0.1} offset={Math.random()} />
        </group>
      ))}

      <Rig autoRotate={autoRotate} />
    </Canvas>
  )
}
