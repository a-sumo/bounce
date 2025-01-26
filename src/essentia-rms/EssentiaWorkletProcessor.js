// src/essentia-rms/EssentiaWorkletProcessor.js
import { EssentiaWASM } from "https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia-wasm.es.js";
import Essentia from 'https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia.js-core.es.js';

class EssentiaWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.essentia = new Essentia(EssentiaWASM);
    this.port.postMessage({ type: 'ready' });
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (input && input[0] && input[0].length > 0) {
      const vectorInput = this.essentia.arrayToVector(input[0]);
      const rmsFrame = this.essentia.RMS(vectorInput);
      
      this.port.postMessage({ rms: rmsFrame.rms });
      
      // Copy input to output
      for (let channel = 0; channel < output.length; ++channel) {
        output[channel].set(input[channel]);
      }
    }

    return true;
  }
}

registerProcessor('essentia-worklet-processor', EssentiaWorkletProcessor);

