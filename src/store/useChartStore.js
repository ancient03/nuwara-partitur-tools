import { create } from 'zustand';
import { 
  timeToBeat, 
  durationToBeat, 
  beatToTime, 
  beatToDuration, 
  determineEntityType, 
  snapTimeToGrid 
} from '../utils/chartCalculations';
import { DEFAULT_CHART, exportToUnityJson, importFromUnityJson } from '../utils/unityJsonSchema';
import { audioManager } from '../utils/audioManager';

const MAX_HISTORY = 30;

export const useChartStore = create((set, get) => ({
  // Song Metadata
  songTitle: DEFAULT_CHART.songTitle,
  artist: DEFAULT_CHART.artist,
  bpm: DEFAULT_CHART.bpm,
  audioOffset: DEFAULT_CHART.audioOffset,
  approachRateBeats: DEFAULT_CHART.approachRateBeats,

  // Audio Playback State
  audioFile: null,
  audioFileName: '',
  audioDuration: 0.0,
  currentTime: 0.0,
  isPlaying: false,
  playbackRate: 1.0,
  volume: 0.8,
  isMuted: false,

  // Timeline Display & Controls
  zoom: 240, // pixels per second
  snapDivision: 4, // 4 = 1/4 (quarter note), 8 = 1/8, 12 = 1/12, 16 = 1/16, 0 = free
  toolMode: 'select', // 'select' (default: click seeks & navigates) | 'draw' (click places note)
  metronomeEnabled: false,
  hitsoundsEnabled: true,
  followPlayhead: true,

  // Chart Notes (Mulai kosong tanpa note default)
  notes: [],
  selectedNoteId: null,
  hoveredNoteId: null,

  // Live Tapping State
  activeHoldNotes: {
    0: null, // lane 0 active hold note id
    1: null  // lane 1 active hold note id
  },
  isLiveTappingMode: true,

  // Undo / Redo
  history: [],
  historyIndex: -1,

  // Helper to record history snapshot
  _pushHistory: (newNotes) => {
    const { history, historyIndex } = get();
    const sliced = history.slice(0, historyIndex + 1);
    const updated = [...sliced, JSON.parse(JSON.stringify(newNotes))];
    if (updated.length > MAX_HISTORY) updated.shift();
    set({ history: updated, historyIndex: updated.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      set({
        notes: JSON.parse(JSON.stringify(history[prevIndex])),
        historyIndex: prevIndex
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      set({
        notes: JSON.parse(JSON.stringify(history[nextIndex])),
        historyIndex: nextIndex
      });
    }
  },

  // Set Metadata and recalculate note beats if BPM changes
  setMetadata: (fields) => {
    set((state) => {
      const updated = { ...state, ...fields };
      // If BPM changed, update targetBeat and durationBeats for all notes
      if (fields.bpm !== undefined && fields.bpm > 0 && fields.bpm !== state.bpm) {
        const newBpm = Number(fields.bpm);
        const updatedNotes = state.notes.map((note) => ({
          ...note,
          targetBeat: timeToBeat(note.targetTime, newBpm),
          durationBeats: durationToBeat(note.duration, newBpm)
        }));
        updated.notes = updatedNotes;
      }
      return updated;
    });
  },

  // Audio Actions
  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackRate: (rate) => {
    audioManager.setPlaybackRate(rate);
    set({ playbackRate: rate });
  },
  setVolume: (vol) => {
    audioManager.setVolume(vol);
    set({ volume: vol, isMuted: vol === 0 });
  },
  toggleMute: () => {
    const { isMuted, volume } = get();
    if (isMuted) {
      audioManager.setVolume(volume || 0.8);
      set({ isMuted: false });
    } else {
      audioManager.setVolume(0);
      set({ isMuted: true });
    }
  },
  setZoom: (zoom) => set({ zoom: Math.max(60, Math.min(1200, zoom)) }),
  setSnapDivision: (snapDivision) => set({ snapDivision }),
  setToolMode: (toolMode) => set({ toolMode }),
  setMetronomeEnabled: (metronomeEnabled) => {
    audioManager.metronomeEnabled = metronomeEnabled;
    set({ metronomeEnabled });
  },
  setHitsoundsEnabled: (hitsoundsEnabled) => {
    audioManager.hitsoundsEnabled = hitsoundsEnabled;
    set({ hitsoundsEnabled });
  },
  setFollowPlayhead: (followPlayhead) => set({ followPlayhead }),
  setAudioDuration: (duration) => set({ audioDuration: duration }),
  setAudioFile: (file, fileName) => set({ audioFile: file, audioFileName: fileName }),

  // Selection
  selectNote: (id) => set({ selectedNoteId: id }),
  setHoveredNoteId: (id) => set({ hoveredNoteId: id }),

  // Next Unique ID generator
  _getNextId: () => {
    const { notes } = get();
    if (notes.length === 0) return 1;
    return Math.max(...notes.map((n) => Number(n.id) || 0)) + 1;
  },

  // Note CRUD operations
  addNote: ({ lane = 0, targetTime = 0, duration = 0, tickRate = 4 }) => {
    const { bpm, notes, _getNextId, _pushHistory } = get();
    const id = _getNextId();
    const cleanDuration = Math.max(0, duration);
    const cleanTargetTime = Math.max(0, targetTime);

    const newNote = {
      id,
      entityType: determineEntityType(cleanDuration),
      lane: lane === 1 ? 1 : 0,
      targetTime: cleanTargetTime,
      targetBeat: timeToBeat(cleanTargetTime, bpm),
      duration: cleanDuration,
      durationBeats: durationToBeat(cleanDuration, bpm),
      tickRate: Number(tickRate) || 4
    };

    const updatedNotes = [...notes, newNote].sort((a, b) => a.targetTime - b.targetTime);
    _pushHistory(updatedNotes);
    set({ notes: updatedNotes, selectedNoteId: id });
    return newNote;
  },

  updateNote: (id, partialUpdates, commit = true) => {
    const { notes, bpm, _pushHistory } = get();
    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) return;

    const current = notes[index];
    const updated = { ...current, ...partialUpdates };

    // Synchronize targetTime <-> targetBeat
    if (partialUpdates.targetTime !== undefined && partialUpdates.targetBeat === undefined) {
      updated.targetTime = Math.max(0, Number(partialUpdates.targetTime));
      updated.targetBeat = timeToBeat(updated.targetTime, bpm);
    } else if (partialUpdates.targetBeat !== undefined && partialUpdates.targetTime === undefined) {
      updated.targetBeat = Math.max(0, Number(partialUpdates.targetBeat));
      updated.targetTime = beatToTime(updated.targetBeat, bpm);
    }

    // Synchronize duration <-> durationBeats & entityType
    if (partialUpdates.duration !== undefined && partialUpdates.durationBeats === undefined) {
      updated.duration = Math.max(0, Number(partialUpdates.duration));
      updated.durationBeats = durationToBeat(updated.duration, bpm);
      updated.entityType = determineEntityType(updated.duration);
    } else if (partialUpdates.durationBeats !== undefined && partialUpdates.duration === undefined) {
      updated.durationBeats = Math.max(0, Number(partialUpdates.durationBeats));
      updated.duration = beatToDuration(updated.durationBeats, bpm);
      updated.entityType = determineEntityType(updated.duration);
    }

    // If entityType explicitly changed
    if (partialUpdates.entityType !== undefined) {
      updated.entityType = Number(partialUpdates.entityType);
      if (updated.entityType === 0) {
        updated.duration = 0.0;
        updated.durationBeats = 0.0;
      } else if (updated.duration === 0) {
        // default 1 beat duration when converted to hold
        updated.durationBeats = 1.0;
        updated.duration = beatToDuration(1.0, bpm);
      }
    }

    const updatedNotes = [...notes];
    updatedNotes[index] = updated;

    if (commit) {
      updatedNotes.sort((a, b) => a.targetTime - b.targetTime);
      _pushHistory(updatedNotes);
    }

    set({ notes: updatedNotes });
  },

  deleteNote: (id) => {
    const { notes, selectedNoteId, _pushHistory } = get();
    const targetId = id !== undefined ? id : selectedNoteId;
    if (!targetId) return;

    const filtered = notes.filter((n) => n.id !== targetId);
    _pushHistory(filtered);
    set({
      notes: filtered,
      selectedNoteId: selectedNoteId === targetId ? null : selectedNoteId
    });
  },

  deleteSelectedNote: () => {
    const { selectedNoteId, deleteNote } = get();
    if (selectedNoteId) {
      deleteNote(selectedNoteId);
    }
  },

  clearAllNotes: () => {
    const { _pushHistory } = get();
    _pushHistory([]);
    set({ notes: [], selectedNoteId: null });
  },

  duplicateNote: (id) => {
    const { notes, bpm, _getNextId, _pushHistory } = get();
    const target = notes.find((n) => n.id === id);
    if (!target) return;

    const newId = _getNextId();
    // Offset by 1 beat
    const offsetTime = 60.0 / bpm;
    const duplicated = {
      ...target,
      id: newId,
      targetTime: target.targetTime + offsetTime,
      targetBeat: target.targetBeat + 1.0
    };

    const updatedNotes = [...notes, duplicated].sort((a, b) => a.targetTime - b.targetTime);
    _pushHistory(updatedNotes);
    set({ notes: updatedNotes, selectedNoteId: newId });
  },

  // Batch Quantize notes to current grid snap
  quantizeNotes: (division = null) => {
    const { notes, bpm, audioOffset, snapDivision, _pushHistory } = get();
    const div = division !== null ? division : snapDivision;
    if (div <= 0) return;

    const quantized = notes.map((note) => {
      const snappedTime = snapTimeToGrid(note.targetTime, bpm, audioOffset, div);
      return {
        ...note,
        targetTime: snappedTime,
        targetBeat: timeToBeat(snappedTime, bpm)
      };
    }).sort((a, b) => a.targetTime - b.targetTime);

    _pushHistory(quantized);
    set({ notes: quantized });
  },

  // Live Tapping Management
  startLiveTap: (lane) => {
    const { currentTime, bpm, audioOffset, snapDivision, activeHoldNotes, addNote } = get();
    // Don't start another tap on this lane if already pressed
    if (activeHoldNotes[lane]) return;

    // Optional snapping for live tap if snap is enabled and close
    let tapTime = currentTime;
    if (snapDivision > 0) {
      const snapped = snapTimeToGrid(currentTime, bpm, audioOffset, snapDivision);
      // Only snap if within 0.12s tolerance
      if (Math.abs(snapped - currentTime) < 0.12) {
        tapTime = snapped;
      }
    }

    // Play hitsound immediately for instant auditory response
    audioManager.playHitsound(lane);

    // Create note with initial 0 duration
    const note = addNote({
      lane,
      targetTime: tapTime,
      duration: 0.0,
      tickRate: 4
    });

    set((state) => ({
      activeHoldNotes: {
        ...state.activeHoldNotes,
        [lane]: {
          noteId: note.id,
          startTime: tapTime
        }
      }
    }));
  },

  updateLiveHoldNotes: (currentPlaybackTime) => {
    const { activeHoldNotes, notes, bpm } = get();
    let hasChanges = false;
    const updatedNotes = [...notes];

    [0, 1].forEach((lane) => {
      const active = activeHoldNotes[lane];
      if (active) {
        const index = updatedNotes.findIndex((n) => n.id === active.noteId);
        if (index !== -1) {
          const currentDuration = Math.max(0, currentPlaybackTime - active.startTime);
          if (currentDuration > 0.05) {
            updatedNotes[index] = {
              ...updatedNotes[index],
              duration: currentDuration,
              durationBeats: durationToBeat(currentDuration, bpm),
              entityType: 2
            };
            hasChanges = true;
          }
        }
      }
    });

    if (hasChanges) {
      set({ notes: updatedNotes });
    }
  },

  endLiveTap: (lane) => {
    const { activeHoldNotes, notes, bpm, currentTime } = get();
    const active = activeHoldNotes[lane];
    if (!active) return;

    const duration = Math.max(0, currentTime - active.startTime);
    // If hold was shorter than 0.12s, treat as single note (duration = 0)
    const finalDuration = duration >= 0.12 ? duration : 0.0;

    const updatedNotes = notes.map((note) => {
      if (note.id === active.noteId) {
        return {
          ...note,
          duration: finalDuration,
          durationBeats: durationToBeat(finalDuration, bpm),
          entityType: determineEntityType(finalDuration)
        };
      }
      return note;
    });

    set((state) => ({
      notes: updatedNotes,
      activeHoldNotes: {
        ...state.activeHoldNotes,
        [lane]: null
      }
    }));
  },

  // Import / Export
  importChart: (jsonString) => {
    const parsed = importFromUnityJson(jsonString);
    get()._pushHistory(parsed.notes);
    set({
      songTitle: parsed.songTitle,
      artist: parsed.artist,
      bpm: parsed.bpm,
      audioOffset: parsed.audioOffset,
      approachRateBeats: parsed.approachRateBeats,
      notes: parsed.notes,
      selectedNoteId: parsed.notes.length > 0 ? parsed.notes[0].id : null
    });
  },

  exportChart: () => {
    const state = get();
    return exportToUnityJson(state);
  }
}));

