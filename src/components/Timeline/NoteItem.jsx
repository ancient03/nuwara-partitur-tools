import React, { useRef, useState, useEffect } from 'react';
import { useChartStore } from '../../store/useChartStore';
import { snapTimeToGrid, formatBeat } from '../../utils/chartCalculations';

export default function NoteItem({ note, laneHeight = 88 }) {
  const {
    zoom,
    bpm,
    audioOffset,
    snapDivision,
    selectedNoteId,
    selectNote,
    updateNote,
    deleteNote
  } = useChartStore();

  const isSelected = selectedNoteId === note.id;
  const isAir = note.lane === 0;

  // Local drag state for ultra-smooth 60+ FPS positioning
  const [dragState, setDragState] = useState(null); // { deltaX, deltaY, previewTime, previewLane }
  const [resizeState, setResizeState] = useState(null); // { deltaX, previewDuration }

  const effectiveLane = dragState ? dragState.previewLane : note.lane;
  const isEffectiveAir = effectiveLane === 0;
  const effectiveTargetTime = dragState ? dragState.previewTime : note.targetTime;
  const effectiveDuration = resizeState ? resizeState.previewDuration : (note.duration || 0);

  const isHold = effectiveDuration > 0.0001 || (note.entityType === 2 && !resizeState);

  // Pixel calculations
  const baseLeftPx = note.targetTime * zoom;
  const currentLeftPx = effectiveTargetTime * zoom;
  const durationPx = Math.max(0, effectiveDuration * zoom);
  const widthPx = isHold ? Math.max(34, durationPx) : 28;

  // Y-offset translation if dragging vertically between lanes
  const translateY = dragState ? dragState.deltaY : 0;
  const translateX = dragState ? (currentLeftPx - baseLeftPx) : 0;

  // Colors based on effective lane
  const bgGradient = isEffectiveAir
    ? 'from-cyan-500/90 to-blue-600/90 border-cyan-300'
    : 'from-amber-500/90 to-orange-600/90 border-amber-300';
  
  const holdBodyColor = isEffectiveAir
    ? 'bg-gradient-to-r from-cyan-500/30 to-cyan-500/10 border-cyan-500/50'
    : 'bg-gradient-to-r from-amber-500/30 to-amber-500/10 border-amber-500/50';

  // Drag Body to Move TargetTime & Lane (Butter smooth)
  const handleBodyMouseDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    selectNote(note.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialTime = note.targetTime;
    const initialLane = note.lane;

    let rafId = null;

    const handleMouseMove = (moveEvent) => {
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        let rawTime = Math.max(0, initialTime + deltaX / zoom);
        let previewTime = rawTime;
        if (snapDivision > 0) {
          previewTime = snapTimeToGrid(rawTime, bpm, audioOffset, snapDivision);
        }

        let previewLane = initialLane;
        if (initialLane === 0 && deltaY > 40) {
          previewLane = 1;
        } else if (initialLane === 1 && deltaY < -40) {
          previewLane = 0;
        }

        setDragState({
          deltaX,
          deltaY,
          previewTime,
          previewLane
        });
      });
    };

    const handleMouseUp = (upEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      const deltaX = upEvent.clientX - startX;
      const deltaY = upEvent.clientY - startY;

      // If user merely clicked without significant drag, do not modify note
      if (Math.abs(deltaX) < 3 && Math.abs(deltaY) < 3) {
        setDragState(null);
        return;
      }

      let rawTime = Math.max(0, initialTime + deltaX / zoom);
      let finalTime = rawTime;
      if (snapDivision > 0) {
        finalTime = snapTimeToGrid(rawTime, bpm, audioOffset, snapDivision);
      }

      let finalLane = initialLane;
      if (initialLane === 0 && deltaY > 40) {
        finalLane = 1;
      } else if (initialLane === 1 && deltaY < -40) {
        finalLane = 0;
      }

      setDragState(null);

      // Commit final state to store with history
      updateNote(note.id, {
        targetTime: finalTime,
        lane: finalLane
      }, true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Drag Right Edge to Resize Duration (Butter smooth)
  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    selectNote(note.id);

    const startX = e.clientX;
    const initialDuration = note.duration || 0;
    const initialTargetTime = note.targetTime;

    let rafId = null;

    const handleMouseMove = (moveEvent) => {
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const deltaX = moveEvent.clientX - startX;
        let rawDuration = Math.max(0, initialDuration + deltaX / zoom);
        let previewDuration = rawDuration;

        if (snapDivision > 0) {
          const endTime = initialTargetTime + rawDuration;
          const snappedEndTime = snapTimeToGrid(endTime, bpm, audioOffset, snapDivision);
          previewDuration = Math.max(0, snappedEndTime - initialTargetTime);
        }

        setResizeState({
          deltaX,
          previewDuration
        });
      });
    };

    const handleMouseUp = (upEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      const deltaX = upEvent.clientX - startX;
      let rawDuration = Math.max(0, initialDuration + deltaX / zoom);
      let finalDuration = rawDuration;

      if (snapDivision > 0) {
        const endTime = initialTargetTime + rawDuration;
        const snappedEndTime = snapTimeToGrid(endTime, bpm, audioOffset, snapDivision);
        finalDuration = Math.max(0, snappedEndTime - initialTargetTime);
      }

      setResizeState(null);

      updateNote(note.id, {
        duration: finalDuration,
        entityType: finalDuration > 0.0001 ? 2 : 0
      }, true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Right-click to Delete
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    deleteNote(note.id);
  };

  const isDragging = !!dragState;
  const isResizing = !!resizeState;

  return (
    <div
      style={{
        left: `${baseLeftPx}px`,
        width: `${widthPx}px`,
        top: '12px',
        height: `${laneHeight - 24}px`,
        transform: isDragging 
          ? `translate3d(${translateX}px, ${translateY}px, 0)` 
          : 'translate3d(0, 0, 0)',
        willChange: isDragging || isResizing ? 'transform, width' : 'auto',
        zIndex: isDragging ? 50 : (isSelected ? 30 : 20)
      }}
      onContextMenu={handleContextMenu}
      className={`absolute group transition-shadow select-none ${
        isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#090a0f]' : ''
      }`}
    >
      {/* If Hold Note: Render stretch body */}
      {isHold ? (
        <div 
          onMouseDown={handleBodyMouseDown}
          className={`w-full h-full rounded-md border flex items-center justify-between relative cursor-grab active:cursor-grabbing overflow-visible ${holdBodyColor} ${
            isEffectiveAir ? 'shadow-[0_0_12px_rgba(6,182,212,0.25)]' : 'shadow-[0_0_12px_rgba(245,158,11,0.25)]'
          }`}
        >
          {/* Note Head (Start) */}
          <div className={`w-7 h-full flex-shrink-0 rounded-l-md bg-gradient-to-br ${bgGradient} border-r border-white/30 flex flex-col items-center justify-center text-white shadow-md`}>
            <span className="text-[10px] font-bold font-mono leading-none">
              #{note.id}
            </span>
            <span className="text-[8px] font-mono opacity-80 leading-none mt-0.5">
              {isEffectiveAir ? 'AIR' : 'GND'}
            </span>
          </div>

          {/* Hold Bar Middle Info */}
          <div className="flex-1 px-2 flex items-center justify-center overflow-hidden pointer-events-none">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-200 whitespace-nowrap drop-shadow">
              <span className="font-semibold text-white">HOLD</span>
              <span className="opacity-75">{effectiveDuration.toFixed(2)}s</span>
              <span className="opacity-60">({formatBeat(effectiveDuration * (bpm / 60))}b)</span>
            </div>
          </div>

          {/* Resize Handle (Right edge tail) */}
          <div
            onMouseDown={handleResizeMouseDown}
            className={`w-4 h-full flex-shrink-0 rounded-r-md cursor-ew-resize flex items-center justify-center transition-colors ${
              isEffectiveAir ? 'bg-cyan-600/80 hover:bg-cyan-400' : 'bg-amber-600/80 hover:bg-amber-400'
            }`}
            title="Tarik untuk mengubah durasi Hold Note"
          >
            <div className="flex flex-col gap-0.5 pointer-events-none">
              <span className="w-1 h-1 rounded-full bg-white/90" />
              <span className="w-1 h-1 rounded-full bg-white/90" />
              <span className="w-1 h-1 rounded-full bg-white/90" />
            </div>
          </div>
        </div>
      ) : (
        /* Single Note: Compact Diamond / Circular Block */
        <div
          onMouseDown={handleBodyMouseDown}
          className={`w-7 h-full rounded-lg border bg-gradient-to-br ${bgGradient} flex flex-col items-center justify-center text-white cursor-grab active:cursor-grabbing shadow-lg relative ${
            isEffectiveAir 
              ? 'shadow-cyan-500/30 hover:shadow-cyan-400/50' 
              : 'shadow-amber-500/30 hover:shadow-amber-400/50'
          }`}
        >
          <span className="text-[10px] font-bold font-mono leading-none">
            #{note.id}
          </span>
          <span className="text-[8px] font-mono opacity-90 leading-none mt-0.5">
            {isEffectiveAir ? 'A' : 'G'}
          </span>

          {/* Quick resize pin on hover so single note can be dragged into a hold note! */}
          <div
            onMouseDown={handleResizeMouseDown}
            className="absolute -right-1.5 top-0 bottom-0 w-3 cursor-ew-resize opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            title="Tarik ke kanan untuk mengubah jadi Hold Note"
          >
            <div className="w-1.5 h-6 rounded-full bg-white shadow-md" />
          </div>
        </div>
      )}
    </div>
  );
}
