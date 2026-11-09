import React from 'react';
import { 
  Sliders, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Wind, 
  Shield, 
  Clock, 
  Layers, 
  Hash, 
  Zap 
} from 'lucide-react';
import { useChartStore } from '../../store/useChartStore';
import { audioManager } from '../../utils/audioManager';
import { formatTime, formatBeat } from '../../utils/chartCalculations';

export default function NoteProperties() {
  const {
    notes,
    selectedNoteId,
    updateNote,
    deleteNote,
    duplicateNote
  } = useChartStore();

  const note = notes.find((n) => n.id === selectedNoteId);

  if (!note) {
    return (
      <div className="p-6 text-center text-slate-500 text-xs">
        <Sliders className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
        <p className="font-semibold text-slate-400">Tidak ada note terpilih</p>
        <p className="text-[11px] mt-1 text-slate-500">
          Klik sebuah note di timeline atau tabel di bawah untuk melihat dan mengedit atributnya.
        </p>
      </div>
    );
  }

  const isAir = note.lane === 0;
  const isHold = note.duration > 0.0001 || note.entityType === 2;

  const handleJumpToTime = () => {
    audioManager.seek(note.targetTime);
  };

  return (
    <div className="p-4 space-y-4 text-xs font-sans">
      {/* Note Header & Quick Actions */}
      <div className="flex items-center justify-between pb-3 border-b border-daw-border">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
            isAir 
              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' 
              : 'bg-amber-950 text-amber-400 border border-amber-800'
          }`}>
            Note #{note.id}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {isHold ? 'Hold Note (2)' : 'Single Note (0)'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleJumpToTime}
            className="p-1.5 rounded hover:bg-daw-hover text-slate-400 hover:text-cyan-400 transition"
            title="Lompat ke waktu note ini"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => duplicateNote(note.id)}
            className="p-1.5 rounded hover:bg-daw-hover text-slate-400 hover:text-white transition"
            title="Duplikat note ini"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => deleteNote(note.id)}
            className="p-1.5 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition"
            title="Hapus note (Delete)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Lane Selector */}
      <div>
        <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">
          Lane (Jalur Partitur)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => updateNote(note.id, { lane: 0 })}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-xs font-semibold transition ${
              note.lane === 0
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-950'
                : 'bg-daw-input border-daw-border text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>0: Air [F]</span>
          </button>

          <button
            type="button"
            onClick={() => updateNote(note.id, { lane: 1 })}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-xs font-semibold transition ${
              note.lane === 1
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-sm shadow-amber-950'
                : 'bg-daw-input border-daw-border text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>1: Ground [J]</span>
          </button>
        </div>
      </div>

      {/* Entity Type Toggle */}
      <div>
        <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">
          Tipe Entitas (entityType)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => updateNote(note.id, { entityType: 0 })}
            className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition ${
              note.entityType === 0
                ? 'bg-slate-800 border-slate-500 text-white shadow-sm'
                : 'bg-daw-input border-daw-border text-slate-400 hover:text-slate-200'
            }`}
          >
            0: Single Note
          </button>
          <button
            type="button"
            onClick={() => updateNote(note.id, { entityType: 2 })}
            className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition ${
              note.entityType === 2
                ? 'bg-cyan-950/90 border-cyan-500 text-cyan-300 shadow-sm'
                : 'bg-daw-input border-daw-border text-slate-400 hover:text-slate-200'
            }`}
          >
            2: Hold Note
          </button>
        </div>
      </div>

      {/* Target Time & Target Beat (Dual Inputs) */}
      <div className="grid grid-cols-2 gap-3 bg-daw-surface p-3 rounded-xl border border-daw-border">
        <div>
          <label className="text-[10px] font-mono font-medium text-slate-400 block mb-1">
            targetTime (detik)
          </label>
          <input
            type="number"
            step="0.001"
            min="0"
            value={note.targetTime}
            onChange={(e) => updateNote(note.id, { targetTime: parseFloat(e.target.value) || 0 })}
            className="w-full px-2 py-1.5 bg-daw-input border border-daw-border rounded text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          />
          <span className="text-[9px] text-slate-500 font-mono mt-1 block">
            {formatTime(note.targetTime)}
          </span>
        </div>

        <div>
          <label className="text-[10px] font-mono font-medium text-cyan-400 block mb-1">
            targetBeat (beat)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={note.targetBeat}
            onChange={(e) => updateNote(note.id, { targetBeat: parseFloat(e.target.value) || 0 })}
            className="w-full px-2 py-1.5 bg-daw-input border border-daw-border rounded text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
          />
          <span className="text-[9px] text-slate-500 font-mono mt-1 block">
            Beat {formatBeat(note.targetBeat)}
          </span>
        </div>
      </div>

      {/* Duration & Duration Beats (Dual Inputs) */}
      <div className="grid grid-cols-2 gap-3 bg-daw-surface p-3 rounded-xl border border-daw-border">
        <div>
          <label className="text-[10px] font-mono font-medium text-slate-400 block mb-1">
            duration (detik)
          </label>
          <input
            type="number"
            step="0.001"
            min="0"
            value={note.duration}
            onChange={(e) => updateNote(note.id, { duration: parseFloat(e.target.value) || 0 })}
            className="w-full px-2 py-1.5 bg-daw-input border border-daw-border rounded text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          />
          <span className="text-[9px] text-slate-500 font-mono mt-1 block">
            {note.duration > 0 ? `${note.duration.toFixed(3)}s` : '0 (Single)'}
          </span>
        </div>

        <div>
          <label className="text-[10px] font-mono font-medium text-cyan-400 block mb-1">
            durationBeats (beat)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={note.durationBeats}
            onChange={(e) => updateNote(note.id, { durationBeats: parseFloat(e.target.value) || 0 })}
            className="w-full px-2 py-1.5 bg-daw-input border border-daw-border rounded text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
          />
          <span className="text-[9px] text-slate-500 font-mono mt-1 block">
            {formatBeat(note.durationBeats)} beats
          </span>
        </div>
      </div>

      {/* Tick Rate */}
      <div>
        <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">
          Tick Rate (tickRate per beat)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="16"
            value={note.tickRate || 4}
            onChange={(e) => updateNote(note.id, { tickRate: parseInt(e.target.value, 10) || 4 })}
            className="w-24 px-2 py-1.5 bg-daw-input border border-daw-border rounded text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          />
          <span className="text-[10px] text-slate-400">
            Resolusi penilaian Unity Hold Note (Default: 4 ticks/beat)
          </span>
        </div>
      </div>
    </div>
  );
}

