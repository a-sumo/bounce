// components/radar/RadarVisualization.jsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useSelector } from "react-redux";

const drawArrow = (ctx, centerX, centerY, radius, angle) => {
  const arrowSize = radius * 0.5;
  const scaleFactor = arrowSize / 105; // SVG original height was 105

  // Barycenter (centroid) of the original arrow path coordinates
  const originalBarycenterX = 20.54545;
  const originalBarycenterY = 27.14285;
  
  // Adjust barycenter for scaling
  const scaledBarycenterX = originalBarycenterX * scaleFactor;
  const scaledBarycenterY = originalBarycenterY * scaleFactor;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angle + Math.PI / 2);
  ctx.translate(-scaledBarycenterX, -scaledBarycenterY);

  // Draw scaled arrow path
  ctx.fillStyle = "#FF0000";
  ctx.beginPath();
  ctx.moveTo(21.0909 * scaleFactor, 0);
  ctx.lineTo(0, 40 * scaleFactor);
  ctx.lineTo(21.0909 * scaleFactor, 28.5714 * scaleFactor);
  ctx.lineTo(40 * scaleFactor, 40 * scaleFactor);
  ctx.lineTo(21.0909 * scaleFactor, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

// Helper function for smooth angle interpolation
const lerpAngle = (current, target, factor) => {
  const delta =
    (((target - current + Math.PI) % (Math.PI * 2)) - Math.PI) * factor;
  return current + delta;
};

// Compute the average direction vector based on tracks' rms and angle
const computeAvgDirection = (tracks) => {
  let totalX = 0;
  let totalY = 0;
  let totalWeight = 0;

  Object.values(tracks).forEach(({ rms, angle }) => {
    const weight = rms;
    totalX += weight * Math.cos(angle);
    totalY += weight * Math.sin(angle);
    totalWeight += weight;
  });

  if (totalWeight === 0) return null;

  // Normalize the direction vector
  const avgX = totalX / totalWeight;
  const avgY = totalY / totalWeight;

  // Convert back to angle and magnitude
  const avgAngle = Math.atan2(avgY, avgX);
  const avgMagnitude = Math.sqrt(avgX * avgX + avgY * avgY);

  return { angle: avgAngle, magnitude: avgMagnitude };
};

export default function RadarVisualization({
  targetCenter,
  targetRadius,
  emissiveMapRef,
}) {
  const tracks = useSelector((state) => state.audio.tracks);
  const canvasRef = useRef(null);
  const textureRef = useRef(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    canvasRef.current = canvas;

    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.colorSpace = THREE.SRGBColorSpace;
    textureRef.current = canvasTexture;
    emissiveMapRef.current = canvasTexture;

    return () => {
      canvasTexture.dispose();
    };
  }, [emissiveMapRef]);

  useEffect(() => {
    if (!canvasRef.current || !textureRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // We assume a virtual "100 x 100" area that maps into the circle
    const virtualSize = 100;
    const transformer = {
      transform: (vx, vy) => [
        targetCenter.x +
          ((vx * (targetRadius * 2)) / virtualSize - targetRadius),
        targetCenter.y +
          ((vy * (targetRadius * 2)) / virtualSize - targetRadius),
      ],
      transformRadius: (r) => (r * (targetRadius * 2)) / virtualSize,
    };

    let animationFrameId;
    let currentArrowAngle = 0;

    const animate = () => {
      // Clear background
      ctx.fillStyle = "#00b02c";
      ctx.fillRect(0, 0, 1024, 1024);

      // // Main boundary circle
      // ctx.beginPath();
      // ctx.arc(targetCenter.x, targetCenter.y, targetRadius, 0, Math.PI * 2);
      // ctx.fillStyle = "#00b02c";
      // ctx.fill();

      // Draw square grid
      ctx.strokeStyle = "#005014";
      ctx.lineWidth = 2;
      const gridSize = (targetRadius * 2) / 16;

      for (let x = -8; x <= 8; x++) {
        const xPos = targetCenter.x + x * gridSize;
        ctx.beginPath();
        ctx.moveTo(xPos, targetCenter.y - targetRadius);
        ctx.lineTo(xPos, targetCenter.y + targetRadius);
        ctx.stroke();
      }

      for (let y = -8; y <= 8; y++) {
        const yPos = targetCenter.y + y * gridSize;
        ctx.beginPath();
        ctx.moveTo(targetCenter.x - targetRadius, yPos);
        ctx.lineTo(targetCenter.x + targetRadius, yPos);
        ctx.stroke();
      }

      Object.entries(tracks).forEach(([trackId, { rms, radius, angle }]) => {
        const amplitude = rms * radius;

        const vx =
          virtualSize / 2 + amplitude * (virtualSize / 4) * Math.cos(angle);
        const vy =
          virtualSize / 2 + amplitude * (virtualSize / 4) * Math.sin(angle);

        const [x, y] = transformer.transform(vx, vy);
        const pointRadius = transformer.transformRadius(2);
        const color = "#ffff00";

        const gradient = ctx.createRadialGradient(
          x,
          y,
          0,
          x,
          y,
          pointRadius * 2
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.1, color);
        gradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.arc(x, y, pointRadius * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      const avgDirection = computeAvgDirection(tracks);

      if (avgDirection) {
        const { angle: targetAngle } = avgDirection;

        currentArrowAngle = lerpAngle(currentArrowAngle, targetAngle, 1);

        drawArrow(
          ctx,
          targetCenter.x,
          targetCenter.y,
          targetRadius * 0.8,
          currentArrowAngle
        );
      }
      else {
      drawArrow(
        ctx,
        targetCenter.x,
        targetCenter.y,
        targetRadius * 0.8,
        0
      );
      }

      textureRef.current.needsUpdate = true;

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [tracks, targetCenter, targetRadius]);

  return null; // nothing to render in DOM
}
