import { memo, useMemo, useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { MeshTransmissionMaterial } from './MeshTransmissionMaterial'
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { selectTrackById } from "@/redux/selectors";
import { useSelector } from "react-redux";

const EMISSIVE_COLOR = new THREE.Color(1, 0, 0);
const MODEL_SCALE = 0.1;
const DISTANCE_FROM_ORIGIN = 0.48;

const DRAGON_BALL_OBJECTS = [
  "Ball_14", "BALL_2_8", "BALL_2001_10", "Ball001_2",
  "BALL_2002_12", "Ball002_4", "Ball003_6"
];

const DragonBallModel = memo(({ trackId }) => {
  const { scene } = useGLTF("/models/the_7_dragon_balls/scene.gltf");
  const { angle } = useSelector(state => selectTrackById(state, trackId));
  const ballRef = useRef();
  const prevAngleRef = useRef(angle);
  const currentAngleRef = useRef(angle);

  // Update current angle when Redux store changes
  useEffect(() => {
    currentAngleRef.current = angle;
  }, [angle]);

  const clonedBall = useMemo(() => {
    if (!scene) return null;

    const trackNumber = parseInt(trackId.split("-")[1], 10);
    const ballIndex = Math.max(0, (trackNumber - 1) % DRAGON_BALL_OBJECTS.length);
    const originalBall = scene.getObjectByName(DRAGON_BALL_OBJECTS[ballIndex]);
    if (!originalBall) return null;

    const clone = originalBall.clone();
    const bbox = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    bbox.getSize(size);

    // Store radius in userData for rotation calculations
    clone.userData.radius = (Math.max(size.x, size.y, size.z) / 2) * MODEL_SCALE;

    clone.rotation.set(0, 0, 0);
    clone.position.set(0, 0, 0);
    clone.traverse((child) => {
      if (child.material) {
        const parentName = child.parent?.name || "";
        if (parentName.startsWith("Icosphere")) {
          // Assign a glossy red material for stars
          child.material = new THREE.MeshStandardMaterial({
            color: 0xeb3434,
            emissive: 0xeb3434 });
        } else {
          child.scale.set(0.97, 0.97, 0.97);
          // Assign a glossy crystal-like material for the dragon ball
          child.material =  Object.assign(new MeshTransmissionMaterial(10), 
          {
            diffuseColor: 0xeb3434,
            clearcoat: 1,
            clearcoatRoughness: 0,
            transmission: 1,
            chromaticAberration: 0.03,
            anisotrophicBlur: 0.1,
            // Set to > 0 for diffuse roughness
            roughness: 0,
            thickness: 4.5,
            ior: 1.8,
          });
          child.material.color = new THREE.Color("#ff5e00");
        }
      }
    });

    return clone;
  }, [scene, trackId]);

  // Calculate position based on current angle
  const position = useMemo(() => {
    return new THREE.Vector3(
      DISTANCE_FROM_ORIGIN * Math.cos(angle),
      0.2 * MODEL_SCALE,
      DISTANCE_FROM_ORIGIN * Math.sin(angle)
    );
  }, [angle]);

  // Frame-based rotation update
  useFrame(() => {
    if (!ballRef.current) return;
    const currentAngle = currentAngleRef.current;
    const deltaAngle = currentAngle - prevAngleRef.current;
    prevAngleRef.current = currentAngle;
    if (Math.abs(deltaAngle) < 0.0001) return;

    // Calculate rotation parameters
    const orbitRadius = DISTANCE_FROM_ORIGIN;
    const ballRadius = ballRef.current.userData.radius * 2;
    const distance = deltaAngle * orbitRadius;
    const rotationAngle = distance / ballRadius;

    // Calculate direction and rotation axis
    const direction = new THREE.Vector3(
      -Math.sin(currentAngle),
      0,
      Math.cos(currentAngle)
    ).normalize();
    const axis = new THREE.Vector3(direction.z, 0, -direction.x).normalize();

    // Apply rotation to the ball
    ballRef.current.rotateOnWorldAxis(axis, rotationAngle);
  });

  if (!clonedBall) return null;

  return (
    <primitive
      ref={ballRef}
      object={clonedBall}
      position={position}
      scale={MODEL_SCALE}
    />
  );
}, (prevProps, nextProps) => prevProps.trackId === nextProps.trackId);

DragonBallModel.displayName = 'DragonBallModel';
export default DragonBallModel;