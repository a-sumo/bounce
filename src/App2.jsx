import { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { FaPlay, FaPause } from 'react-icons/fa';

const AudioTrack = ({ url }) => {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#ff5501',
      progressColor: '#d44700',
      height: 80,
      responsive: true,
    });

    wavesurfer.load(url);

    wavesurfer.on('ready', () => {
      console.log('Audio loaded:', url);
    });

    wavesurfer.on('finish', () => {
      setIsPlaying(false);
    });

    wavesurferRef.current = wavesurfer;

    return () => wavesurfer.destroy();
  }, [url]);

  const handlePlayPause = async () => {
    if (!wavesurferRef.current) return;
    
    const backend = wavesurferRef.current.backend;
    if (backend && backend.ac && backend.ac.state === 'suspended') {
      await backend.ac.resume();
    }

    wavesurferRef.current.playPause();
    setIsPlaying(prev => !prev);
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div ref={waveformRef} />
      <button 
        onClick={handlePlayPause}
        style={{ 
          marginTop: '0.5rem',
          padding: '0.5rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: '200px'
        }}
      >
        {isPlaying ? <FaPause /> : <FaPlay />}
        {url.split('/').pop()} - {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};

export default function App() {
  const tracks = [
    '/audio/drum-loop.mp3',
    '/audio/drum-loop.mp3',
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Multi-Track Player</h1>
      {tracks.map((trackUrl, index) => (
        <AudioTrack key={index} url={trackUrl} />
      ))}
    </div>
  );
}