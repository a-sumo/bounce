import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTrackAngleAndRadius } from "@/redux/audioSlice";
import "./Sliders.css";

const Sliders = ({ trackId }) => {
  const dispatch = useDispatch();
  const { angle = 0, radius = 3 } = useSelector((state) => state.audio.tracks[trackId]) || {};
  
  // Convert the initial angle to degrees (positive for display)
  const [localAngle, setLocalAngle] = useState(angle * 180 / Math.PI);
  const [localRadius, setLocalRadius] = useState(radius);

  const maxRadius = 3;

  const handleAngleChange = (event) => {
    const newAngle = parseFloat(event.target.value);
    setLocalAngle(newAngle);
    // Invert the angle when dispatching to make it counter-clockwise
    const invertedAngle = (-newAngle * Math.PI / 180) % (2 * Math.PI);
    dispatch(setTrackAngleAndRadius({ 
      trackId, 
      angle: invertedAngle, 
      radius 
    }));
  };

  const handleRadiusChange = (event) => {
    const newRadius = Math.min(parseFloat(event.target.value), maxRadius);
    setLocalRadius(newRadius);
    // Use the inverted angle when dispatching radius changes as well
    const invertedAngle = (-localAngle * Math.PI / 180) % (2 * Math.PI);
    dispatch(setTrackAngleAndRadius({ 
      trackId, 
      angle: invertedAngle, 
      radius: newRadius 
    }));
  };

  return (
    <div className="sliders-container">
      <div className="slider-group">
        <label htmlFor={`angle-${trackId}`}>Angle:</label>
        <input
          type="range"
          id={`angle-${trackId}`}
          min="0"
          max="360"
          step="0.1"
          value={localAngle}
          onChange={handleAngleChange}
        />
        <span>{localAngle.toFixed(0)}°</span>
      </div>
      <div className="slider-group">
        <label htmlFor={`radius-${trackId}`}>Radius:</label>
        <input
          type="range"
          id={`radius-${trackId}`}
          min="0"
          max={maxRadius}
          step="0.1"
          value={localRadius}
          onChange={handleRadiusChange}
        />
        <span>{localRadius.toFixed(0)}</span>
      </div>
    </div>
  );
};

export default Sliders;
