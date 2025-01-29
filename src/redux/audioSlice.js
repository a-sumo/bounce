// redux/audioSlice.js
import { createSlice, configureStore } from "@reduxjs/toolkit";

const RMS_WINDOW_SIZE = 30; // Adjust based on your needs
const ATTACK_FACTOR = 0.3; // Fast increase
const DECAY_FACTOR = 0.005; // Slow decrease

const initialState = {
  tracks: {},
};

const audioSlice = createSlice({
  name: "audio",
  initialState,
  reducers: {
    registerTrack: (state, action) => {
      const trackId = action.payload;
      state.tracks[trackId] = {
        rms: 0,
        rmsWindow: new Array(RMS_WINDOW_SIZE).fill(0),
        radius: 5,
        angle: 0,
        isPlaying: false,
      };
    },
    // Update the `updateTrack` reducer to handle `isPlaying`
    updateTrack: (state, action) => {
      const { trackId, rms, isPlaying } = action.payload;
      const current = state.tracks[trackId];
      if (!current) return;
    
      // RMS processing
      if (rms !== undefined) {
        current.rmsWindow.shift();
        current.rmsWindow.push(rms);
        const currentMax = Math.max(...current.rmsWindow);
        if (rms > current.rms) {
          current.rms += ATTACK_FACTOR * (rms - current.rms);
        } else {
          current.rms += DECAY_FACTOR * (currentMax - current.rms);
        }
        current.rms = Math.max(0, Math.min(1, current.rms));
      }
    
      // Play state update
      if (isPlaying !== undefined) {
        current.isPlaying = isPlaying;
      }
    },

    // Reset all tracks to the start
    resetAllTracks: (state) => {
      state.globalPlaybackState = 'paused';
      state.lastResetTimestamp = Date.now(); // Update timestamp
      Object.keys(state.tracks).forEach(trackId => {
        state.tracks[trackId].isPlaying = false;
        state.tracks[trackId].currentTime = 0; // Reset playback position
      });
    },
    setTrackAngleAndRadius: (state, action) => {
      const { trackId, angle, radius } = action.payload;
      const current = state.tracks[trackId];
      if (!current) return;

      current.angle = angle;
      current.radius = radius;
    },
    setGlobalPlaybackState: (state, action) => {
      state.globalPlaybackState = action.payload;
    },
    playAllTracks: (state) => {
      state.globalPlaybackState = 'playing';
      Object.keys(state.tracks).forEach(trackId => {
        state.tracks[trackId].isPlaying = true;
      });
    },
    pauseAllTracks: (state) => {
      state.globalPlaybackState = 'paused';
      Object.keys(state.tracks).forEach(trackId => {
        state.tracks[trackId].isPlaying = false;
      });
    },
    unregisterTrack: (state, action) => {
      const trackId = action.payload;
      delete state.tracks[trackId];
    },
    
  },
});

export const {
  registerTrack,
  updateTrack,
  setTrackAngleAndRadius,
  unregisterTrack,
  setGlobalPlaybackState,
  playAllTracks,
  pauseAllTracks,
  resetAllTracks
} = audioSlice.actions;

const store = configureStore({
  reducer: {
    audio: audioSlice.reducer,
  },
});

export default store;
