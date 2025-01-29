import { useGLTF, DragControls } from "@react-three/drei";
import { useEffect, useState } from "react";
import * as THREE from "three";

const EMISSIVE_COLOR = new THREE.Color(0, 1, 0); // Full red

// Helper function to get dragon ball data by index (1-7)
const getDragonBallByIndex = (index) => {
  const ballKey = Object.keys(DRAGON_BALLS)[index - 1];
  return DRAGON_BALLS[ballKey];
};

const DRAGON_BALLS = {
  ONE_STAR: {
    stars: 1,
    objectName: "Ball001_2",
  },
  TWO_STAR: {
    stars: 2,
    objectName: "Ball002_4",
  },
  THREE_STAR: {
    stars: 3,
    objectName: "Ball003_6",
  },
  FOUR_STAR: {
    stars: 4,
    objectName: "BALL_2_8",
  },
  FIVE_STAR: {
    stars: 5,
    objectName: "BALL_2001_10",
  },
  SIX_STAR: {
    stars: 6,
    objectName: "BALL_2002_12",
  },
  SEVEN_STAR: {
    stars: 7,
    objectName: "Ball_14",
  },
};

const DragonBallsModel = ({ ballIndex = 1, emissiveIntensity = 1 }) => {
  const { scene } = useGLTF("/models/the_7_dragon_balls/scene.gltf");
  const [selectedObject, setSelectedObject] = useState(null);

  useEffect(() => {
    if (scene) {
      // Get the dragon ball data for the specified index
      const dragonBall = getDragonBallByIndex(ballIndex);
      if (!dragonBall) return;

      // Find the ball object
      const ball = scene.getObjectByName(dragonBall.objectName);
      if (!ball) return;

      // Find the Object_ child
      const icosphereChild = ball.children.find(
        (child) => child.name && child.name.startsWith("Icosphere")
      );
      console.log("icosphereChild",icosphereChild)

      if (icosphereChild) {
        // Find the Icosphere child
        const objectChild = icosphereChild.children.find(
          (child) => child.name && child.name.startsWith("Object_")
        );
        console.log("objectChild ", objectChild )
        if (objectChild && objectChild.children.length > 0) {
          // Get the first child of the Icosphere and set its emissive properties
          const emissiveObject = objectChild.children[0];
          if (emissiveObject.material) {
            emissiveObject.material.emissive = EMISSIVE_COLOR;
            emissiveObject.material.emissiveIntensity = emissiveIntensity;
            console.log(`Set emissive properties for ${emissiveObject.name}`);
          }
        }
      }

      // Clone the ball for display
      const clonedBall = ball.clone();
      console.log("clonedBall",clonedBall);
      setSelectedObject(clonedBall);
    }

    return () => {
      if (selectedObject) {
        selectedObject.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
      }
    };
  }, [scene, ballIndex, emissiveIntensity]);

  return (
    <>
      {selectedObject && (
        <DragControls>
        <primitive object={selectedObject} scale={0.05} position={[0, 0, 0]} />
        </DragControls>
      )}
    </>
  );
};

export default DragonBallsModel;
