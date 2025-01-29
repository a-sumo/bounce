import { createSelector } from "@reduxjs/toolkit";

// Base selector to get the tracks object
const selectTracks = (state) => state.audio.tracks;

// Memoized selector to get a specific track by trackId
export const selectTrackById = (trackId) =>
  createSelector(
    [selectTracks],
    (tracks) => tracks[trackId] || {} // Default to an empty object if the track doesn't exist
  );