// src/hooks/useAudioContext.js
import { useEffect } from 'react';
import { audioContextManager } from '@/services/AudioContextManager';

export function useAudioContext() {
  useEffect(() => {
    // Initialize context when first used
    const context = audioContextManager.getContext();
    
    return () => {
      // Only close the context when the entire app unmounts
      // This would typically be in your top-level component
      // audioContextManager.close();
    };
  }, []);

  return audioContextManager;
}