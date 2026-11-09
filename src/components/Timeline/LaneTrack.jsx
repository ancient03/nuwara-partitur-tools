import React from 'react';
import { useChartStore } from '../../store/useChartStore';
import { snapTimeToGrid } from '../../utils/chartCalculations';
import { audioManager } from '../../utils/audioManager';
import NoteItem from './NoteItem';

export default function LaneTrack({ laneNumber = 0, totalWidth, laneHeight = 88 }) {
  const {
    notes,
    zoom,
    bpm,
    audioOffset,
    snapDivision,
    toolMode,
    selectNote,
    addNote
  } = useChartStore();

  const isAir = laneNumber === 0;
  const laneNotes = notes.filter((n) => n.lane === laneNumber);

  // Measure & Beat pixel widths for GPU-accelerated CSS Grid
  const secondsPerBeat = 60.0 / (bpm || 120);
  const pixelsPerBeat = secondsPerBeat * zoom;
  const pixelsPerMeasure = pixelsPerBeat * 4;
  const offsetPx = ((audioOffset * zoom) % pixelsPerMeasure + pixelsPerMeasure) % pixelsPerMeasure;

  // GPU-accelerated CSS repeating backgrounds (Zero DOM overhead!)
  let bgGradients = [
    // 1. Measure boundary line (solid)
    `linear-gradient(to right, rgba(148, 163, 184, 0.35) 1px, transparent 1px)`,
    // 2. Quarter beat lines (subtle)
    `linear-gradient(to right, rgba(100, 116, 139, 0.15) 1px, transparent 1px)`
  ];
  let bgSizes = [
    `${pixelsPerMeasure}px 100%`,
    `${pixelsPerBeat}px 100%`
  ];
  let bgPositions = [
    `${offsetPx}px 0`,
    `${offsetPx}px 0`
  ];

  // Optional sub-beat lines if zoomed in and snap division is 8 or 16
  if (snapDivision >= 8 && pixelsPerBeat >= 40) {
    const pixelsPerSubBeat = pixelsPerBeat / (snapDivision === 16 ? 4 : 2);
    bgGradients.push(`linear-gradient(to right, rgba(71, 85, 105, 0.1) 1px, transparent 1px)`);
    bgSizes.push(`${pixelsPerSubBeat}px 100%`);
    bgPositions.push(`${offsetPx}px 0`);
  }

  // Calculate snapped time from mouse event
  const getTimeFromEvent = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const rawTime = Math.max(0, clickX / zoom);
    if (snapDivision > 0) {
      return snapTimeToGrid(rawTime, bpm, audioOffset, snapDivision);
    }
    return rawTime;
  };

  // Track Single Click: In Select Mode, seek playhead without creating notes!
  // In Draw Mode: Add note
  const handleTrackClick = (e) => {
    if (e.button !== 0) return;
    const finalTime = getTimeFromEvent(e);

    if (toolMode === 'draw') {
      audioManager.playHitsound(laneNumber);
      addNote({
        lane: laneNumber,
        targetTime: finalTime,
        duration: 0.0,
        tickRate: 4
      });
    } else {
      // Select / Seek Mode: Just move the playhead to clicked beat & deselect
      selectNote(null);
      audioManager.seek(finalTime);
    }
  };

  // Track Double Click: Convenient way to add a note even in Select mode
  const handleTrackDoubleClick = (e) => {
    if (e.button !== 0) return;
    const finalTime = getTimeFromEvent(e);
    audioManager.playHitsound(laneNumber);
    addNote({
      lane: laneNumber,
      targetTime: finalTime,
      duration: 0.0,
      tickRate: 4
    });
  };

  return (
    <div
      style={{ height: `${laneHeight}px` }}
      className={`relative border-b border-daw-border select-none flex items-center ${
        isAir ? 'bg-[#0a0d16]' : 'bg-[#0f0d0a]'
      }`}
    >
      {/* Interactive Track Area with GPU repeating grid */}
      <div
        onClick={handleTrackClick}
        onDoubleClick={handleTrackDoubleClick}
        style={{ 
          width: `${totalWidth}px`, 
          height: '100%',
          backgroundImage: bgGradients.join(', '),
          backgroundSize: bgSizes.join(', '),
          backgroundPosition: bgPositions.join(', '),
          backgroundRepeat: 'repeat-x'
        }}
        className={`relative overflow-hidden ${
          toolMode === 'draw' ? 'cursor-crosshair' : 'cursor-pointer'
        }`}
        title={
          toolMode === 'draw'
            ? 'Mode Pensil: Klik untuk menambah note'
            : 'Klik untuk menggeser playhead ke posisi ini • Double-click untuk menambah note'
        }
      >
        {/* Render Notes */}
        {laneNotes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            laneHeight={laneHeight}
          />
        ))}
      </div>
    </div>
  );
}
