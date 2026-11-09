import React from 'react';
import { useChartStore } from '../../store/useChartStore';

export default function BeatRuler({ totalWidth, onSeek }) {
  const { bpm, audioOffset, zoom, audioDuration } = useChartStore();

  const secondsPerBeat = 60.0 / (bpm || 120);
  const pixelsPerBeat = secondsPerBeat * zoom;
  const pixelsPerMeasure = pixelsPerBeat * 4;

  const totalMeasures = Math.ceil(totalWidth / pixelsPerMeasure) + 2;
  const offsetPx = ((audioOffset * zoom) % pixelsPerMeasure + pixelsPerMeasure) % pixelsPerMeasure;

  const handleRulerClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const targetSeconds = Math.max(0, clickX / zoom);
    onSeek(targetSeconds);
  };

  // CSS repeating ticks for quarter beats and sub-ticks
  const rulerBgGradients = [
    // Measure tick (full height line)
    `linear-gradient(to right, rgba(203, 213, 225, 0.5) 1px, transparent 1px)`,
    // Beat tick (bottom half)
    `linear-gradient(to right, rgba(148, 163, 184, 0.3) 1px, transparent 1px)`
  ];
  const rulerBgSizes = [
    `${pixelsPerMeasure}px 100%`,
    `${pixelsPerBeat}px 40%`
  ];
  const rulerBgPositions = [
    `${offsetPx}px 0`,
    `${offsetPx}px 100%`
  ];

  return (
    <div 
      onClick={handleRulerClick}
      style={{ 
        width: `${totalWidth}px`,
        backgroundImage: rulerBgGradients.join(', '),
        backgroundSize: rulerBgSizes.join(', '),
        backgroundPosition: rulerBgPositions.join(', '),
        backgroundRepeat: 'repeat-x'
      }}
      className="h-7 bg-[#0b0d14] border-b border-daw-border relative cursor-pointer select-none font-mono text-[10px]"
    >
      {/* Measure number labels */}
      {Array.from({ length: totalMeasures }).map((_, mIdx) => {
        const measureLeft = audioOffset * zoom + mIdx * pixelsPerMeasure;
        if (measureLeft < -100 || measureLeft > totalWidth + 100) return null;

        return (
          <div 
            key={`measure-lbl-${mIdx}`}
            style={{ left: `${measureLeft + 4}px` }}
            className="absolute top-1 pointer-events-none z-10 select-none flex items-center gap-1"
          >
            <span className="text-white font-bold text-[10px] drop-shadow">
              M{mIdx + 1}
            </span>
            <span className="text-[8px] text-slate-500">
              {(mIdx * 4).toFixed(0)}b
            </span>
          </div>
        );
      })}
    </div>
  );
}
