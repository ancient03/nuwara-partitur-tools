import React from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ZoomIn, 
  ZoomOut, 
  Grid, 
  Bell, 
  Headphones, 
  Eye, 
  FastForward,
  Activity,
  MousePointer,
  Pencil,
  Wind,
  Shield
} from 'lucide-react';
import { useChartStore } from '../../store/useChartStore';
import { audioManager } from '../../utils/audioManager';
import { formatTime, formatBeat, timeToBeat } from '../../utils/chartCalculations';

export default function PlaybackToolbar() {
  const {
    isPlaying,
    currentTime,
    audioDuration,
    bpm,
    playbackRate,
    setPlaybackRate,
    zoom,
    setZoom,
    snapDivision,
    setSnapDivision,
    toolMode,
    setToolMode,
    metronomeEnabled,
    setMetronomeEnabled,
    hitsoundsEnabled,
    setHitsoundsEnabled,
    followPlayhead,
    setFollowPlayhead,
    startLiveTap,
    endLiveTap,
    volume,
    isMuted,
    setVolume,
    toggleMute
  } = useChartStore();

  const handlePlayToggle = () => {
    audioManager.togglePlay();
  };

  const handleStop = () => {
    audioManager.pause();
    audioManager.seek(0);
  };

  const handleSeekOffset = (seconds) => {
    audioManager.seek(currentTime + seconds);
  };

  const currentBeat = timeToBeat(currentTime, bpm);

  return (
    <div className="h-12 bg-daw-surface border-b border-daw-border px-4 flex items-center justify-between text-xs select-none">
      {/* Left: Playback transport & time counters */}
      <div className="flex items-center gap-3">
        {/* Play / Pause button */}
        <button
          onClick={handlePlayToggle}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition shadow-lg ${
            isPlaying 
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20' 
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
          }`}
          title="Play / Pause (Spacebar)"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        {/* Stop button */}
        <button
          onClick={handleStop}
          className="w-8 h-8 rounded-lg bg-daw-panel hover:bg-daw-hover border border-daw-border text-slate-300 hover:text-white flex items-center justify-center transition"
          title="Stop & Rewind to Start"
        >
          <Square className="w-4 h-4 fill-current" />
        </button>

        {/* Time display: MM:SS.mmm */}
        <div className="flex items-center bg-daw-panel border border-daw-border rounded-lg px-3 py-1 font-mono">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-semibold text-sm tracking-wider">
                {formatTime(currentTime)}
              </span>
              <span className="text-slate-500 text-xs">/</span>
              <span className="text-slate-400 text-xs">
                {formatTime(audioDuration)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-cyan-400">
              <span>BEAT: {formatBeat(currentBeat)}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">BAR {Math.floor(currentBeat / 4) + 1}.{Math.floor(currentBeat % 4) + 1}</span>
            </div>
          </div>
        </div>

        {/* Playback speed selector */}
        <div className="flex items-center bg-daw-panel border border-daw-border rounded-lg px-2 py-1 gap-1">
          <FastForward className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={playbackRate}
            onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
            className="bg-transparent text-slate-200 text-xs font-mono focus:outline-none cursor-pointer"
            title="Kecepatan Pemutaran Audio"
          >
            <option value="0.25" className="bg-daw-panel text-white">0.25x</option>
            <option value="0.5" className="bg-daw-panel text-white">0.50x</option>
            <option value="0.75" className="bg-daw-panel text-white">0.75x</option>
            <option value="1.0" className="bg-daw-panel text-white">1.00x</option>
            <option value="1.25" className="bg-daw-panel text-white">1.25x</option>
            <option value="1.5" className="bg-daw-panel text-white">1.50x</option>
          </select>
        </div>
      </div>

      {/* Center: Tool Mode, Grid Snap & Metronome / Hitsounds */}
      <div className="flex items-center gap-2.5">
        {/* Tool Mode: Select vs Draw */}
        <div className="flex items-center bg-daw-panel border border-daw-border rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setToolMode('select')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
              toolMode === 'select'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mode Pilih & Navigasi (V): Klik timeline untuk menggeser playhead tanpa menambah note"
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pilih (V)</span>
          </button>

          <button
            onClick={() => setToolMode('draw')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
              toolMode === 'draw'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mode Pensil (B): Klik timeline untuk menaruh note manual"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pensil (B)</span>
          </button>
        </div>

        {/* Quick Add Note at Playhead */}
        <div className="flex items-center gap-1 bg-daw-panel border border-daw-border rounded-lg p-0.5">
          <button
            onClick={() => {
              startLiveTap(0);
              endLiveTap(0);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono font-semibold text-cyan-300 hover:bg-cyan-950/80 hover:text-white transition"
            title="Tambah Note di Lane 0 (AIR) pada posisi playhead (Key F)"
          >
            <Wind className="w-3 h-3 text-cyan-400" />
            <span>+Air [F]</span>
          </button>
          <button
            onClick={() => {
              startLiveTap(1);
              endLiveTap(1);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono font-semibold text-amber-300 hover:bg-amber-950/80 hover:text-white transition"
            title="Tambah Note di Lane 1 (GROUND) pada posisi playhead (Key J)"
          >
            <Shield className="w-3 h-3 text-amber-400" />
            <span>+Gnd [J]</span>
          </button>
        </div>

        {/* Beat Snapping dropdown */}
        <div className="flex items-center bg-daw-panel border border-daw-border rounded-lg px-2 py-1 gap-1.5">
          <Grid className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 text-[11px] font-medium hidden md:inline">Snap:</span>
          <select
            value={snapDivision}
            onChange={(e) => setSnapDivision(parseInt(e.target.value, 10))}
            className="bg-transparent text-cyan-300 font-semibold text-xs font-mono focus:outline-none cursor-pointer"
            title="Grid Snapping Division"
          >
            <option value="0" className="bg-daw-panel text-white">Free (No Snap)</option>
            <option value="4" className="bg-daw-panel text-white">1/4 (Beat)</option>
            <option value="8" className="bg-daw-panel text-white">1/8 (Half-Beat)</option>
            <option value="12" className="bg-daw-panel text-white">1/12 (Triplet)</option>
            <option value="16" className="bg-daw-panel text-white">1/16 (Quarter-Beat)</option>
            <option value="32" className="bg-daw-panel text-white">1/32 (32nd)</option>
          </select>
        </div>

        {/* Metronome Toggle */}
        <button
          onClick={() => setMetronomeEnabled(!metronomeEnabled)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
            metronomeEnabled
              ? 'bg-amber-950/60 border-amber-600/60 text-amber-300'
              : 'bg-daw-panel border-daw-border text-slate-400 hover:text-slate-200'
          }`}
          title="Metronome / Click Track"
        >
          <Bell className={`w-3.5 h-3.5 ${metronomeEnabled ? 'text-amber-400 animate-pulse' : ''}`} />
          <span className="hidden lg:inline">Metronome</span>
        </button>

        {/* Hitsounds Toggle */}
        <button
          onClick={() => setHitsoundsEnabled(!hitsoundsEnabled)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
            hitsoundsEnabled
              ? 'bg-cyan-950/60 border-cyan-600/60 text-cyan-300'
              : 'bg-daw-panel border-daw-border text-slate-400 hover:text-slate-200'
          }`}
          title="Hitsound saat playhead melintasi note"
        >
          <Headphones className={`w-3.5 h-3.5 ${hitsoundsEnabled ? 'text-cyan-400' : ''}`} />
          <span className="hidden lg:inline">Hitsounds</span>
        </button>

        {/* Follow Playhead */}
        <button
          onClick={() => setFollowPlayhead(!followPlayhead)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
            followPlayhead
              ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300'
              : 'bg-daw-panel border-daw-border text-slate-400 hover:text-slate-200'
          }`}
          title="Auto-scroll timeline mengikuti posisi pemutaran lagu"
        >
          <Eye className={`w-3.5 h-3.5 ${followPlayhead ? 'text-emerald-400' : ''}`} />
          <span className="hidden lg:inline">Follow</span>
        </button>
      </div>

      {/* Right: Zoom slider & Volume */}
      <div className="flex items-center gap-4">
        {/* Zoom controls */}
        <div className="flex items-center gap-1.5 bg-daw-panel border border-daw-border rounded-lg px-2 py-1">
          <button
            onClick={() => setZoom(zoom - 40)}
            className="text-slate-400 hover:text-white p-0.5 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <input
            type="range"
            min="60"
            max="800"
            step="20"
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value, 10))}
            className="w-20 cursor-ew-resize"
            title={`Zoom: ${zoom} px/sec`}
          />
          <button
            onClick={() => setZoom(zoom + 40)}
            className="text-slate-400 hover:text-white p-0.5 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-400 w-9 text-right">{zoom}px</span>
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-white transition"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-slate-300" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 cursor-pointer"
            title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
          />
        </div>
      </div>
    </div>
  );
}

