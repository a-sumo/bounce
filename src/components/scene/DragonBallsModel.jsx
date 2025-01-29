import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { selectTrackById } from "@/redux/selectors";

const EMISSIVE_COLOR = new THREE.Color(1, 0, 0); // Full green

// Helper function to get dragon ball data by index (1-7)
const getDragonBallByIndex = (index) => {
  const ballKey = Object.keys(DRAGON_BALLS)[index - 1];
  return DRAGON_BALLS[ballKey];
};

const DRAGON_BALLS = {
  ONE_STAR: { stars: 1, objectName: "Ball001_2" },
  TWO_STAR: { stars: 2, objectName: "Ball002_4" },
  THREE_STAR: { stars: 3, objectName: "Ball003_6" },
  FOUR_STAR: { stars: 4, objectName: "BALL_2_8" },
  FIVE_STAR: { stars: 5, objectName: "BALL_2001_10" },
  SIX_STAR: { stars: 6, objectName: "BALL_2002_12" },
  SEVEN_STAR: { stars: 7, objectName: "Ball_14" },
};

const DragonBallsModel = ({ trackId, emissiveIntensity = 10 }) => {
  const { scene } = useGLTF("/models/the_7_dragon_balls/scene.gltf");
  const groupRef = useRef();

  // Fetch track data using memoized selector
  const track = useSelector(selectTrackById(trackId));
  const { angle = 0, radius = 5 } = track || {}; // Default values to prevent undefined errors

  useEffect(() => {
    if (!scene) return;

    // Get the dragon ball object based on trackId
    const dragonBall = getDragonBallByIndex(parseInt(trackId.split("-")[1], 10)); // Extract numeric index
    if (!dragonBall) return;

    const ball = scene.getObjectByName(dragonBall.objectName);
    if (!ball) {
      console.error(`Dragon ball not found for trackId: ${trackId}`);
      return;
    }

    // Clone the ball for display
    const clonedBall = ball.clone();
    groupRef.current.add(clonedBall);

    // Set emissive properties
    clonedBall.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.emissive = EMISSIVE_COLOR;
        child.material.emissiveIntensity = emissiveIntensity;
      }
    });

    return () => {
      // Clean up resources when the component unmounts
      clonedBall.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    };
  }, [scene, trackId, emissiveIntensity]);

  // Calculate position on the circle
  const calculatePosition = (radius, angle) => {
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    return [x, 0, z]; // y is 0 to keep it on the ground plane
  };

  const position = calculatePosition(radius, angle);

  // Smooth rotation around the Z-axis
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += delta; // Rotate around the Z-axis
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* The cloned ball will be added dynamically */}
    </group>
  );
};

export default DragonBallsModel;