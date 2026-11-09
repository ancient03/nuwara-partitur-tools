import React, { useRef, useEffect } from 'react';
import { Wind, Shield, Activity, Volume2, Sparkles } from 'lucide-react';
import { useChartStore } from '../../store/useChartStore';
import { audioManager } from '../../utils/audioManager';
import BeatRuler from './BeatRuler';
import WaveformView from '../AudioPlayer/WaveformView';
import LaneTrack from './LaneTrack';
import PlayheadMarker from './PlayheadMarker';

export default function TimelineContainer() {
  const {
    zoom,
    setZoom,
    audioDuration,
    currentTime,
    followPlayhead,
    isPlaying
  } = useChartStore();

  const scrollContainerRef = useRef(null);
  const totalWidth = Math.max(1200, (audioDuration || 60) * zoom + 600);

  // Auto-scroll when followPlayhead is active and playing (Butter-smooth, zero jitter)
  useEffect(() => {
    if (!followPlayhead || !scrollContainerRef.current || !isPlaying) return;

    const container = scrollContainerRef.current;
    const playheadPx = currentTime * zoom;
    const containerWidth = container.clientWidth;
    const scrollLeft = container.scrollLeft;

    // Keep playhead comfortably visible ahead without interrupting scroll threads
    if (playheadPx > scrollLeft + containerWidth * 0.75) {
      container.scrollLeft = playheadPx - containerWidth * 0.25;
    } else if (playheadPx < scrollLeft) {
      container.scrollLeft = Math.max(0, playheadPx - 60);
    }
  }, [currentTime, followPlayhead, zoom, isPlaying]);

  // Handle Alt + Wheel or Ctrl + Wheel for Timeline Zooming
  const handleWheel = (e) => {
    if (e.altKey || e.ctrlKey) {
      e.preventDefault();
      const zoomDelta = e.deltaY > 0 ? -30 : 30;
      setZoom(zoom + zoomDelta);
    }
  };

  const handleSeek = (seconds) => {
    audioManager.seek(seconds);
  };

  const laneHeight = 92;
  const totalHeight = 28 + 64 + laneHeight * 2; // ruler + waveform + 2 lanes

  return (
    <div 
      className="flex-1 flex overflow-hidden bg-daw-bg select-none"
      onWheel={handleWheel}
    >
      {/* Fixed Left Header Column (Lane & Track Labels) */}
      <div className="w-48 flex-shrink-0 bg-[#0d0f17] border-r border-daw-border flex flex-col z-20 shadow-xl">
        {/* Ruler Header label */}
        <div className="h-7 bg-[#0b0d14] border-b border-daw-border px-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>TIMELINE</span>
          <span className="text-cyan-500 font-bold">4/4</span>
        </div>

        {/* Waveform Header label */}
        <div className="h-16 bg-[#0c0e17] border-b border-daw-border px-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-xs font-semibold text-slate-200">Audio Wave</div>
            <div className="text-[10px] text-slate-500 font-mono">Stereo Peaks</div>
          </div>
        </div>

        {/* Lane 0: AIR Header */}
        <div 
          style={{ height: `${laneHeight}px` }}
          className="border-b border-daw-border px-3 flex flex-col justify-center bg-[#0d1220]/80 relative"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400 shadow-sm">
                <Wind className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-cyan-400 tracking-wide uppercase">LANE 0: AIR</span>
                <span className="text-[9px] block text-slate-400">Top / Airborne notes</span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-cyan-900/60 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300">
              KEY [F]
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
            <span>entityType: 0 / 2</span>
          </div>
        </div>

        {/* Lane 1: GROUND Header */}
        <div 
          style={{ height: `${laneHeight}px` }}
          className="border-b border-daw-border px-3 flex flex-col justify-center bg-[#17130d]/80 relative"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-950 border border-amber-700/60 flex items-center justify-center text-amber-400 shadow-sm">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-400 tracking-wide uppercase">LANE 1: GROUND</span>
                <span className="text-[9px] block text-slate-400">Bottom / Surface notes</span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-amber-900/60 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300">
              KEY [J]
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
            <span>entityType: 0 / 2</span>
          </div>
        </div>

        {/* Timeline Tips at bottom of left panel */}
        <div className="flex-1 p-3 text-[10px] text-slate-500 flex flex-col justify-end space-y-1">
          <p className="flex items-center gap-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Klik lane untuk tambah note</span>
          </p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Tarik ujung untuk Hold note</span>
          </p>
          <p className="text-slate-600 font-mono">Alt + Scroll untuk Zoom</p>
        </div>
      </div>

      {/* Main Horizontal Scrollable Canvas */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden relative bg-[#090a0f]"
      >
        <div style={{ width: `${totalWidth}px`, height: '100%' }} className="relative">
          {/* Top Beat Ruler */}
          <BeatRuler totalWidth={totalWidth} onSeek={handleSeek} />

          {/* Audio Waveform Track */}
          <WaveformView scrollContainerRef={scrollContainerRef} />

          {/* Lane 0: Air Track */}
          <LaneTrack laneNumber={0} totalWidth={totalWidth} laneHeight={laneHeight} />

          {/* Lane 1: Ground Track */}
          <LaneTrack laneNumber={1} totalWidth={totalWidth} laneHeight={laneHeight} />

          {/* Playhead Marker */}
          <PlayheadMarker height={totalHeight} />
        </div>
      </div>
    </div>
  );
}

