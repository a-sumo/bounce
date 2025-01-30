import { useState, useEffect, useRef } from 'react';

const AudioAnalyzer = ({ audioUrl }) => {
  const [level, setLevel] = useState(-Infinity);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const analyzerRef = useRef(null);
  const audioElementRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const initAudio = async () => {
      try {
        // Create audio context
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create analyzer node
        analyzerRef.current = audioContextRef.current.createAnalyser();
        analyzerRef.current.fftSize = 2048;
        
        // Create audio element
        audioElementRef.current = new Audio(audioUrl);
        audioElementRef.current.crossOrigin = "anonymous";
        
        // Create source node from audio element
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioElementRef.current);
        
        // Connect nodes
        sourceNodeRef.current.connect(analyzerRef.current);
        analyzerRef.current.connect(audioContextRef.current.destination);

        // Start audio
        await audioElementRef.current.play();
      } catch (error) {
        console.error("Error initializing audio:", error);
      }
    };

    initAudio();

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!analyzerRef.current) return;

    const dataArray = new Float32Array(analyzerRef.current.frequencyBinCount);

    const updateLevel = () => {
      // Get time domain data
      analyzerRef.current.getFloatTimeDomainData(dataArray);
      
      // Find peak level
      let peak = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const absolute = Math.abs(dataArray[i]);
        if (absolute > peak) {
          peak = absolute;
        }
      }

      // Convert to dB
      const db = peak > 0 ? 20 * Math.log10(peak) : -Infinity;
      setLevel(db);

      // Schedule next update
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div style={{ 
      minWidth: '120px',
      fontFamily: 'monospace',
      fontSize: '14px'
    }}>
      Level: {level === -Infinity ? '-∞' : level.toFixed(1)} dB
    </div>
  );
};

export default AudioAnalyzer;
