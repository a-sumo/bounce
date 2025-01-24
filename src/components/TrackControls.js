import React from 'react';
import { FaTimes } from 'react-icons/fa';

const TrackControls = ({ index, track, onFileChange, onRemove }) => (
  <div className="track-control">
    <input
      type="file"
      accept="audio/*"
      onChange={onFileChange}
      id={`file-input-${index}`}
      className="file-input"
    />
    <label htmlFor={`file-input-${index}`} className="file-label">
      <span className={track.fileName ? 'loaded' : ''}>
        {track.fileName || `Load Track ${index + 1}`}
      </span>
      <button onClick={onRemove} className="remove-track">
        <FaTimes />
      </button>
    </label>
  </div>
);

export default TrackControls;