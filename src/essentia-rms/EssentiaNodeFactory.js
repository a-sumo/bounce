// src/EssentiaNodeFactory.js

// src/essentia-rms/EssentiaNodeFactory.js
export async function createEssentiaNode(context) {
  class EssentiaNode extends AudioWorkletNode {
    constructor(context) {
      super(context, 'essentia-worklet-processor', {
        outputChannelCount: [1]
      });
    }
  }

  try {
    // Use ?worker&url for proper TypeScript/JavaScript processing
    const workletPath = '/src/essentia-rms/EssentiaWorkletProcessor.js';
    await context.audioWorklet.addModule(workletPath);
  } catch(e) {
    console.error('Error loading audio worklet:', e);
  }

  return new EssentiaNode(context);
}
