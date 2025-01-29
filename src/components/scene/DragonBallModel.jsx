import { memo, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { selectTrackById } from "@/redux/selectors";
import { useSelector } from "react-redux";

const EMISSIVE_COLOR = new THREE.Color(1, 0, 0);
const MODEL_SCALE = 0.1;
const DISTANCE_FROM_ORIGIN = 0.4;

// Map track numbers to specific dragon ball models
const DRAGON_BALL_OBJECTS = [
  "Ball_14",   // Index 0: ONE_STAR (track-1)
  "BALL_2_8",   // Index 1: TWO_STAR (track-2)
  "BALL_2001_10",   // Index 2: THREE_STAR (track-3)
  "Ball001_2",    // Index 3: FOUR_STAR (track-4)
  "BALL_2002_12",// Index 4: FIVE_STAR (track-5)
  "Ball002_4",// Index 5: SIX_STAR (track-6)
  "Ball003_6"      // Index 6: SEVEN_STAR (track-7)
];


const DragonBallModel = memo(({ trackId }) => {
  const { scene } = useGLTF("/models/the_7_dragon_balls/scene.gltf");
  const { angle } = useSelector(state => selectTrackById(state, trackId));
  
  // Get the correct dragon ball based on track number
  const clonedBall = useMemo(() => {
    if (!scene) return null;
    
    // Extract track number from ID (track-1 -> 1, track-2 -> 2, etc.)
    const trackNumber = parseInt(trackId.split("-")[1], 10);
    console.log("trackNumber", trackNumber)
    // Adjust for zero-based index and ensure valid range
    const ballIndex = Math.max(0, (trackNumber - 1) % DRAGON_BALL_OBJECTS.length);
    console.log("ballIndex", ballIndex);
    const originalBall = scene.getObjectByName(DRAGON_BALL_OBJECTS[ballIndex]);
    if (!originalBall) return null;

    const clone = originalBall.clone();
    
    // Reset transformations
    clone.rotation.set(0, 0, 0);
    clone.position.set(0, 0, 0);
    // Set emissive properties
    clone.traverse((child) => {
      if (child.material) {
        child.material.emissive = EMISSIVE_COLOR.clone();
        child.material.emissiveIntensity = 1;
      }
    });

    return clone;
  }, [scene, trackId]);

  // Position calculation based on angle
  const position = useMemo(() => {
    return new THREE.Vector3(
      DISTANCE_FROM_ORIGIN * Math.cos(-angle),
      DISTANCE_FROM_ORIGIN * Math.sin(-angle),
      0
    );
  }, [angle]);

  if (!clonedBall) return null;

  return (
    <primitive 
      object={clonedBall} 
      position={position}
      scale={MODEL_SCALE}
      rotation={[Math.PI / 2, 0, 0]}
    />
  );
}, (prevProps, nextProps) => prevProps.trackId === nextProps.trackId);

DragonBallModel.displayName = 'DragonBallModel';
export default DragonBallModel;