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

function Model2() {
  const { scene } = useGLTF('/models/dragon_radar/scene.gltf')
  const canvasRef = useRef(null)
  const textureRef = useRef(null)
  const animationFrameId = useRef(null)

  useEffect(() => {
    // Create canvas
    const canvas = document.createElement('canvas')
    const TEXTURE_SIZE = 1024
    canvas.width = TEXTURE_SIZE
    canvas.height = TEXTURE_SIZE
    const ctx = canvas.getContext('2d')

    // Create virtual canvas size (e.g., 100x100)
    const virtualSize = 100
    const transformer = createTransformer(virtualSize)
    let time = 0;

    // Create texture from canvas
    const canvasTexture = new THREE.CanvasTexture(canvas)
    canvasTexture.colorSpace = THREE.SRGBColorSpace
    textureRef.current = canvasTexture

    const animate = () => {
      // Fill with black background
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)

      // Draw the main circular boundary
      ctx.beginPath()
      ctx.arc(TARGET_CENTER.x, TARGET_CENTER.y, TARGET_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = '#333333'
      ctx.fill()
      time += 0.02;
      const virtualY = virtualSize/2 + Math.sin(time) * (virtualSize/4)

      // Example: Draw a centered white circle using virtual coordinates
      const [centerX, centerY] = transformer.transform(virtualSize/2, virtualY)
      const radius = transformer.transformRadius(20) // 20 units in virtual space
      
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fillStyle = 'white'
      ctx.fill()
      
      canvasTexture.needsUpdate = true;

      animationFrameId.current = requestAnimationFrame(animate)
    }

    animate()


    // Get object and update its material
    const object2 = scene.getObjectByName("Object_2")
    if (object2 && object2.material) {
      object2.material = object2.material.clone()
      object2.material.emissiveMap = canvasTexture

      object2.material.emissive = new THREE.Color(1, 1, 1)
      object2.material.emissiveIntensity = 1
      object2.material.needsUpdate = true
    }

    return () => {
      cancelAnimationFrame(animationFrameId.current)
      canvasTexture.dispose()
    }
  }, [scene])

  return (
    <>
      <primitive 
        object={scene} 
        scale={0.01}
        position={[0, -0.5, 0]}
      />
    </>
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
