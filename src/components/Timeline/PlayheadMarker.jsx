import React, { useRef, useState, useEffect } from 'react';
import { useChartStore } from '../../store/useChartStore';
import { audioManager } from '../../utils/audioManager';

export default function PlayheadMarker({ height = 400 }) {
  const { currentTime, zoom, setCurrentTime, audioDuration } = useChartStore();
  const [dragTime, setDragTime] = useState(null);
  const dragTimeRef = useRef(null);
  const lastAudioSeekTimeRef = useRef(0);

  const activeTime = dragTime !== null ? dragTime : currentTime;
  const leftPosition = activeTime * zoom;

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    const startX = e.clientX;
    const initialTime = currentTime;
    dragTimeRef.current = initialTime;
    setDragTime(initialTime);

    let rafId = null;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const maxDuration = Math.max(1, audioDuration || 3600);
      const newTime = Math.max(0, Math.min(maxDuration, initialTime + deltaX / zoom));
      dragTimeRef.current = newTime;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setDragTime(newTime);
        setCurrentTime(newTime);

        // Throttle actual HTMLAudioElement seek to at most once per 60ms to avoid audio decoder freezing
        const now = performance.now();
        if (now - lastAudioSeekTimeRef.current > 60) {
          lastAudioSeekTimeRef.current = now;
          audioManager.seek(newTime);
        }
      });
    };

    const handleMouseUp = () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      const finalTime = dragTimeRef.current !== null ? dragTimeRef.current : currentTime;
      setDragTime(null);
      dragTimeRef.current = null;

      // Final audio seek
      audioManager.seek(finalTime);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      style={{
        transform: `translate3d(${leftPosition}px, 0, 0)`,
        height: `${height}px`,
        willChange: 'transform'
      }}
      className="absolute top-0 left-0 pointer-events-none z-30 transition-none"
    >
      {/* Top playhead handle / scrubber */}
      <div 
        onMouseDown={handleMouseDown}
        className="w-4 h-5 -ml-2 bg-rose-500 hover:bg-rose-400 active:bg-rose-300 rounded-b cursor-ew-resize pointer-events-auto shadow-lg shadow-rose-500/50 flex items-center justify-center border-t-2 border-white transition-colors select-none"
        title="Geser Playhead (Drag to Scrub)"
      >
        <div className="w-1 h-2 bg-white/90 rounded-full" />
      </div>

      {/* Vertical glowing needle */}
      <div className="w-px h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)] -ml-[0.5px]" />
    </div>
  );
}
