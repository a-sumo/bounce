import useAudioAnalyzer from '../hooks/useTrackAnalyzer';

const AudioAnalyzer = ({ audio, updateIntensity }) => {
  useAudioAnalyzer(audio, updateIntensity);
  return null;
};

export default AudioAnalyzer;