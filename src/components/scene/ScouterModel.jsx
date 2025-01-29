import { useGLTF } from "@react-three/drei";
import { useEffect, useState } from "react";


const ScouterModel = () => {
  const { scene } = useGLTF("/models/scouter/scene.gltf");
  const [selectedObject, setSelectedObject] = useState(null);

  useEffect(() => {
    if (scene) {
      setSelectedObject(scene);
    }

    return () => {
      if (selectedObject) {
        selectedObject.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
      }
    };
  }, [scene]);

  return (
    <>
      {selectedObject && (
        <primitive object={selectedObject} scale={0.1} position={[1, -0.27, 0]} />
      )}
    </>
  );
};

export default ScouterModel;
