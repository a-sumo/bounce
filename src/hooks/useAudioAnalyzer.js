// src/hooks/useAudioAnalyzer.js
import { useEffect, useRef } from "react";

const useAudioAnalyzer = (audio, updateIntensity) => {
  const analyser = useRef(null);
  const audioContext = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    if (!audio) return;

    const setupAnalyzer = async () => {
      try {
        audioContext.current = new (window.AudioContext ||
          window.webkitAudioContext)();
        analyser.current = audioContext.current.createAnalyser();
        analyser.current.fftSize = 256;

        const source = audioContext.current.createMediaElementSource(audio);
        source.connect(analyser.current);
        analyser.current.connect(audioContext.current.destination);

        const analyze = () => {
          if (!analyser.current) return;

          const bufferLength = analyser.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyser.current.getByteFrequencyData(dataArray);

          // Ensure valid intensity calculation
          const rawIntensity = dataArray.reduce((a, b) => a + b, 0);
          const intensity = Math.min(
            1,
            Math.max(0, rawIntensity / (bufferLength * 255))
          );

          console.log(`Intensity: ${intensity.toFixed(2)}`);
          updateIntensity(intensity);
          animationFrameId.current = requestAnimationFrame(analyze);
        };

        animationFrameId.current = requestAnimationFrame(analyze);
      } catch (error) {
        console.error("Audio analysis error:", error);
      }
    };

    setupAnalyzer();

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      if (analyser.current) {
        analyser.current.disconnect();
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, [audio, updateIntensity]);

  return null;
};

export default useAudioAnalyzer;
