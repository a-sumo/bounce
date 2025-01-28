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

  // Create canvas once, outside of the effect
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
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !textureRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Set up coordinate transformer
    const virtualSize = 100;
    const transformer = {
      transform: (x, y) => [
        targetCenter.x +
          ((x * (targetRadius * 2)) / virtualSize - targetRadius),
        targetCenter.y +
          ((y * (targetRadius * 2)) / virtualSize - targetRadius),
      ],
      transformRadius: (r) => (r * (targetRadius * 2)) / virtualSize,
    };

    let animationFrameId;

    const animate = () => {
      // Clear background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 1024, 1024);

      // Main boundary circle
      ctx.beginPath();
      ctx.arc(targetCenter.x, targetCenter.y, targetRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#00b02c";
      ctx.fill();

      // Draw grid lines
      ctx.strokeStyle = "#005014";
      ctx.lineWidth = 2;

      // Draw concentric circles
      const numCircles = 4;
      for (let i = 1; i <= numCircles; i++) {
        ctx.beginPath();
        ctx.arc(
          targetCenter.x,
          targetCenter.y,
          (targetRadius / numCircles) * i,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      // Draw radial lines
      const numLines = 12;
      for (let i = 0; i < numLines; i++) {
        const angle = (i * Math.PI * 2) / numLines;
        ctx.beginPath();
        ctx.moveTo(targetCenter.x, targetCenter.y);
        ctx.lineTo(
          targetCenter.x + Math.cos(angle) * targetRadius,
          targetCenter.y + Math.sin(angle) * targetRadius
        );
        ctx.stroke();
      }

      // Draw each track's circle
      Object.entries(tracks).forEach(([trackId, { yPos }]) => {
        const virtualY = virtualSize / 2 + yPos * (virtualSize / 4) * 2;
        const radius = transformer.transformRadius(5);
        const color = trackId === "track-1" ? "#ffff00" : "#ffffff";
        const [x, y] = transformer.transform(virtualSize / 2, virtualY);

        // Add glow effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.4, color);
        gradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw center dot
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // Update the texture
      textureRef.current.needsUpdate = true;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [tracks, targetCenter, targetRadius]);

  // This is purely a 3D overlay mechanism through the parent.
  // No actual DOM return is needed here.
  return null;
}
