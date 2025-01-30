import { useState, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import { createEssentiaNode } from "@/essentia-rms/EssentiaNodeFactory";
import { useDispatch, useSelector } from "react-redux";
import { FaPlay, FaPause } from "react-icons/fa";
import './AudioTrack.css';
import { registerTrack, updateTrack, unregisterTrack } from '@/redux/audioSlice';
import Sliders from '@/components/Sliders';

const AudioTrack = ({ trackId, url, offset }) => {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const essentiaNodeRef = useRef(null);
  const dispatch = useDispatch();
  const [rmsLevel, setRmsLevel] = useState(0);
  
  // Redux state
  const { isPlaying } = useSelector(state => state.audio.tracks[trackId] || {});
  const lastResetTimestamp = useSelector(state => state.audio.lastResetTimestamp);

  useEffect(() => {
    dispatch(registerTrack(trackId));
    return () => {
      dispatch(unregisterTrack(trackId));
      if (essentiaNodeRef.current) {
        wavesurferRef.current?.backend?.setFilter(null);
        essentiaNodeRef.current.disconnect();
      }
      wavesurferRef.current?.destroy();
    };
  }, [trackId, dispatch]);

  useEffect(() => {
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      // waveColor: "#5c5c5c",
      progressColor: "#ff5500",
      height: 40,
      responsive: true,
    });

    wavesurfer.load(url);

    wavesurfer.on("ready", async () => {
      try {
        if (wavesurfer.backend?.ac) {
          const essentiaNode = await createEssentiaNode(wavesurfer.backend.ac);
          wavesurfer.backend.setFilter(essentiaNode);
          essentiaNode.port.onmessage = (event) => {
            if (event.data.rms !== undefined) {
              setRmsLevel(event.data.rms);
              dispatch(updateTrack({ 
                trackId, 
                rms: event.data.rms,
                isPlaying: wavesurfer.isPlaying()
              }));
            }
          };
          essentiaNodeRef.current = essentiaNode;
        }
      } catch (error) {
        console.error("Essentia node error:", error);
      }
      wavesurferRef.current = wavesurfer;
    });

    return () => wavesurfer.destroy();
  }, [url, dispatch, trackId]);

  useEffect(() => {
    if (!wavesurferRef.current) return;
    isPlaying ? wavesurferRef.current.play() : wavesurferRef.current.pause();
  }, [isPlaying]);

  useEffect(() => {
    if (wavesurferRef.current && lastResetTimestamp) {
      wavesurferRef.current.seekTo(0);
    }
  }, [lastResetTimestamp]);

  const handlePlayPause = () => {
    dispatch(updateTrack({ 
      trackId, 
      isPlaying: !isPlaying 
    }));
  };

  return (
    <div className="track-container">
      <div className="track-info">
        <span className="track-name" title={url.split("/").pop()}>
          {url.split("/").pop()}
        </span>
      </div>
      <div className="waveform-container" ref={waveformRef}>
        <button 
          onClick={handlePlayPause} 
          className="play-button"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <FaPause size={16} />
          ) : (
            <FaPlay size={16} style={{ marginLeft: '2px' }} />
          )}
        </button>
      </div>
      <Sliders trackId={trackId} />
    </div>
  );
};

export default AudioTrack;