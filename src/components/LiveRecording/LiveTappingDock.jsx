import React, { useEffect, useState } from 'react';
import { Radio, Keyboard, Wind, Shield, Sparkles } from 'lucide-react';
import { useChartStore } from '../../store/useChartStore';

export default function LiveTappingDock() {
  const {
    isPlaying,
    activeHoldNotes,
    startLiveTap,
    endLiveTap,
    isLiveTappingMode
  } = useChartStore();

  const isFActive = !!activeHoldNotes[0];
  const isJActive = !!activeHoldNotes[1];

  return (
    <div className="h-16 bg-[#0a0c14] border-t border-daw-border px-6 flex items-center justify-between select-none shadow-2xl">
      {/* Left indicator & instructions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-daw-panel border border-daw-border">
          <Radio className={`w-3.5 h-3.5 ${isPlaying ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`} />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
            {isPlaying ? 'Live Recording Active' : 'Ready (Press Space to Play)'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 hidden md:block">
          Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 text-cyan-300 font-mono text-[10px]">F</kbd> untuk Air (Lane 0) dan <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 text-amber-300 font-mono text-[10px]">J</kbd> untuk Ground (Lane 1). Tahan tombol untuk membuat Hold Note.
        </p>
      </div>

      {/* Center / Right: Interactive Tapping Pads */}
      <div className="flex items-center gap-4">
        {/* F Key: Air Lane 0 Pad */}
        <button
          onMouseDown={() => startLiveTap(0)}
          onMouseUp={() => endLiveTap(0)}
          onMouseLeave={() => isFActive && endLiveTap(0)}
          className={`flex items-center gap-3 px-5 py-2 rounded-xl border font-mono transition-all duration-75 shadow-lg active:scale-95 ${
            isFActive
              ? 'bg-cyan-500 text-slate-950 border-white ring-4 ring-cyan-500/50 scale-105 shadow-cyan-500/50'
              : 'bg-daw-panel border-cyan-800/60 text-slate-200 hover:border-cyan-500/70'
          }`}
          title="Tekan atau klik untuk rekam Note di Lane 0 (AIR)"
        >
          <div className="w-6 h-6 rounded bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400 text-xs font-bold">
            F
          </div>
          <div className="text-left">
            <span className="text-xs font-bold tracking-wide uppercase block">AIR LANE 0</span>
            <span className="text-[9px] text-slate-400 opacity-90 block">
              {isFActive ? 'HOLDING...' : 'Tap or Hold'}
            </span>
          </div>
        </button>

        {/* J Key: Ground Lane 1 Pad */}
        <button
          onMouseDown={() => startLiveTap(1)}
          onMouseUp={() => endLiveTap(1)}
          onMouseLeave={() => isJActive && endLiveTap(1)}
          className={`flex items-center gap-3 px-5 py-2 rounded-xl border font-mono transition-all duration-75 shadow-lg active:scale-95 ${
            isJActive
              ? 'bg-amber-500 text-slate-950 border-white ring-4 ring-amber-500/50 scale-105 shadow-amber-500/50'
              : 'bg-daw-panel border-amber-800/60 text-slate-200 hover:border-amber-500/70'
          }`}
          title="Tekan atau klik untuk rekam Note di Lane 1 (GROUND)"
        >
          <div className="w-6 h-6 rounded bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400 text-xs font-bold">
            J
          </div>
          <div className="text-left">
            <span className="text-xs font-bold tracking-wide uppercase block">GROUND LANE 1</span>
            <span className="text-[9px] text-slate-400 opacity-90 block">
              {isJActive ? 'HOLDING...' : 'Tap or Hold'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

