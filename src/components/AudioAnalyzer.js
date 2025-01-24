import React from 'react';
import useAudioAnalyzer from '../hooks/useAudioAnalyzer';

const AudioAnalyzer = ({ audio, updateIntensity }) => {
  useAudioAnalyzer(audio, updateIntensity);
  return null;
};

export default AudioAnalyzer;