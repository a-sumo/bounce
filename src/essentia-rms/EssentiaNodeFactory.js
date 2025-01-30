export async function createEssentiaNode(context) {
  class EssentiaNode extends AudioWorkletNode {
    constructor(context) {
      super(context, 'essentia-worklet-processor', {
        outputChannelCount: [1]
      });
    }
  }

  try {
    const workletPath = new URL('../essentia-rms/EssentiaWorkletProcessor.js', import.meta.url).href;
    await context.audioWorklet.addModule(workletPath);
  } catch(e) {
    console.error('Error loading audio worklet:', e);
  }

  return new EssentiaNode(context);
}
