/**
 * Chart calculation formulas and audio-rhythm utilities
 * for Nuwara: Resonance chart editor.
 */

/**
 * Calculate targetBeat from targetTime and BPM
 * targetBeat = targetTime * (bpm / 60.0)
 */
export function timeToBeat(targetTime, bpm) {
  if (!bpm || bpm <= 0) return 0;
  return targetTime * (bpm / 60.0);
}

/**
 * Calculate durationBeats from duration and BPM
 * durationBeats = duration * (bpm / 60.0)
 */
export function durationToBeat(duration, bpm) {
  if (!bpm || bpm <= 0) return 0;
  return duration * (bpm / 60.0);
}

/**
 * Inverse: calculate targetTime from targetBeat and BPM
 * targetTime = targetBeat / (bpm / 60.0)
 */
export function beatToTime(targetBeat, bpm) {
  if (!bpm || bpm <= 0) return 0;
  return targetBeat / (bpm / 60.0);
}

/**
 * Inverse: calculate duration from durationBeats and BPM
 * duration = durationBeats / (bpm / 60.0)
 */
export function beatToDuration(durationBeats, bpm) {
  if (!bpm || bpm <= 0) return 0;
  return durationBeats / (bpm / 60.0);
}

/**
 * Determine entityType:
 * 0: Single Note (duration <= 0.0001)
 * 2: Hold Note (duration > 0.0001)
 */
export function determineEntityType(duration) {
  return (duration && duration > 0.0001) ? 2 : 0;
}

/**
 * Snap a time in seconds to the nearest beat grid division.
 * @param {number} timeInSeconds Raw time
 * @param {number} bpm Current song BPM
 * @param {number} audioOffset Audio offset in seconds
 * @param {number} division Division per measure or beat (e.g. 4 for 1/4 quarter notes, 8 for 1/8, 16 for 1/16, 0 for free)
 * @returns {number} Snapped time in seconds
 */
export function snapTimeToGrid(timeInSeconds, bpm, audioOffset = 0, division = 4) {
  if (!division || division <= 0 || !bpm || bpm <= 0) {
    return Math.max(0, timeInSeconds);
  }

  // Beat interval in seconds = (60 / bpm)
  // For division 4 (1/4 notes), step = (60 / bpm) * 1
  // In rhythm games: 
  // 1/1 = 1 measure (4 beats) -> stepBeats = 4
  // 1/2 = half measure (2 beats) -> stepBeats = 2
  // 1/4 = quarter note (1 beat) -> stepBeats = 1
  // 1/8 = eighth note (1/2 beat) -> stepBeats = 0.5
  // 1/12 = triplet (1/3 beat) -> stepBeats = 1/3
  // 1/16 = sixteenth note (1/4 beat) -> stepBeats = 0.25
  // 1/32 = thirty-second note (1/8 beat) -> stepBeats = 0.125
  
  let stepBeats = 1.0;
  switch (division) {
    case 1:  stepBeats = 4.0; break; // 1/1 measure
    case 2:  stepBeats = 2.0; break; // 1/2
    case 4:  stepBeats = 1.0; break; // 1/4 (standard beat)
    case 8:  stepBeats = 0.5; break; // 1/8
    case 12: stepBeats = 1.0 / 3.0; break; // 1/12 triplet
    case 16: stepBeats = 0.25; break; // 1/16
    case 24: stepBeats = 1.0 / 6.0; break; // 1/24 triplet
    case 32: stepBeats = 0.125; break; // 1/32
    default: stepBeats = 4.0 / division;
  }

  const secondsPerBeat = 60.0 / bpm;
  const stepSeconds = stepBeats * secondsPerBeat;

  // Relative to audio offset
  const relativeTime = timeInSeconds - audioOffset;
  const snappedSteps = Math.round(relativeTime / stepSeconds);
  const snappedTime = audioOffset + (snappedSteps * stepSeconds);

  return Math.max(0, snappedTime);
}

/**
 * Format time to MM:SS.mmm
 */
export function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

/**
 * Format beat to decimal string
 */
export function formatBeat(beat) {
  if (isNaN(beat)) return '0.00';
  return Number(beat).toFixed(2);
}

