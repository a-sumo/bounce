// redux/audioSlice.js
import { createSlice, configureStore } from '@reduxjs/toolkit'

const initialState = {
  tracks: {}
}

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    registerTrack: (state, action) => {
      const trackId = action.payload
      console.log('trackId', trackId);
      state.tracks[trackId] = {
        rms: 0,
        yPos: 0
      }
    },
    updateTrack: (state, action) => {
      const { trackId, rms } = action.payload
      const current = state.tracks[trackId]
      if (!current) return
      // console.log("Dispatching update for track:", trackId, "with RMS:", rms);
      // Smooth the RMS value
      const smoothedRms = 0.2 * rms + 0.8 * current.rms
      const yPos = smoothedRms

      current.rms = smoothedRms
      current.yPos = yPos
    },
    unregisterTrack: (state, action) => {
      const trackId = action.payload
      delete state.tracks[trackId]
    }
  }
})

export const { registerTrack, updateTrack, unregisterTrack } = audioSlice.actions

const store = configureStore({
  reducer: {
    audio: audioSlice.reducer
  }
})

export default store
