import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense } from "react";
import DragonBallsModel from "@/components/scene/DragonBallsModel";
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
          backgroundBlurriness={1}
          background={true}
          files="/textures/equirectangular/royal_esplanade_1k.hdr"
        />
        <OrbitControls minDistance={1} maxDistance={5} target={[0, 0, -0.2]} />
        <axesHelper args={[5]} />
        <gridHelper />
        <ambientLight intensity={0.5} />

        {/* Render a dragon ball for each track */}
        {Object.keys(tracks).map((trackId) => (
          <DragonBallsModel
            key={trackId}
            trackId={trackId} // Pass the string-based trackId
            emissiveIntensity={2}
          />
        ))}
      </Suspense>
    </Canvas>
  );
}