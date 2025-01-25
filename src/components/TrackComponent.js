// src/components/TrackComponent.js
import React, { useEffect } from 'react';
import TrackControls from './TrackControls';
import useTrackAnalyzer from '../hooks/useTrackAnalyzer';

const TrackComponent = ({ index, track, audioRef, onFileChange, onRemove, onUpdate }) => {
  useTrackAnalyzer(audioRef, (intensity) => {
    onUpdate(index, { intensity });
  });

  return (
    <div className="track-control-group">
      <TrackControls
        index={index}
        track={track}
        onFileChange={onFileChange}
        onRemove={onRemove}
      />
    </div>
  );
};

export default TrackComponent;