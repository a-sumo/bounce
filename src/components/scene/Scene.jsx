import { Canvas } from "@react-three/fiber";
import { OrbitControls, MeshReflectorMaterial, Environment } from "@react-three/drei";
import { Suspense } from "react";
import DragonBallModel from "@/components/scene/DragonBallModel";
import RadarModel from "@/components/scene/RadarModel";
import { useSelector } from "react-redux";
import * as THREE from "three";

export default function Scene() {
  // Fetch all track IDs from the Redux store
  const tracks = useSelector((state) => state.audio.tracks);

  return (
    <Canvas
      camera={{
        fov: 45,
        position: [0, 0, 1],
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
        <Environment
          preset="dawn"
        />
        <OrbitControls minDistance={1} maxDistance={5} target={[0, 0, -0.2]} />
        <axesHelper args={[5]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.07, 0]}>
          <planeGeometry args={[50, 50]} />
          <MeshReflectorMaterial
            blur={[400, 100]}
            resolution={1024}
            mixBlur={0.8}
            mixStrength={15}
            depthScale={1}
            minDepthThreshold={0.85}
            color="#151515"
            metalness={0.6}
            roughness={1}
          />
        </mesh>        
        <ambientLight intensity={0.5} />
        <RadarModel />
        {/* Render a dragon ball for each track */}
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
