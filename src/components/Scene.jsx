import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useRef } from 'react'
import Model from '@/components/scene/Model'
import * as THREE from 'three'

// Constants for the target region
const TEXTURE_SIZE = 1024
const TARGET_CENTER = { x: 713, y: 718 }
const TARGET_RADIUS = 294

// Transform function to map coordinates from virtual canvas to target region
function createTransformer(virtualSize) {
  const scale = (TARGET_RADIUS * 2) / virtualSize

  return {
    transform: (x, y) => {
      // Convert from virtual coordinates to target region coordinates
      const scaledX = x * scale
      const scaledY = y * scale
      
      // Center around target center
      const transformedX = TARGET_CENTER.x + (scaledX - TARGET_RADIUS)
      const transformedY = TARGET_CENTER.y + (scaledY - TARGET_RADIUS)
      
      return [transformedX, transformedY]
    },
    
    transformRadius: (r) => r * scale
  }
}

export default function Scene() {
  return (
    <Canvas
      camera={{
        fov: 45,
        position: [-1.8, 0.6, 2.7],
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
          minDistance={2}
          maxDistance={10}
          target={[0, 0, -0.2]}
        />
        <ambientLight intensity={0.5} />
      </Suspense>
    </Canvas>
  )
}
