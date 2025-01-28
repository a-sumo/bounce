// components/scene/Model.jsx
import { useGLTF } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import RadarVisualization from '@/components/radar/RadarVisualization'

const Model = () => {
  const { scene } = useGLTF('/models/dragon_radar/scene.gltf')
  const emissiveMapRef = useRef(null)

  useEffect(() => {
    // When the GLTF loads, update the material to use the canvas texture
    const object2 = scene.getObjectByName("Object_2")
    if (object2?.material) {
      const material = object2.material.clone()
      material.emissive = new THREE.Color(1, 1, 1)
      material.emissiveIntensity = 1
      object2.material = material

      // Whenever emissiveMapRef.current is assigned from the RadarVisualization,
      // set it as the object’s emissive map
      if (emissiveMapRef.current) {
        material.emissiveMap = emissiveMapRef.current
        material.needsUpdate = true
      }
    }
  }, [scene])

  // In a separate effect, if the texture changes after the first render, update again
  useEffect(() => {
    const object2 = scene.getObjectByName("Object_2")
    if (object2?.material && emissiveMapRef.current) {
      object2.material.emissiveMap = emissiveMapRef.current
      object2.material.needsUpdate = true
    }
  }, [scene, emissiveMapRef.current])

  return (
    <>
      <primitive 
        object={scene} 
        scale={0.01}
        position={[0, -0.27, 0]}
      />
      {/* 
        RadarVisualization will create its own CanvasTexture and store it in
        emissiveMapRef.current. That texture is used above in the effect. 
      */}
      <RadarVisualization
        targetCenter={{ x: 713, y: 718 }}
        targetRadius={294}
        emissiveMapRef={emissiveMapRef}
      />
    </>
  )
}

export default Model
