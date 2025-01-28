// components/radar/RadarVisualization.jsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useSelector } from "react-redux";

export default function RadarVisualization({
  targetCenter,
  targetRadius,
  emissiveMapRef,
}) {
  const tracks = useSelector((state) => state.audio.tracks);
  const canvasRef = useRef(null);
  const textureRef = useRef(null);

  const computeAveragePosition = (tracks) => {
    let totalX = 0;
    let totalY = 0;
    let totalWeight = 0;

    Object.values(tracks).forEach(({ rms, radius, angle }) => {
      // Weight is the product of RMS and radius
      const weight = rms * radius;
      // Add weighted vector components
      totalX += weight * Math.cos(angle);
      totalY += weight * Math.sin(angle);
      totalWeight += weight;
    });

    if (totalWeight === 0) return { x: 0, y: 0, magnitude: 0 };

    const angle = Math.atan2(totalY, totalX);

    // Cap the magnitude to ensure it stays within the grid
    const MAX_MAGNITUDE = 1.3; // Adjust based on your grid size
    const magnitude = Math.min(
      MAX_MAGNITUDE,
      Math.sqrt(totalX * totalX + totalY * totalY)
    );

    return {
      x: Math.cos(angle) * magnitude,
      y: Math.sin(angle) * magnitude,
      magnitude
    };
  };

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

    const animate = () => {
      // Clear background
      ctx.fillStyle = "#00b02c";
      ctx.fillRect(0, 0, 1024, 1024);

      // Main boundary circle
      ctx.beginPath();
      ctx.arc(targetCenter.x, targetCenter.y, targetRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#00b02c";
      ctx.fill();

      // Draw square grid
      ctx.strokeStyle = "#005014";
      ctx.lineWidth = 2;
      const gridSize = (targetRadius * 2) / 16;

      // Vertical lines
      for (let x = -8; x <= 8; x++) {
        const xPos = targetCenter.x + x * gridSize;
        ctx.beginPath();
        ctx.moveTo(xPos, targetCenter.y - targetRadius);
        ctx.lineTo(xPos, targetCenter.y + targetRadius);
        ctx.stroke();
      }
      // Horizontal lines
      for (let y = -8; y <= 8; y++) {
        const yPos = targetCenter.y + y * gridSize;
        ctx.beginPath();
        ctx.moveTo(targetCenter.x - targetRadius, yPos);
        ctx.lineTo(targetCenter.x + targetRadius, yPos);
        ctx.stroke();
      }

      // Draw each track
      Object.entries(tracks).forEach(([trackId, { rms, radius, angle }]) => {
        // The amplitude we use to move the indicator
        const amplitude = rms * radius;

        // We'll place the track in the center + (amplitude * cos(angle), amplitude * sin(angle))
        const vx =
          virtualSize / 2 + amplitude * (virtualSize / 4) * Math.cos(angle);
        const vy =
          virtualSize / 2 + amplitude * (virtualSize / 4) * Math.sin(angle);

        const [x, y] = transformer.transform(vx, vy);
        const pointRadius = transformer.transformRadius(2);
        const color = "#ffff00";

        // Glow effect
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

        // Draw center dot
        ctx.beginPath();
        ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
      // Compute average position
      const avgPos = computeAveragePosition(tracks);

      // Convert to virtual coordinates
      const vx =
        virtualSize / 2 + avgPos.magnitude * (virtualSize / 4) * avgPos.x;
      const vy =
        virtualSize / 2 + avgPos.magnitude * (virtualSize / 4) * avgPos.y;

      // Transform to canvas coordinates
      const [x, y] = transformer.transform(vx, vy);
      const pointRadius = transformer.transformRadius(3); // Slightly larger than before
      const color = "#ffff00";

      // Draw average position indicator
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, pointRadius * 3);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.1, color);
      gradient.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(x, y, pointRadius * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Update the texture
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
