import React from 'react';
import { useChartStore } from '../../store/useChartStore';
import { formatBeat } from '../../utils/chartCalculations';

export default function NoteItem({ note, laneHeight = 88 }) {
  const {
    zoom,
    bpm,
    selectedNoteId,
    selectNote,
    deleteNote
  } = useChartStore();

  const isSelected = selectedNoteId === note.id;
  const isAir = note.lane === 0;
  const isHold = (note.duration || 0) > 0.0001 || note.entityType === 2;

  // Pixel calculations based on exact targetTime and duration
  const leftPx = note.targetTime * zoom;
  const durationPx = Math.max(0, (note.duration || 0) * zoom);
  const widthPx = isHold ? Math.max(34, durationPx) : 28;

  // Colors based on lane
  const bgGradient = isAir
    ? 'from-cyan-500/90 to-blue-600/90 border-cyan-300'
    : 'from-amber-500/90 to-orange-600/90 border-amber-300';
  
  const holdBodyColor = isAir
    ? 'bg-gradient-to-r from-cyan-500/30 to-cyan-500/10 border-cyan-500/50'
    : 'bg-gradient-to-r from-amber-500/30 to-amber-500/10 border-amber-500/50';

  // Click to select note (no dragging)
  const handleClick = (e) => {
    e.stopPropagation();
    selectNote(note.id);
  };

  // Right-click to Delete
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    deleteNote(note.id);
  };

  return (
    <div
      style={{
        left: `${leftPx}px`,
        width: `${widthPx}px`,
        top: '12px',
        height: `${laneHeight - 24}px`,
        zIndex: isSelected ? 30 : 20
      }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={`absolute group cursor-pointer transition-shadow select-none ${
        isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#090a0f]' : 'hover:brightness-110'
      }`}
      title={`Note #${note.id} [${isAir ? 'AIR' : 'GROUND'}] - Target: ${note.targetTime.toFixed(2)}s (Beat ${formatBeat(note.targetBeat)})`}
    >
      {/* If Hold Note: Render stretch bar */}
      {isHold ? (
        <div 
          className={`w-full h-full rounded-md border flex items-center justify-between relative overflow-visible ${holdBodyColor} ${
            isAir ? 'shadow-[0_0_12px_rgba(6,182,212,0.25)]' : 'shadow-[0_0_12px_rgba(245,158,11,0.25)]'
          }`}
        >
          {/* Note Head (Start) */}
          <div className={`w-7 h-full flex-shrink-0 rounded-l-md bg-gradient-to-br ${bgGradient} border-r border-white/30 flex flex-col items-center justify-center text-white shadow-md`}>
            <span className="text-[10px] font-bold font-mono leading-none">
              #{note.id}
            </span>
            <span className="text-[8px] font-mono opacity-80 leading-none mt-0.5">
              {isAir ? 'AIR' : 'GND'}
            </span>
          </div>

          {/* Hold Bar Middle Info */}
          <div className="flex-1 px-2 flex items-center justify-center overflow-hidden pointer-events-none">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-200 whitespace-nowrap drop-shadow">
              <span className="font-semibold text-white">HOLD</span>
              <span className="opacity-75">{note.duration.toFixed(2)}s</span>
              <span className="opacity-60">({formatBeat(note.durationBeats || (note.duration * bpm / 60))}b)</span>
            </div>
          </div>

          {/* Tail end cap */}
          <div className={`w-2.5 h-full flex-shrink-0 rounded-r-md border-l border-white/20 ${
            isAir ? 'bg-cyan-600/70' : 'bg-amber-600/70'
          }`} />
        </div>
      ) : (
        /* Single Note: Solid Block */
        <div
          className={`w-7 h-full rounded-lg border bg-gradient-to-br ${bgGradient} flex flex-col items-center justify-center text-white shadow-lg relative ${
            isAir 
              ? 'shadow-cyan-500/30' 
              : 'shadow-amber-500/30'
          }`}
        >
          <span className="text-[10px] font-bold font-mono leading-none">
            #{note.id}
          </span>
          <span className="text-[8px] font-mono opacity-90 leading-none mt-0.5">
            {isAir ? 'A' : 'G'}
          </span>
        </div>
      )}
    </div>
  );
}
