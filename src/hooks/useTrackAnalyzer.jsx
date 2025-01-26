// src/hooks/useTrackAnalyzer.js
import { useEffect, useRef } from 'react';
import { createEssentiaNode } from '../essentia-rms/EssentiaNodeFactory';

const useTrackAnalyzer = (audioRef, onAnalysis) => {
  const audioContextRef = useRef(null);
  const essentiaNodeRef = useRef(null);
  const sourceNodeRef = useRef(null);

  useEffect(() => {
    if (!audioRef) return;

    const initializeAnalyzer = async () => {
      try {
        // Create AudioContext if it doesn't exist
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Create EssentiaNode if it doesn't exist
        if (!essentiaNodeRef.current) {
          essentiaNodeRef.current = await createEssentiaNode(audioContextRef.current);
        }

        // Create and connect source node
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef);
        sourceNodeRef.current.connect(essentiaNodeRef.current);
        essentiaNodeRef.current.connect(audioContextRef.current.destination);

        // Set up message handler for RMS values
        essentiaNodeRef.current.port.onmessage = (event) => {
          if (event.data.rms !== undefined) {
            onAnalysis(event.data.rms);
          }
        };
      } catch (error) {
        console.error('Error initializing analyzer:', error);
      }
    };

    initializeAnalyzer();

    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }
      if (essentiaNodeRef.current) {
        essentiaNodeRef.current.disconnect();
      }
    };
  }, [audioRef, onAnalysis]);
};

export default useTrackAnalyzer;
