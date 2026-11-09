/**
 * In-browser synthetic rhythm music generator.
 * Creates an electronic rhythm demo track (120 BPM, ~32 seconds)
 * using Web Audio API synthesis and encodes it as a high quality WAV Blob.
 */

export function generateSyntheticDemoTrack(bpm = 120, totalBeats = 64) {
  const secondsPerBeat = 60.0 / bpm;
  const totalDuration = totalBeats * secondsPerBeat;
  const sampleRate = 44100;
  const totalSamples = Math.ceil(totalDuration * sampleRate);

  const audioContext = new (window.AudioContext || window.webkitAudioContext)({
    sampleRate: sampleRate
  });

  const buffer = audioContext.createBuffer(2, totalSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  // Synthesize: Kick, Snare, Hihat, Synth Arp
  for (let beat = 0; beat < totalBeats; beat++) {
    const beatStartTime = beat * secondsPerBeat;
    const beatStartSample = Math.floor(beatStartTime * sampleRate);

    // 1. Kick drum on beats 0, 1, 2, 3 (Four on the floor)
    addKick(left, right, beatStartSample, sampleRate);

    // 2. Snare / Clap on beats 1 and 3 (0-indexed: beat % 2 === 1)
    if (beat % 2 === 1) {
      addSnare(left, right, beatStartSample, sampleRate);
    }

    // 3. Hi-Hats on 1/8 notes (beat + 0.5) and 1/16 notes
    const eighthSample = Math.floor((beatStartTime + secondsPerBeat * 0.5) * sampleRate);
    addHiHat(left, right, beatStartSample, sampleRate, 0.2);
    addHiHat(left, right, eighthSample, sampleRate, 0.4);

    // 4. Synth Bass / Arpeggio notes
    const chordIndex = Math.floor(beat / 8) % 4;
    // Chords: Am, F, C, G
    const roots = [220, 174.61, 261.63, 196]; // A3, F3, C4, G3
    const freq = roots[chordIndex] * (beat % 2 === 0 ? 0.5 : 0.75);
    addSynthNote(left, right, beatStartSample, Math.floor(secondsPerBeat * 0.8 * sampleRate), freq, sampleRate);
  }

  return bufferToWave(buffer, totalSamples);
}

function addKick(left, right, startSample, sampleRate) {
  const durationSamples = Math.floor(0.25 * sampleRate);
  for (let i = 0; i < durationSamples; i++) {
    const idx = startSample + i;
    if (idx >= left.length) break;
    const t = i / sampleRate;
    // Frequency sweep from 150Hz to 40Hz
    const freq = 150 * Math.exp(-t * 28);
    const env = Math.exp(-t * 14);
    const sample = Math.sin(2 * Math.PI * freq * t) * env * 0.7;
    left[idx] += sample;
    right[idx] += sample;
  }
}

function addSnare(left, right, startSample, sampleRate) {
  const durationSamples = Math.floor(0.2 * sampleRate);
  for (let i = 0; i < durationSamples; i++) {
    const idx = startSample + i;
    if (idx >= left.length) break;
    const t = i / sampleRate;
    const noise = (Math.random() * 2 - 1) * Math.exp(-t * 18);
    const tone = Math.sin(2 * Math.PI * 220 * t) * Math.exp(-t * 22) * 0.5;
    const sample = (noise * 0.5 + tone) * 0.5;
    left[idx] += sample;
    right[idx] += sample;
  }
}

function addHiHat(left, right, startSample, sampleRate, volume = 0.3) {
  const durationSamples = Math.floor(0.06 * sampleRate);
  for (let i = 0; i < durationSamples; i++) {
    const idx = startSample + i;
    if (idx >= left.length) break;
    const t = i / sampleRate;
    const noise = (Math.random() * 2 - 1) * Math.exp(-t * 45);
    left[idx] += noise * volume;
    right[idx] += noise * volume;
  }
}

function addSynthNote(left, right, startSample, durationSamples, freq, sampleRate) {
  for (let i = 0; i < durationSamples; i++) {
    const idx = startSample + i;
    if (idx >= left.length) break;
    const t = i / sampleRate;
    const env = Math.sin((i / durationSamples) * Math.PI) * 0.25;
    // Sawtooth approximation with 3 harmonics
    const saw = Math.sin(2 * Math.PI * freq * t) + 
                0.5 * Math.sin(4 * Math.PI * freq * t) + 
                0.25 * Math.sin(6 * Math.PI * freq * t);
    left[idx] += saw * env * 0.7;
    right[idx] += saw * env * 0.7;
  }
}

// Convert AudioBuffer to WAV Blob
function bufferToWave(abuffer, len) {
  let numOfChan = abuffer.numberOfChannels,
    length = len * numOfChan * 2 + 44,
    out = new DataView(new ArrayBuffer(length)),
    channels = [],
    i,
    sample,
    offset = 0,
    pos = 0;

  function setUint16(data) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (i = 0; i < abuffer.numberOfChannels; i++) channels.push(abuffer.getChannelData(i));

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}

