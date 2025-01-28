import AudioTrack from '@/components/audio/AudioTrack';
import Scene from '@/components/Scene';
import './App2.css';

export default function App() {
  const tracks = [
    '/audio/drum-loop.mp3',
    '/audio/drum-loop.mp3',
  ];

  return (
    <div className="app-container">
      <div className="scene-section">
        <Scene />
      </div>
      
      <div className="player-section">
        <div className="tracks-container">
          {tracks.map((trackUrl, index) => (
            <div key={index} className="track-item">
              <AudioTrack url={trackUrl} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}