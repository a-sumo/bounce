import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import WaveSurfer from "wavesurfer.js";
import { audioContextManager } from "@/services/AudioContextManager";

const AudioPlayer = ({ trackUrl }) => {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const initializeWavesurfer = async () => {
      try {
        const audioContext = audioContextManager.getContext();

        const wavesurfer = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: "#ff5501",
          progressColor: "#d44700",
          cursorColor: "transparent",
          height: 80,
          responsive: true,
          audioContext,
          backend: "WebAudio",
        });

        wavesurfer.load(trackUrl);

        wavesurfer.on("ready", () => {
          setDuration(wavesurfer.getDuration());
          const savedVolume = localStorage.getItem("audio-player-volume");
          if (savedVolume) {
            const volumeValue = parseFloat(savedVolume);
            wavesurfer.setVolume(volumeValue);
            setVolume(volumeValue);
          }
        });

        wavesurfer.on("audioprocess", () => {
          setCurrentTime(wavesurfer.getCurrentTime());
        });

        wavesurfer.on("finish", () => {
          setIsPlaying(false);
        });

        wavesurferRef.current = wavesurfer;
        audioContextManager.registerPlayer(trackUrl, wavesurfer);

        return () => {
          wavesurfer.destroy();
          audioContextManager.unregisterPlayer(trackUrl);
        };
      } catch (error) {
        console.error("Failed to initialize audio:", error);
      }
    };

    initializeWavesurfer();
  }, [trackUrl]);

  const handlePlayPause = useCallback(async () => {
    try {
      // Resume context on user interaction
      await audioContextManager.resume();

      if (!isPlaying) {
        await audioContextManager.play(trackUrl);
      } else {
        audioContextManager.pause(trackUrl);
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Playback failed:", error);
    }
  }, [isPlaying, trackUrl]);

  const handleVolumeChange = useCallback((e) => {
    const newVolume = e.target.value / 100;
    setVolume(newVolume);
    wavesurferRef.current.setVolume(newVolume);
    localStorage.setItem("audio-player-volume", newVolume);
  }, []);

  const toggleMute = useCallback(() => {
    wavesurferRef.current.toggleMute();
    setIsMuted(!isMuted);
  }, [isMuted]);

  const formatTimecode = useCallback((seconds) => {
    return new Date(seconds * 1000).toISOString().substr(11, 8);
  }, []);

  return (
    <div className="audio-player">
      <button className="play-button" onClick={handlePlayPause}>
        {isPlaying ? (
          <FaPause className="play-button-icon" size={24} />
        ) : (
          <FaPlay className="play-button-icon" size={24} />
        )}
      </button>

      <div className="player-body">
        <div ref={waveformRef} className="waveform" />

        <div className="controls">
          <div className="volume">
            <button onClick={toggleMute}>
              {isMuted ? (
                <FaVolumeMute className="volume-icon" size={20} />
              ) : (
                <FaVolumeUp className="volume-icon" size={20} />
              )}
            </button>
            <input
              type="range"
              className="volume-slider"
              min="0"
              max="100"
              value={volume * 100}
              onChange={handleVolumeChange}
              disabled={isMuted}
            />
          </div>

          <div className="timecode">
            <span>{formatTimecode(currentTime)}</span>
            <span>/</span>
            <span>{formatTimecode(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
