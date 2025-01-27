// src/services/AudioContextManager.js
class AudioContextManager {
  constructor() {
    this._context = null;
    this._players = new Map();
    this._pendingResume = null;
  }

  getContext() {
    if (!this._context) {
      this._context = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._context;
  }

  async resume() {
    if (!this._context) {
      this._context = this.getContext();
    }

    if (this._context.state === "suspended") {
      this._pendingResume = this._context.resume();
      await this._pendingResume;
    }
    return this._context;
  }

  registerPlayer(id, player) {
    this._players.set(id, player);
  }

  unregisterPlayer(id) {
    this._players.delete(id);
  }

  async play(id) {
    await this.resume();
    const player = this._players.get(id);
    if (player) {
      await player.play();
    }
  }

  pause(id) {
    const player = this._players.get(id);
    if (player) {
      player.pause();
    }
  }
}

export const audioContextManager = new AudioContextManager();
