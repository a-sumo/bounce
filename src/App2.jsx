import { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { FaPlay, FaPause } from 'react-icons/fa';

export default function App() {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize Wavesurfer
  useEffect(() => {
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#ff5501',
      progressColor: '#d44700',
      height: 80,
      responsive: true,
    });

    wavesurfer.load('/audio/drum-loop.mp3');

    wavesurfer.on('ready', () => {
      console.log('Audio loaded');
    });

    wavesurfer.on('finish', () => {
      setIsPlaying(false);
    });

    wavesurferRef.current = wavesurfer;

    return () => wavesurfer.destroy();
  }, []);

  const handlePlayPause = async () => {
    if (!wavesurferRef.current) return;
    
    // Handle audio context resume on first interaction
    const backend = wavesurferRef.current.backend;
    if (backend && backend.ac && backend.ac.state === 'suspended') {
      await backend.ac.resume();
    }

    wavesurferRef.current.playPause();
    setIsPlaying(prev => !prev);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
      <div ref={waveformRef} />
      <button 
        onClick={handlePlayPause}
        style={{ 
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          fontSize: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: '200px',
          textAlign: 'center'
        }}
      >
        {isPlaying ? <FaPause /> : <FaPlay />}
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}