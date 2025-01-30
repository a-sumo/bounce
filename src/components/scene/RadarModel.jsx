import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import RadarVisualization from "@/components/radar/RadarVisualization";

const SCALE_FACTOR = 0.01;

const RadarModel = () => {
  const { scene } = useGLTF("/models/dragon_radar/scene.gltf");
  const emissiveMapRef = useRef(null);

  useEffect(() => {
    const radar = scene.getObjectByName("Object_2");
    scene.scale.set(SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR);

    if (radar) {
      // Calculate bounding box and center the radar
      const bbox = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      bbox.getCenter(center);
      scene.position.sub(center);

      // Reset rotation
      radar.rotation.set(0, 0, 0);
      // scene.translateZ(SCALE_FACTOR * 7);

      // Update material properties
      if (radar.material) {
        const material = radar.material.clone();
        material.emissive = new THREE.Color(1, 1, 1);
        material.emissiveIntensity = 1;
        radar.material = material;

        if (emissiveMapRef.current) {
          material.emissiveMap = emissiveMapRef.current;
          material.needsUpdate = true;
        }
      }
    }
  }, [scene]);

  // Update emissive map if it changes
  useEffect(() => {
    const radar = scene.getObjectByName("Object_2");
    if (radar?.material && emissiveMapRef.current) {
      radar.material.emissiveMap = emissiveMapRef.current;
      radar.material.needsUpdate = true;
    }
  }, [scene, emissiveMapRef.current]);

  return (
    <>
      <primitive object={scene} rotation={[ - Math.PI / 2, 0, 0]}/>
      <RadarVisualization
        targetCenter={{ x: 713, y: 718 }}
        targetRadius={294}
        emissiveMapRef={emissiveMapRef}
      />
    </>
  );
};

export default RadarModel;