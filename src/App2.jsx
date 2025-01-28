import { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { FaPlay, FaPause } from 'react-icons/fa';
import { createEssentiaNode } from './essentia-rms/EssentiaNodeFactory';

const AudioTrack = ({ url }) => {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const essentiaNodeRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rmsLevel, setRmsLevel] = useState(-Infinity);

  useEffect(() => {
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#ff5501',
      progressColor: '#d44700',
      height: 80,
      responsive: true,
    });

    wavesurfer.load(url);

    wavesurfer.on('ready', async () => {
      console.log('Audio loaded:', url);
      
      // Create and connect Essentia node when audio is ready
      if (wavesurfer.backend && wavesurfer.backend.ac) {
        try {
          const essentiaNode = await createEssentiaNode(wavesurfer.backend.ac);
          
          // Connect the Essentia node to the audio graph
          wavesurfer.backend.setFilter(essentiaNode);
          
          // Listen for RMS updates
          essentiaNode.port.onmessage = (event) => {
            if (event.data.rms !== undefined) {
              setRmsLevel(20 * Math.log10(event.data.rms)); // Convert to dB
            }
          };

          essentiaNodeRef.current = essentiaNode;
        } catch (error) {
          console.error('Failed to create Essentia node:', error);
        }
      }
    });

    wavesurfer.on('finish', () => {
      setIsPlaying(false);
    });

    wavesurferRef.current = wavesurfer;

    return () => {
      if (essentiaNodeRef.current) {
        wavesurfer.backend.setFilter(null);
        essentiaNodeRef.current.disconnect();
      }
      wavesurfer.destroy();
    };
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
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        marginTop: '0.5rem' 
      }}>
        <button 
          onClick={handlePlayPause}
          style={{ 
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
        <div style={{ 
          minWidth: '120px',
          fontFamily: 'monospace',
          fontSize: '14px'
        }}>
          RMS: {rmsLevel === -Infinity ? '-∞' : rmsLevel.toFixed(1)} dB
        </div>
      </div>
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
