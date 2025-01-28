import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Suspense } from 'react'
import Model from '@/components/scene/Model'
import * as THREE from 'three'

export default function Scene() {
  return (
    <Canvas
      camera={{
        fov: 45,
        position: [0, 0, 0.5],
        near: 0.25,
        far: 20
      }}
      gl={{
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1,
        antialias: true
      }}
    >
      <Suspense fallback={null}>
        <Environment
          backgroundBlurriness={1} 
          background
          files="/textures/equirectangular/royal_esplanade_1k.hdr"
        />
        <Model />
        <OrbitControls
          minDistance={1}
          maxDistance={5}
          target={[0, 0, -0.2]}
        />
        <ambientLight intensity={0.5} />
      </Suspense>
    </Canvas>
  )
}
