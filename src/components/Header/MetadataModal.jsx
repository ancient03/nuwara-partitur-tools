import React, { useState } from 'react';
import { X, Sliders, Music2, Clock, Gauge, User } from 'lucide-react';
import { useChartStore } from '../../store/useChartStore';

export default function MetadataModal({ isOpen, onClose }) {
  const { 
    songTitle, 
    artist, 
    bpm, 
    audioOffset, 
    approachRateBeats, 
    setMetadata 
  } = useChartStore();

  const [form, setForm] = useState({
    songTitle,
    artist,
    bpm,
    audioOffset,
    approachRateBeats
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setMetadata({
      songTitle: form.songTitle.trim() || 'unknown',
      artist: form.artist.trim(),
      bpm: Math.max(1, parseFloat(form.bpm) || 120.0),
      audioOffset: parseFloat(form.audioOffset) || 0.0,
      approachRateBeats: Math.max(0.1, parseFloat(form.approachRateBeats) || 4.0)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-daw-panel border border-daw-border rounded-xl shadow-2xl p-6 text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-daw-border">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-white">Metadata & Konfigurasi Chart</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-daw-hover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Song Title */}
          <div>
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Music2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Judul Lagu (songTitle)</span>
            </label>
            <input
              type="text"
              value={form.songTitle}
              onChange={(e) => setForm({ ...form, songTitle: e.target.value })}
              placeholder="e.g. Resonance Pulse"
              className="w-full px-3 py-2 bg-daw-input border border-daw-border rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          {/* Artist */}
          <div>
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Artis / Komposer (artist)</span>
            </label>
            <input
              type="text"
              value={form.artist}
              onChange={(e) => setForm({ ...form, artist: e.target.value })}
              placeholder="e.g. Nuwara Sound Team"
              className="w-full px-3 py-2 bg-daw-input border border-daw-border rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          {/* BPM & Approach Rate grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>BPM (Tempo)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                max="600"
                value={form.bpm}
                onChange={(e) => setForm({ ...form, bpm: e.target.value })}
                className="w-full px-3 py-2 bg-daw-input border border-daw-border rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Otomatis sync targetBeat</span>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Approach Rate (Beats)</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="32"
                value={form.approachRateBeats}
                onChange={(e) => setForm({ ...form, approachRateBeats: e.target.value })}
                className="w-full px-3 py-2 bg-daw-input border border-daw-border rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: 4.0 beats</span>
            </div>
          </div>

          {/* Audio Offset */}
          <div>
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Audio Offset (Detik / Seconds)</span>
            </label>
            <input
              type="number"
              step="0.001"
              value={form.audioOffset}
              onChange={(e) => setForm({ ...form, audioOffset: e.target.value })}
              className="w-full px-3 py-2 bg-daw-input border border-daw-border rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Offset untuk sinkronisasi beat awal dengan waveform audio (misal: 0.050 detik).
            </span>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-daw-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-daw-surface hover:bg-daw-hover border border-daw-border text-xs text-slate-300 hover:text-white transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-lg shadow-cyan-900/40 transition"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

