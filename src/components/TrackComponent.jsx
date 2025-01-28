// src/components/TrackComponent.js
import { useCallback } from 'react';
import TrackControls from './TrackControls';
import useTrackAnalyzer from '@/hooks/useTrackAnalyzer';

const TrackComponent = ({ index, track, audioRef, onFileChange, onRemove, onUpdate }) => {
  const onAnalysis = useCallback(
    (intensity) => {
      onUpdate(index, { intensity });
    },
    [onUpdate, index]
  );

  useTrackAnalyzer(audioRef, onAnalysis);

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