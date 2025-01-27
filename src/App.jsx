import { useState, useRef, useEffect, useCallback } from "react";
import { FaPlay, FaStop } from "react-icons/fa";
import CircularInterface from "./components/CircularInterface";
import TrackComponent from "./components/TrackComponent";
import Scene from './components/Scene';
import AudioPlayer from './components/audio/AudioPlayer';

import "./App.css";

const MAX_TRACKS = 2;

function App() {
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRefs = useRef([]);

  const addTrack = () => {
    if (tracks.length >= MAX_TRACKS) return;
    setTracks((prev) => [
      ...prev,
      {
        angle: 0,
        intensity: 0,
        fileName: "",
        debugAngle: 0,
      },
    ]);
  };

  const removeTrack = (index) => {
    setTracks((prev) => prev.filter((_, i) => i !== index));
    const audioElem = audioRefs.current[index];
    if (audioElem) {
      audioElem.pause();
      audioElem.currentTime = 0;
      URL.revokeObjectURL(audioElem.src);
      audioRefs.current[index] = null;
    }
  };

  const updateTrack = useCallback((index, updates) => {
    setTracks((prev) =>
      prev.map((track, i) =>
        i === index
          ? {
              ...track,
              ...updates,
              debugAngle:
                updates.angle !== undefined
                  ? ((updates.angle * 180) / Math.PI + 360) % 360
                  : track.debugAngle,
            }
          : track
      )
    );
  }, []);

  const handleFileChange = (index) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const prevElem = audioRefs.current[index];
    if (prevElem) {
      prevElem.pause();
      URL.revokeObjectURL(prevElem.src);
    }

    const audioElem = new Audio();
    audioElem.src = URL.createObjectURL(file);
    audioElem.crossOrigin = "anonymous";
    audioRefs.current[index] = audioElem;

    await new Promise((resolve) => {
      audioElem.addEventListener("loadedmetadata", resolve, { once: true });
    });

    updateTrack(index, { fileName: file.name });
  };

  const handlePlay = async () => {
    try {
      await audioContextManager.resume();
      setIsPlaying(true);
    } catch (err) {
      console.error("Playback failed:", err);
      setIsPlaying(false);
    }
  };
  
  const handleStop = () => {
    if (globalAudioContext) {
      globalAudioContext.suspend();
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      audioRefs.current.forEach((audioElem) => {
        if (audioElem) {
          audioElem.pause();
          URL.revokeObjectURL(audioElem.src);
        }
      });
    };
  }, []);

  return (
    <div className="app">
      {/* <Scene /> */}
      <AudioPlayer trackUrl="/audio/drump-loop.mp3" />
      {/* <div className="controls-panel">
        <CircularInterface
          tracks={tracks}
          onAddTrack={addTrack}
          onUpdateTrack={updateTrack}
          onRemoveTrack={removeTrack}
        />

        <div className="controls">
          {tracks.map((track, index) => (
            <TrackComponent
              key={index}
              index={index}
              track={track}
              audioRef={audioRefs.current[index]}
              onFileChange={handleFileChange(index)}
              onRemove={() => removeTrack(index)}
              onUpdate={updateTrack}
            />
          ))}

          <div className="playback-controls">
            <button
              onClick={handlePlay}
              disabled={isPlaying || tracks.length === 0}
              className="play-button"
            >
              <FaPlay />
            </button>
            <button
              onClick={handleStop}
              disabled={!isPlaying}
              className="stop-button"
            >
              <FaStop />
            </button>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default App;