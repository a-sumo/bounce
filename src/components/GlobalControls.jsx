import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { playAllTracks, pauseAllTracks, resetAllTracks } from "@/redux/audioSlice";

const GlobalControls = () => {
  const dispatch = useDispatch();
  const globalPlaybackState = useSelector((state) => state.audio.globalPlaybackState);

  return (
    <div className="global-controls">
      <button onClick={() => dispatch(playAllTracks())} disabled={globalPlaybackState === 'playing'}>
        Play All
      </button>
      <button onClick={() => dispatch(pauseAllTracks())} disabled={globalPlaybackState === 'paused'}>
        Pause All
      </button>
      <button onClick={() => dispatch(resetAllTracks())}>
        Rewind All
      </button>
    </div>
  );
};

export default GlobalControls;