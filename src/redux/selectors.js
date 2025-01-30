import { createSelector } from '@reduxjs/toolkit';

export const selectTrackById = createSelector(
  [
    (state) => state.audio.tracks,
    (_, trackId) => trackId
  ],
  (tracks, trackId) => ({
    angle: tracks[trackId]?.angle || 0,
    radius: tracks[trackId]?.radius || 3,
    isPlaying: tracks[trackId]?.isPlaying || false
  })
);