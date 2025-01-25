// src/hooks/useTrackAnalyzer.js
import { useEffect } from 'react';

const useTrackAnalyzer = (audioElement, onIntensityUpdate) => {
  useEffect(() => {
    if (!audioElement) return;

    let audioContext;
    let source;
    let analyser;
    let intervalId;

    const initAudioContext = async () => {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        source = audioContext.createMediaElementSource(audioElement);
        analyser = audioContext.createAnalyser();
        
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        intervalId = setInterval(() => {
          analyser.getByteFrequencyData(dataArray);
          const rms = Math.sqrt(dataArray.reduce((sum, v) => sum + v*v, 0) / bufferLength);
          onIntensityUpdate(rms / 128); // Normalize to 0-1 range
        }, 50);
      } catch (error) {
        console.error('Audio analysis error:', error);
      }
    };

    initAudioContext();

    return () => {
      clearInterval(intervalId);
      if (source) source.disconnect();
      if (analyser) analyser.disconnect();
      if (audioContext) audioContext.close();
    };
  }, [audioElement, onIntensityUpdate]);
};

export default useTrackAnalyzer;