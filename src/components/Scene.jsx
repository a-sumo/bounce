import { Canvas, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment, Stage } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import RadarModel from "@/components/scene/RadarModel";
import DragonBallsModel from "@/components/scene/DragonBallsModel";
import ScouterModel from "@/components/scene/ScouterModel";
import * as THREE from "three";

function Background() {
  const { scene } = useThree();
  const texture = useLoader(
    THREE.TextureLoader,
    "/textures/capsule_corp_background.jpg"
  );

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.background = texture;
  }, [texture, scene]);

  return null;
}

export default function Scene() {
  return (
    <Canvas
      camera={{
        fov: 45,
        position: [0, 0, 0.5],
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
        {/* <Environment
          backgroundBlurriness={1}
          background={true}
          files="/textures/equirectangular/royal_esplanade_1k.hdr"
        /> */}
        <Stage >
        <RadarModel />
        {/* <DragonBallsModel ballIndex={4} emissiveIntensity={0.1} /> */}
        {/* <ScouterModel /> */}
        <OrbitControls minDistance={1} maxDistance={5} target={[0, 0, -0.2]} />
        <ambientLight intensity={0.5} />
        </Stage>
      </Suspense>
    </Canvas>
  );
}
