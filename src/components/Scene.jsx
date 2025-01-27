import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import { Suspense } from 'react'
import * as THREE from 'three'

function Model() {
  const { scene } = useGLTF('/models/dragon_radar/scene.gltf');
  console.log("scene", scene);
  return (
    <primitive 
      object={scene} 
      scale={0.01}
      position={[0, -0.5, 0]}
    />
  )
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