// ControlPanel.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { playAllTracks, pauseAllTracks, resetAllTracks } from '@/redux/audioSlice';
import { FaPlay, FaPause, FaUndo } from "react-icons/fa";
// import './ControlPanel.css';

const ControlPanel = () => {
  const dispatch = useDispatch();
  const { globalPlaybackState } = useSelector(state => state.audio);

  const handlePlayPause = () => {
    if (globalPlaybackState === 'playing') {
      dispatch(pauseAllTracks());
    } else {
      dispatch(playAllTracks());
    }
  };

  const handleStop = () => {
    dispatch(pauseAllTracks());
  };

  const handleReset = () => {
    dispatch(resetAllTracks());
  };

  return (
    <div className="control-panel">
      <button onClick={handlePlayPause} className="control-button">
        {globalPlaybackState === 'playing' ? <FaPause size={24} /> : <FaPlay size={24} />}
      </button>
      <button onClick={handleStop} className="control-button">
        <FaPause size={24} />
      </button>
      <button onClick={handleReset} className="control-button">
        <FaUndo size={24} />
      </button>
    </div>
  );
};

export default ControlPanel;
