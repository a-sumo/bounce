import { useEffect, useRef } from 'react';
import { createEssentiaNode } from '@/essentia-rms/EssentiaNodeFactory';

const useTrackAnalyzer = (audioRef, onAnalysis) => {
    const audioContextRef = useRef(null);
    const essentiaNodeRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const previousAudioRef = useRef(null);
  
    useEffect(() => {
      if (!audioRef) return;
  
      // Check if audioRef has changed to avoid duplicate initialization
      if (previousAudioRef.current === audioRef) return;
      previousAudioRef.current = audioRef;
  
      const initializeAnalyzer = async () => {
        try {
          // Create or reuse AudioContext
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
          }
  
          // Create EssentiaNode if needed
          if (!essentiaNodeRef.current) {
            essentiaNodeRef.current = await createEssentiaNode(audioContextRef.current);
          }
  
          // Disconnect previous nodes if they exist
          if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            essentiaNodeRef.current.disconnect();
          }
  
          // Create new source node and connect
          sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef);
          sourceNodeRef.current.connect(essentiaNodeRef.current);
          essentiaNodeRef.current.connect(audioContextRef.current.destination);
  
          // Handle RMS data
          essentiaNodeRef.current.port.onmessage = (event) => {
            if (event.data.rms !== undefined) {
              onAnalysis(event.data.rms);
            }
          };
  
          // Resume audio context if suspended
          if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
          }
        } catch (error) {
          console.error('Error initializing analyzer:', error);
        }
      };
  
      initializeAnalyzer();
  
      // Cleanup on unmount or audioRef change
      return () => {
        if (sourceNodeRef.current) {
          sourceNodeRef.current.disconnect();
          sourceNodeRef.current = null;
        }
        if (essentiaNodeRef.current) {
          essentiaNodeRef.current.disconnect();
          essentiaNodeRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(console.error);
          audioContextRef.current = null;
        }
        previousAudioRef.current = null;
      };
    }, [audioRef, onAnalysis]);
  };

export default useTrackAnalyzer;
