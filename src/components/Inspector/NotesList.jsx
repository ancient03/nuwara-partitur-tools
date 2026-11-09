import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Layers, 
  ExternalLink, 
  Filter, 
  Sparkles, 
  Clock, 
  Music2 
} from 'lucide-react';
import { useChartStore } from '../../store/useChartStore';
import { audioManager } from '../../utils/audioManager';
import { formatTime, formatBeat } from '../../utils/chartCalculations';

export default function NotesList() {
  const {
    notes,
    selectedNoteId,
    selectNote,
    deleteNote,
    quantizeNotes,
    clearAllNotes,
    audioDuration
  } = useChartStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [laneFilter, setLaneFilter] = useState('all'); // 'all', '0', '1', 'hold'

  // Statistics
  const totalNotes = notes.length;
  const singleNotes = notes.filter((n) => n.duration <= 0.0001 && n.entityType === 0).length;
  const holdNotes = totalNotes - singleNotes;
  const durationSafe = Math.max(1, audioDuration || 30);
  const nps = (totalNotes / durationSafe).toFixed(2);

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    // Lane filter
    if (laneFilter === '0' && n.lane !== 0) return false;
    if (laneFilter === '1' && n.lane !== 1) return false;
    if (laneFilter === 'hold' && n.duration <= 0.0001 && n.entityType !== 2) return false;
    if (laneFilter === 'single' && (n.duration > 0.0001 || n.entityType === 2)) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = String(n.id).includes(q);
      const matchTime = n.targetTime.toFixed(2).includes(q);
      const matchBeat = n.targetBeat.toFixed(2).includes(q);
      return matchId || matchTime || matchBeat;
    }

    return true;
  });

  const handleRowClick = (note) => {
    selectNote(note.id);
    audioManager.seek(note.targetTime);
  };

  const handleClearConfirm = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus SELURUH partitur note?')) {
      clearAllNotes();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 text-xs font-sans">
      {/* Chart Statistics Card */}
      <div className="p-3 bg-daw-surface border-b border-daw-border grid grid-cols-4 gap-2 text-center select-none">
        <div className="bg-daw-panel p-2 rounded-lg border border-daw-border">
          <span className="text-[10px] text-slate-400 block">TOTAL</span>
          <span className="text-sm font-bold font-mono text-white">{totalNotes}</span>
        </div>
        <div className="bg-daw-panel p-2 rounded-lg border border-daw-border">
          <span className="text-[10px] text-cyan-400 block">SINGLE</span>
          <span className="text-sm font-bold font-mono text-cyan-300">{singleNotes}</span>
        </div>
        <div className="bg-daw-panel p-2 rounded-lg border border-daw-border">
          <span className="text-[10px] text-amber-400 block">HOLD</span>
          <span className="text-sm font-bold font-mono text-amber-300">{holdNotes}</span>
        </div>
        <div className="bg-daw-panel p-2 rounded-lg border border-daw-border">
          <span className="text-[10px] text-slate-400 block">NPS</span>
          <span className="text-sm font-bold font-mono text-slate-200">{nps}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 border-b border-daw-border space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari Note ID, waktu, atau beat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-daw-input border border-daw-border rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {[
            { id: 'all', label: 'Semua' },
            { id: '0', label: 'Air (0)' },
            { id: '1', label: 'Ground (1)' },
            { id: 'single', label: 'Single' },
            { id: 'hold', label: 'Hold' }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setLaneFilter(pill.id)}
              className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap transition ${
                laneFilter === pill.id
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'bg-daw-input text-slate-400 hover:text-slate-200 border border-daw-border'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Headers */}
      <div className="h-7 bg-[#0b0d14] border-b border-daw-border px-3 grid grid-cols-12 items-center text-[10px] font-mono font-semibold text-slate-400 select-none">
        <span className="col-span-2">ID</span>
        <span className="col-span-3">LANE</span>
        <span className="col-span-3">TIME</span>
        <span className="col-span-3">BEAT</span>
        <span className="col-span-1 text-right">DEL</span>
      </div>

      {/* Scrollable Note Rows List */}
      <div className="flex-1 overflow-y-auto divide-y divide-daw-border">
        {filteredNotes.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            {notes.length === 0 ? (
              <div className="space-y-1">
                <p className="font-semibold text-slate-400">Partitur masih kosong</p>
                <p className="text-[11px] text-slate-500">
                  Klik pada timeline atau tekan <kbd className="px-1 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">F</kbd> / <kbd className="px-1 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">J</kbd> untuk menambahkan note.
                </p>
              </div>
            ) : (
              'Tidak ada note yang cocok dengan filter.'
            )}
          </div>
        ) : (
          filteredNotes.map((n) => {
            const isSelected = selectedNoteId === n.id;
            const isAir = n.lane === 0;
            const isHold = n.duration > 0.0001 || n.entityType === 2;

            return (
              <div
                key={n.id}
                onClick={() => handleRowClick(n)}
                className={`px-3 py-2 grid grid-cols-12 items-center cursor-pointer transition select-none ${
                  isSelected
                    ? 'bg-cyan-950/50 border-l-2 border-cyan-400 text-white font-medium'
                    : 'hover:bg-daw-hover text-slate-300'
                }`}
              >
                {/* ID */}
                <div className="col-span-2 font-mono text-[11px] flex items-center gap-1">
                  <span className="text-slate-500">#</span>
                  <span className="font-bold">{n.id}</span>
                </div>

                {/* Lane badge */}
                <div className="col-span-3 flex items-center">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                    isAir
                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                      : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                  }`}>
                    {isAir ? 'AIR (0)' : 'GND (1)'}
                  </span>
                </div>

                {/* Target Time */}
                <div className="col-span-3 font-mono text-[10px]">
                  <span>{n.targetTime.toFixed(2)}s</span>
                </div>

                {/* Target Beat & Hold tag */}
                <div className="col-span-3 font-mono text-[10px] flex items-center gap-1">
                  <span className="text-cyan-300">{formatBeat(n.targetBeat)}b</span>
                  {isHold && (
                    <span className="text-[8px] bg-amber-900/40 text-amber-300 px-1 rounded">
                      +{formatBeat(n.durationBeats)}b
                    </span>
                  )}
                </div>

                {/* Delete button */}
                <div className="col-span-1 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(n.id);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                    title="Hapus note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Batch Actions */}
      <div className="p-3 bg-daw-surface border-t border-daw-border flex items-center justify-between gap-2 select-none">
        <button
          onClick={() => quantizeNotes()}
          className="flex-1 py-1.5 px-2 bg-daw-panel hover:bg-daw-hover border border-daw-border rounded-lg text-xs text-cyan-300 font-medium transition flex items-center justify-center gap-1.5"
          title="Ratakan seluruh posisi note ke beat grid snap aktif"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Quantize All</span>
        </button>

        <button
          onClick={handleClearConfirm}
          className="py-1.5 px-3 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/50 rounded-lg text-xs text-rose-300 font-medium transition"
          title="Hapus seluruh note pada chart"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}

