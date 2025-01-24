import React, { useState, useRef, useEffect } from "react";
import { Pane } from "tweakpane";
import { FaPlus, FaTimes } from "react-icons/fa";

const CircularInterface = ({
  tracks,
  onAddTrack,
  onUpdateTrack,
  onRemoveTrack,
}) => {
  const [draggingIndex, setDraggingIndex] = useState(-1);
  const [hoverIndex, setHoverIndex] = useState(-1);
  const containerRef = useRef(null);
  const paneRef = useRef(null);
  const CIRCLE_RADIUS = 250;
  const CENTER = { x: 256, y: 256 };
  // Track dragging logic
  const handlePointerDown = (index, e) => {
    setDraggingIndex(index);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (draggingIndex === -1) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - CENTER.x;
    const y = e.clientY - rect.top - CENTER.y;

    // Calculate angle while maintaining fixed radius
    const angle = Math.atan2(y, x);
    onUpdateTrack(draggingIndex, { angle });
  };

  const handlePointerUp = () => {
    setDraggingIndex(-1);
  };
  // Add Tweakpane controls
  useEffect(() => {
    const pane = new Pane({ container: paneRef.current });
    tracks.forEach((track, index) => {
      const folder = pane.addFolder({ title: `Track ${index + 1}` });
      folder
        .addBinding(track, "debugAngle", {
          min: 0,
          max: 360,
          step: 1,
        })
        .on("change", (ev) => {
          onUpdateTrack(index, {
            angle: (ev.value * Math.PI) / 180,
            debugAngle: ev.value,
          });
        });
    });
    return () => pane.dispose();
  }, [tracks, onUpdateTrack]);

  // Track rendering with delete button
  const renderTrack = (track, index) => {
    const intensityRadius = track.intensity * CIRCLE_RADIUS;
    const outerPos = {
      x: CENTER.x + Math.cos(track.angle) * CIRCLE_RADIUS,
      y: CENTER.y + Math.sin(track.angle) * CIRCLE_RADIUS,
    };

    return (
      <g key={index}>
        <line
          x1={CENTER.x}
          y1={CENTER.y}
          x2={outerPos.x}
          y2={outerPos.y}
          stroke="#666"
          strokeWidth="2"
        />
        <circle
          cx={outerPos.x}
          cy={outerPos.y}
          r="15"
          fill={draggingIndex === index ? "#00ccff" : "#0088ff"}
          onPointerDown={(e) => handlePointerDown(index, e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onMouseEnter={() => setHoverIndex(index)}
          onMouseLeave={() => setHoverIndex(-1)}
          style={{ cursor: "pointer" }}
        >
          {hoverIndex === index && (
            <foreignObject
              x={outerPos.x - 12}
              y={outerPos.y - 12}
              width={24}
              height={24}
            >
              <button
                className="track-delete-button"
                onClick={() => onRemoveTrack(index)}
                style={{
                  background: "#ff4444",
                  border: "none",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <FaTimes size={12} color="white" />
              </button>
            </foreignObject>
          )}
        </circle>
      </g>
    );
  };

  return (
    <div className="interface-container" ref={containerRef}>
      <div ref={paneRef} className="tweakpane-container"></div>
      <svg
        width="512"
        height="512"
        viewBox="0 0 512 512"
        style={{ touchAction: "none" }}
      >
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={CIRCLE_RADIUS}
          fill="none"
          stroke="#333"
          strokeWidth="4"
        />
        {tracks.map(renderTrack)}
        <foreignObject
          x={CENTER.x - 30}
          y={CENTER.y - 30}
          width={60}
          height={60}
        >
          <button
            className="add-track-button"
            onClick={onAddTrack}
            disabled={tracks.length >= 2}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "#0088ff",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaPlus size={24} color="white" />
          </button>
        </foreignObject>
      </svg>
    </div>
  );
};

export default CircularInterface;