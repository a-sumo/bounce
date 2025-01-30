import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, MeshReflectorMaterial } from "@react-three/drei";
import { Suspense } from "react";
import DragonBallModel from "@/components/scene/DragonBallModel";
import RadarModel from "@/components/scene/RadarModel";
import * as THREE from "three";
import { useSelector } from "react-redux";

// Function to load textures
const loadTexture = (url) => {
  return new THREE.TextureLoader().load(`/textures/${url}`);
};

export default function Scene() {
  // Fetch all track IDs from the Redux store
  const tracks = useSelector((state) => state.audio.tracks);

  return (
    <Canvas
      camera={{
        fov: 45,
        position: [1, 1, 1],
        near: 0.25,
        far: 20,
      }}
      gl={{
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1,
        antialias: true,
      }}
    >
      <Suspense fallback={null}>
        <Environment preset="studio" environmentRotation={[0, Math.PI / 2, 0]} environmentIntensity={0.7}/>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.07, 0]}>
          <planeGeometry args={[50, 50]} />
          <MeshReflectorMaterial
            metalness={0} 
            roughness={0.1}
            envMapIntensity={1}
            blur={[400, 100]}
            resolution={1024}
            mixBlur={0.8}
            mixStrength={15}
            depthScale={1}
            minDepthThreshold={0.85}
            color="#d4d4d4"
          />
        </mesh>
        <OrbitControls minDistance={1} maxDistance={5} target={[0, 0, 0]} />
        <RadarModel />
        {Object.keys(tracks).map((trackId) => (
          <DragonBallModel
            key={trackId}
            trackId={trackId}
            radius={0.1}
          />
        ))}
      </Suspense>
    </Canvas>
  );
}