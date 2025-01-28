import { useState, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import { createEssentiaNode } from "@/essentia-rms/EssentiaNodeFactory";
import { FaPlay, FaPause } from "react-icons/fa";
import './AudioTrack.css';
import { useDispatch } from 'react-redux';
import { registerTrack, updateTrack, unregisterTrack } from '@/redux/audioSlice';
import Sliders from '@/components/Sliders';

const AudioTrack = ({ trackId, url }) => {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const essentiaNodeRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rmsLevel, setRmsLevel] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    // Register track in Redux
    dispatch(registerTrack(trackId))

    // Cleanup/unregister on unmount
    return () => {
      dispatch(unregisterTrack(trackId))
    }
  }, [trackId, dispatch])

  // Whenever you have a new RMS value computed (e.g. from Audio Analyzers), dispatch update:
  const handleNewRms = (rmsValue) => {
    dispatch(updateTrack({ trackId, rms: rmsValue }));
  }

  useEffect(() => {
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#ff5501",
      progressColor: "#d44700",
      height: 80,
      responsive: true,
    });

    wavesurfer.load(url);

    wavesurfer.on("ready", async () => {
      console.log("Audio loaded:", url);

      // Create and connect Essentia node when audio is ready
      if (wavesurfer.backend && wavesurfer.backend.ac) {
        try {
          const essentiaNode = await createEssentiaNode(wavesurfer.backend.ac);

          // Connect the Essentia node to the audio graph
          wavesurfer.backend.setFilter(essentiaNode);

          // Listen for RMS updates
          essentiaNode.port.onmessage = (event) => {
            if (event.data.rms !== undefined) {
              setRmsLevel(event.data.rms);
              handleNewRms(event.data.rms);
            }
          };

          essentiaNodeRef.current = essentiaNode;
        } catch (error) {
          console.error("Failed to create Essentia node:", error);
        }
      }
    });

    wavesurfer.on("finish", () => {
      setIsPlaying(false);
    });

    wavesurferRef.current = wavesurfer;

    return () => {
      if (essentiaNodeRef.current) {
        wavesurfer.backend.setFilter(null);
        essentiaNodeRef.current.disconnect();
      }
      wavesurfer.destroy();
    };
  }, [url]);

  const handlePlayPause = async () => {
    if (!wavesurferRef.current) return;

    const backend = wavesurferRef.current.backend;
    if (backend && backend.ac && backend.ac.state === "suspended") {
      await backend.ac.resume();
    }

    wavesurferRef.current.playPause();
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="track-container">
      <div className="track-info">
        <span className="track-name">{url.split("/").pop()}</span>
        <div className="rms-display">
          RMS: {rmsLevel === -Infinity ? "0" : rmsLevel.toFixed(1)}
        </div>
      </div>

      <div className="waveform-container" ref={waveformRef} />

      <button onClick={handlePlayPause} className="play-button">
        {isPlaying ? <FaPause size={20} /> : <FaPlay size={20}/>}
      </button>
      <Sliders trackId={trackId} />
    </div>
  );
};

export default AudioTrack;
