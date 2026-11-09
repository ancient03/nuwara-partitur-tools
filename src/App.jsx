import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header/Header';
import PlaybackToolbar from './components/AudioPlayer/PlaybackToolbar';
import TimelineContainer from './components/Timeline/TimelineContainer';
import InspectorSidebar from './components/Inspector/InspectorSidebar';
import LiveTappingDock from './components/LiveRecording/LiveTappingDock';
import MetadataModal from './components/Header/MetadataModal';
import ExportModal from './components/Modals/ExportModal';
import HelpModal from './components/Modals/HelpModal';
import { useChartStore } from './store/useChartStore';
import { audioManager } from './utils/audioManager';
import { generateSyntheticDemoTrack } from './utils/synthDemoTrack';
import { timeToBeat } from './utils/chartCalculations';

export default function App() {
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const {
    bpm,
    audioOffset,
    notes,
    isPlaying,
    currentTime,
    setCurrentTime,
    setIsPlaying,
    setAudioDuration,
    setAudioFile,
    deleteSelectedNote,
    startLiveTap,
    endLiveTap,
    updateLiveHoldNotes,
    setToolMode,
    undo,
    redo
  } = useChartStore();

  const prevBeatRef = useRef(-1);
  const prevTimeRef = useRef(0);

  // Subscribe to audioManager events for timeupdate, play, pause
  useEffect(() => {
    const unsubscribe = audioManager.subscribe((event, data) => {
      if (event === 'timeupdate') {
        const time = data;
        setCurrentTime(time);

        // Update active hold notes
        updateLiveHoldNotes(time);

        // Metronome click sync
        const currentBeat = (time - audioOffset) * (bpm / 60.0);
        const beatInt = Math.floor(currentBeat);
        if (beatInt !== prevBeatRef.current && currentBeat >= 0) {
          prevBeatRef.current = beatInt;
          const isDownbeat = (beatInt % 4) === 0;
          audioManager.playMetronomeTick(isDownbeat);
        }

        // Hitsound triggers when playhead crosses note targetTime
        const lastTime = prevTimeRef.current;
        prevTimeRef.current = time;

        if (audioManager.isPlaying && time > lastTime) {
          for (const note of notes) {
            // Did playhead just cross targetTime?
            if (note.targetTime >= lastTime && note.targetTime < time) {
              if (!audioManager.lastPlayedNoteIds.has(note.id)) {
                audioManager.playHitsound(note.lane);
                audioManager.lastPlayedNoteIds.add(note.id);
              }
            }
          }
        }
      } else if (event === 'play') {
        setIsPlaying(true);
      } else if (event === 'pause' || event === 'ended') {
        setIsPlaying(false);
        prevBeatRef.current = -1;
      } else if (event === 'durationchange') {
        setAudioDuration(data);
      }
    });

    return () => unsubscribe();
  }, [bpm, audioOffset, notes]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in text inputs or textareas
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        return;
      }

      // Spacebar: Play / Pause
      if (e.code === 'Space') {
        e.preventDefault();
        audioManager.togglePlay();
        return;
      }

      // F Key: Tap / Hold Lane 0 (AIR)
      if (e.code === 'KeyF') {
        if (!e.repeat) {
          startLiveTap(0);
        }
        return;
      }

      // J Key: Tap / Hold Lane 1 (GROUND)
      if (e.code === 'KeyJ') {
        if (!e.repeat) {
          startLiveTap(1);
        }
        return;
      }

      // Tool Mode shortcuts: V (Select/Seek) & B (Draw/Pen)
      if (e.code === 'KeyV') {
        setToolMode('select');
        return;
      }
      if (e.code === 'KeyB') {
        setToolMode('draw');
        return;
      }

      // Delete or Backspace: Remove selected note
      if (e.code === 'Delete' || e.code === 'Backspace') {
        e.preventDefault();
        deleteSelectedNote();
        return;
      }

      // Undo / Redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          return;
        }
        if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          redo();
          return;
        }
      }
    };

    const handleKeyUp = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        return;
      }

      if (e.code === 'KeyF') {
        endLiveTap(0);
      } else if (e.code === 'KeyJ') {
        endLiveTap(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startLiveTap, endLiveTap, deleteSelectedNote, setToolMode, undo, redo]);

  return (
    <div className="flex flex-col h-screen w-screen bg-daw-bg text-slate-200 overflow-hidden font-sans">
      {/* 1. Header & Metadata Manager */}
      <Header
        onOpenMetadata={() => setIsMetadataOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* 2. Playback Toolbar & Transport Controls */}
      <PlaybackToolbar />

      {/* 3. Main Workspace: Timeline Grid + Inspector Sidebar */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <TimelineContainer />
        <InspectorSidebar />
      </div>

      {/* 4. Live Tapping Mode Dock (Bottom HUD) */}
      <LiveTappingDock />

      {/* Modals */}
      <MetadataModal
        isOpen={isMetadataOpen}
        onClose={() => setIsMetadataOpen(false)}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}

