import React, { useState, useRef, useEffect } from "react";
import { FaPlay, FaStop } from "react-icons/fa";
import CircularInterface from "./components/CircularInterface";
import TrackControls from "./components/TrackControls";
import AudioAnalyzer from "./components/AudioAnalyzer";
import "./App.css";

const MAX_TRACKS = 2;

const App = () => {
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
    const audio = audioRefs.current[index];
    if (audio) {
      audio.pause();
      URL.revokeObjectURL(audio.src);
      audioRefs.current[index] = null;
    }
  };

  const updateTrack = (index, updates) => {
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
  };

  const handleFileChange = (index) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Cleanup previous audio
    const prevAudio = audioRefs.current[index];
    if (prevAudio) {
      prevAudio.pause();
      URL.revokeObjectURL(prevAudio.src);
    }

    // Create new audio with object URL
    const audio = new Audio(URL.createObjectURL(file));
    audioRefs.current[index] = audio;

    // Wait for metadata to load
    await new Promise((resolve) => {
      audio.addEventListener("loadedmetadata", resolve, { once: true });
    });

    updateTrack(index, { fileName: file.name });
  };

  const handlePlay = async () => {
    try {
      setIsPlaying(true);
      await Promise.all(
        audioRefs.current.filter(Boolean).map((audio) => audio.play())
      );
    } catch (error) {
      console.error("Playback error:", error);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    audioRefs.current.forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    setIsPlaying(false);
  };

  // Cleanup audio resources on unmount
  useEffect(() => {
    return () => {
      audioRefs.current.forEach((audio) => {
        if (audio) {
          URL.revokeObjectURL(audio.src);
          audio.pause();
        }
      });
    };
  }, []);

  return (
    <div className="app">
      <CircularInterface
        tracks={tracks}
        onAddTrack={addTrack}
        onUpdateTrack={updateTrack}
        onRemoveTrack={removeTrack}
      />

      <div className="controls">
        {tracks.map((track, index) => (
          <div key={index} className="track-control-group">
            <TrackControls
              index={index}
              track={track}
              onFileChange={handleFileChange(index)}
              onRemove={() => removeTrack(index)}
            />
            <AudioAnalyzer
              audio={audioRefs.current[index]}
              updateIntensity={(intensity) => {
                console.log(`Track ${index + 1} Intensity:`, intensity);
                updateTrack(index, { intensity });
              }}
            />
          </div>
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
    </div>
  );
};

export default App;
