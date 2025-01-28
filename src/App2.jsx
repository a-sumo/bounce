import { useRef } from 'react';
import Scene from '@/components/Scene';
import AudioTrack from '@/components/audio/AudioTrack';
import './App2.css';

export default function App() {
  const trackIds = useRef([]);
  
  const tracks = [
    { id: 'track-1', url: '/audio/drum-loop.mp3' },
    { id: 'track-2', url: '/audio/drum-loop.mp3' },
  ];

  // Generate stable IDs
  trackIds.current = tracks.map(t => t.id);

  return (
    <div className="app-container">
      <div className="scene-section">
        <Scene />
      </div>
      
      <div className="player-section">
        <div className="tracks-container">
          {tracks.map((track) => (
            <div key={track.id} className="track-item">
              <AudioTrack trackId={track.id} url={track.url} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}