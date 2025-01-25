import React, { useState, useRef, useEffect } from "react";
import { FaPlay, FaStop } from "react-icons/fa";
import CircularInterface from "./components/CircularInterface";
import TrackComponent from "./components/TrackComponent";

import "./App.css";

const MAX_TRACKS = 2;

function App() {
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // We store references to hidden <audio> elements for each track.
  const audioRefs = useRef([]);

  // Add a new track
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

  // Remove a track (stop, revokeObjectURL, remove from array)
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

  // Update track properties
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

  // Handle file load
  const handleFileChange = (index) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Cleanup previous audio if any
    const prevElem = audioRefs.current[index];
    if (prevElem) {
      prevElem.pause();
      URL.revokeObjectURL(prevElem.src);
    }

    // Create a new <audio> element (not added to DOM, or can be hidden)
    const audioElem = new Audio();
    audioElem.src = URL.createObjectURL(file);
    audioElem.crossOrigin = "anonymous"; // helps with analysis
    audioRefs.current[index] = audioElem;

    // Wait until metadata is loaded so we know the audio is ready
    await new Promise((resolve) => {
      audioElem.addEventListener("loadedmetadata", resolve, { once: true });
    });

    updateTrack(index, { fileName: file.name });
  };

  // Start playback of all tracks
  const handlePlay = async () => {
    try {
      const playPromises = [];
      // Start each loaded audio
      audioRefs.current.forEach((audioElem) => {
        if (!audioElem) return;
        // Return a promise from .play()
        playPromises.push(audioElem.play());
      });
      setIsPlaying(true);
      await Promise.all(playPromises);
    } catch (err) {
      console.error("Playback failed:", err);
      setIsPlaying(false);
    }
  };

  // Stop all tracks
  const handleStop = () => {
    audioRefs.current.forEach((audioElem) => {
      if (!audioElem) return;
      audioElem.pause();
      audioElem.currentTime = 0;
    });
    setIsPlaying(false);
  };

  // Clean up on unmount
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
    </div>
  );
}

export default App;
