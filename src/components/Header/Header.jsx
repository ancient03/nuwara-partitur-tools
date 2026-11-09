import React, { useState, useRef } from 'react';
import { 
  Music, 
  Settings, 
  Upload, 
  Download, 
  FileJson, 
  HelpCircle, 
  Undo2, 
  Redo2, 
  PlayCircle, 
  Sparkles,
  Layers
} from 'lucide-react';
import { useChartStore } from '../../store/useChartStore';
import { audioManager } from '../../utils/audioManager';
import { generateSyntheticDemoTrack } from '../../utils/synthDemoTrack';

export default function Header({ onOpenMetadata, onOpenExport, onOpenHelp }) {
  const {
    songTitle,
    artist,
    bpm,
    audioOffset,
    approachRateBeats,
    notes,
    audioFileName,
    setAudioFile,
    setAudioDuration,
    importChart,
    undo,
    redo,
    historyIndex,
    history
  } = useChartStore();

  const fileInputRef = useRef(null);
  const jsonInputRef = useRef(null);
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);

  // Audio file picker handler
  const handleAudioUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    audioManager.loadAudio(file);
    setAudioFile(file, file.name);

    // Read duration
    const tempAudio = new Audio();
    tempAudio.src = URL.createObjectURL(file);
    tempAudio.onloadedmetadata = () => {
      setAudioDuration(tempAudio.duration);
    };
  };

  // Generate synthetic rhythm track
  const handleGenerateDemoTrack = async () => {
    setIsGeneratingDemo(true);
    try {
      const wavBlob = generateSyntheticDemoTrack(bpm, 64);
      audioManager.loadAudio(wavBlob);
      setAudioFile(wavBlob, `Demo: Resonance Pulse (${bpm} BPM).wav`);
      setAudioDuration(32.0);
    } catch (err) {
      console.error("Demo track generation failed:", err);
      alert("Gagal membuat track demo: " + err.message);
    } finally {
      setIsGeneratingDemo(false);
    }
  };

  // JSON chart import handler
  const handleJsonImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        importChart(text);
        alert(`Berhasil mengimpor chart "${file.name}"!`);
      } catch (err) {
        alert("Gagal mengimpor JSON: " + err.message);
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <header className="h-14 bg-daw-surface border-b border-daw-border px-4 flex items-center justify-between select-none">
      {/* Brand & Game title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide text-white uppercase">Nuwara Chart Editor</span>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
              Resonance Engine
            </span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>2D Action-Rhythm Tooling</span>
            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
            <span>Unity C# Schema</span>
          </p>
        </div>
      </div>

      {/* Song Metadata Badge (Clickable to edit) */}
      <button 
        onClick={onOpenMetadata}
        className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-daw-panel hover:bg-daw-hover border border-daw-border transition group"
        title="Edit Metadata Lagu"
      >
        <Music className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
        <div className="text-left">
          <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
            {songTitle || 'unknown'}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-2 font-mono">
            {artist && <span>by {artist}</span>}
            <span className="text-cyan-500 font-bold">{bpm} BPM</span>
            <span className="text-slate-500">Offset: {audioOffset}s</span>
            <span className="text-amber-500 font-medium">AR: {approachRateBeats}</span>
          </div>
        </div>
        <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
      </button>

      {/* File & Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Undo & Redo */}
        <div className="flex items-center bg-daw-panel rounded-lg p-0.5 border border-daw-border mr-1">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-1.5 text-slate-400 hover:text-white disabled:text-slate-600 disabled:hover:text-slate-600 rounded transition"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 text-slate-400 hover:text-white disabled:text-slate-600 disabled:hover:text-slate-600 rounded transition"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Audio File Loader */}
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="audio/*,.mp3,.wav,.ogg,.flac" 
          onChange={handleAudioUpload} 
          className="hidden" 
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-daw-panel hover:bg-daw-hover border border-daw-border text-xs text-slate-300 hover:text-white transition"
          title="Upload file audio (.mp3, .wav)"
        >
          <Upload className="w-3.5 h-3.5 text-slate-400" />
          <span>Upload Audio</span>
        </button>

        {/* Demo track generator */}
        <button
          onClick={handleGenerateDemoTrack}
          disabled={isGeneratingDemo}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-daw-panel hover:bg-daw-hover border border-daw-border text-xs text-slate-300 hover:text-white transition"
          title="Buat Audio Demo Elektronik 120 BPM Otomatis"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isGeneratingDemo ? 'Synthesizing...' : 'Demo Track'}</span>
        </button>

        <div className="h-4 w-px bg-daw-border mx-1" />

        {/* Import JSON */}
        <input 
          ref={jsonInputRef} 
          type="file" 
          accept=".json" 
          onChange={handleJsonImport} 
          className="hidden" 
        />
        <button
          onClick={() => jsonInputRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-daw-panel hover:bg-daw-hover border border-daw-border text-xs text-slate-300 hover:text-white transition"
          title="Import chart dari file JSON Unity"
        >
          <FileJson className="w-3.5 h-3.5 text-emerald-400" />
          <span>Import JSON</span>
        </button>

        {/* Export JSON */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-cyan-900/30 transition"
          title="Ekspor chart ke JSON Unity C#"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export JSON</span>
        </button>

        {/* Help button */}
        <button
          onClick={onOpenHelp}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-daw-panel border border-transparent hover:border-daw-border transition"
          title="Bantuan & Keyboard Shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

