import { useState, useRef } from "react";
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

  const CIRCLE_RADIUS = 250;
  const CENTER = { x: 256, y: 256 };

  const handlePointerDown = (index, e) => {
    setDraggingIndex(index);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (draggingIndex === -1) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - CENTER.x;
    const y = e.clientY - rect.top - CENTER.y;

    const angle = Math.atan2(y, x);
    onUpdateTrack(draggingIndex, { angle });
  };

  const handlePointerUp = () => {
    setDraggingIndex(-1);
  };


  const renderTrack = (track, index) => {
    const outerPos = {
      x: CENTER.x + Math.cos(track.angle) * CIRCLE_RADIUS,
      y: CENTER.y + Math.sin(track.angle) * CIRCLE_RADIUS,
    };

    const innerPos = {
      x: CENTER.x + (outerPos.x - CENTER.x) * track.intensity * 1,
      y: CENTER.y + (outerPos.y - CENTER.y) * track.intensity * 1,
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
          cx={innerPos.x}
          cy={innerPos.y}
          r="8"
        />

        <circle
          cx={outerPos.x}
          cy={outerPos.y}
          r="15"
          onPointerDown={(e) => handlePointerDown(index, e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onMouseEnter={() => setHoverIndex(index)}
          onMouseLeave={() => setHoverIndex(-1)}
        />
        
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
              }}
            >
              <FaTimes size={12} color="white" />
            </button>
          </foreignObject>
        )}
      </g>
    );
  };

  return (
    <div className="interface-container" ref={containerRef}>
      <svg
        width="512"
        height="512"
        viewBox="0 0 512 512"
      >
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={CIRCLE_RADIUS}
          fill="none"
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
