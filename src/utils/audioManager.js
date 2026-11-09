/**
 * Singleton Audio Manager for Nuwara Chart Editor.
 * Combines HTML5 Audio for streaming playback + Web Audio API for
 * metronome synthesis, hitsound triggers, and low latency event handling.
 */

class AudioManager {
  constructor() {
    this.audioElement = new Audio();
    this.audioElement.preload = 'auto';
    this.audioContext = null;
    this.listeners = new Set();
    this.currentTime = 0;
    this.duration = 0;
    this.isPlaying = false;
    this.playbackRate = 1.0;
    this.volume = 0.8;
    this.rafId = null;

    // Hitsound & Metronome tracking
    this.metronomeEnabled = false;
    this.hitsoundsEnabled = true;
    this.lastMetronomeBeat = -1;
    this.lastPlayedNoteIds = new Set();

    this._bindEvents();
  }

  _initAudioContext() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  _bindEvents() {
    this.audioElement.addEventListener('loadedmetadata', () => {
      this.duration = this.audioElement.duration || 0;
      this._emit('durationchange', this.duration);
    });

    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      this._emit('play');
      this._startRafLoop();
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this._emit('pause');
      this._stopRafLoop();
    });

    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      this._emit('ended');
      this._stopRafLoop();
    });

    this.audioElement.addEventListener('seeked', () => {
      this.currentTime = this.audioElement.currentTime;
      this.lastPlayedNoteIds.clear();
      this._emit('timeupdate', this.currentTime);
    });
  }

  _startRafLoop() {
    this._stopRafLoop();
    const update = () => {
      if (this.isPlaying) {
        this.currentTime = this.audioElement.currentTime;
        this._emit('timeupdate', this.currentTime);
        this.rafId = requestAnimationFrame(update);
      }
    };
    this.rafId = requestAnimationFrame(update);
  }

  _stopRafLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  loadAudio(urlOrBlob) {
    this.pause();
    this.lastPlayedNoteIds.clear();
    const url = typeof urlOrBlob === 'string' ? urlOrBlob : URL.createObjectURL(urlOrBlob);
    this.audioElement.src = url;
    this.audioElement.load();
    this.currentTime = 0;
    this._emit('timeupdate', 0);
  }

  play() {
    this._initAudioContext();
    return this.audioElement.play().catch(e => {
      console.warn("Audio autoplay blocked or failed:", e);
    });
  }

  pause() {
    this.audioElement.pause();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  seek(seconds) {
    const clamped = Math.max(0, Math.min(seconds, this.duration || 9999));
    this.audioElement.currentTime = clamped;
    this.currentTime = clamped;
    this._emit('timeupdate', clamped);
  }

  setPlaybackRate(rate) {
    this.playbackRate = rate;
    this.audioElement.playbackRate = rate;
    this._emit('ratechange', rate);
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.audioElement.volume = this.volume;
    this._emit('volumechange', this.volume);
  }

  // Play synthetic hitsound for rhythm feedback
  playHitsound(lane = 0) {
    try {
      this._initAudioContext();
      if (!this.audioContext || !this.hitsoundsEnabled) return;

      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      if (lane === 0) {
        // Air lane: crisp high ping (1200Hz -> 800Hz)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
        gain.gain.setValueAtTime(0.35 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.09);
      } else {
        // Ground lane: solid punchy click (400Hz -> 100Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.09);
        gain.gain.setValueAtTime(0.4 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch (err) {
      // ignore web audio context errors
    }
  }

  // Metronome tick
  playMetronomeTick(isMeasureDownbeat = false) {
    try {
      this._initAudioContext();
      if (!this.audioContext || !this.metronomeEnabled) return;

      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      const freq = isMeasureDownbeat ? 1600 : 900;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.25 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch (err) {
      // ignore
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _emit(event, data) {
    for (const listener of this.listeners) {
      try {
        listener(event, data);
      } catch (e) {
        console.error(e);
      }
    }
  }
}

export const audioManager = new AudioManager();

