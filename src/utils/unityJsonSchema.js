import { timeToBeat, durationToBeat, determineEntityType } from './chartCalculations';

/**
 * Validates and serializes chart data to strict Unity C# schema format.
 */
export function exportToUnityJson(chartData) {
  const bpm = Number(chartData.bpm) || 120.0;
  
  // Sort notes strictly by targetTime, then by lane
  const sortedNotes = [...(chartData.notes || [])].sort((a, b) => {
    if (Math.abs(a.targetTime - b.targetTime) > 0.0001) {
      return a.targetTime - b.targetTime;
    }
    return a.lane - b.lane;
  });

  const formattedNotes = sortedNotes.map((note, index) => {
    const duration = Math.max(0, Number(note.duration) || 0.0);
    const targetTime = Math.max(0, Number(note.targetTime) || 0.0);
    const targetBeat = Number(note.targetBeat) || timeToBeat(targetTime, bpm);
    const durationBeats = Number(note.durationBeats) || durationToBeat(duration, bpm);
    const entityType = determineEntityType(duration);

    return {
      id: Number(note.id) || (index + 1),
      entityType: entityType,
      lane: Number(note.lane) === 1 ? 1 : 0,
      targetTime: targetTime,
      targetBeat: targetBeat,
      duration: duration,
      durationBeats: durationBeats,
      tickRate: Number(note.tickRate) || 4
    };
  });

  const unityPayload = {
    songTitle: String(chartData.songTitle || 'unknown'),
    artist: String(chartData.artist || ''),
    bpm: bpm,
    audioOffset: Number(chartData.audioOffset) || 0.0,
    approachRateBeats: Number(chartData.approachRateBeats) || 4.0,
    notes: formattedNotes
  };

  return JSON.stringify(unityPayload, null, 2);
}

/**
 * Parses and sanitizes imported JSON into chart data model.
 */
export function importFromUnityJson(jsonString) {
  let parsed;
  try {
    parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  } catch (err) {
    throw new Error('Format JSON tidak valid: ' + err.message);
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Data chart harus berupa JSON Object.');
  }

  const bpm = Math.max(1, Number(parsed.bpm) || 120.0);
  const audioOffset = Number(parsed.audioOffset) || 0.0;
  const approachRateBeats = Number(parsed.approachRateBeats) || 4.0;
  const songTitle = parsed.songTitle !== undefined ? String(parsed.songTitle) : 'imported_chart';
  const artist = parsed.artist !== undefined ? String(parsed.artist) : '';

  const rawNotes = Array.isArray(parsed.notes) ? parsed.notes : [];
  
  const notes = rawNotes.map((n, i) => {
    const targetTime = Math.max(0, Number(n.targetTime) || 0.0);
    const duration = Math.max(0, Number(n.duration) || 0.0);
    const targetBeat = n.targetBeat !== undefined ? Number(n.targetBeat) : timeToBeat(targetTime, bpm);
    const durationBeats = n.durationBeats !== undefined ? Number(n.durationBeats) : durationToBeat(duration, bpm);
    const entityType = determineEntityType(duration);

    return {
      id: Number(n.id) || (i + 1),
      entityType: entityType,
      lane: Number(n.lane) === 1 ? 1 : 0,
      targetTime: targetTime,
      targetBeat: targetBeat,
      duration: duration,
      durationBeats: durationBeats,
      tickRate: Number(n.tickRate) || 4
    };
  });

  return {
    songTitle,
    artist,
    bpm,
    audioOffset,
    approachRateBeats,
    notes
  };
}

/**
 * Initial empty chart matching user's spec
 */
export const DEFAULT_CHART = {
  songTitle: "unknown",
  artist: "",
  bpm: 120.0,
  audioOffset: 0.0,
  approachRateBeats: 4.0,
  notes: []
};

