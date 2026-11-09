import React, { useState } from 'react';
import { Sliders, List, Music, ChevronRight, ChevronLeft } from 'lucide-react';
import { useChartStore } from '../../store/useChartStore';
import NoteProperties from './NoteProperties';
import NotesList from './NotesList';

export default function InspectorSidebar() {
  const [activeTab, setActiveTab] = useState('properties'); // 'properties' | 'list'
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { notes, selectedNoteId } = useChartStore();

  if (isCollapsed) {
    return (
      <div className="w-10 bg-daw-surface border-l border-daw-border flex flex-col items-center py-4 select-none">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-daw-hover transition"
          title="Buka Inspector Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="writing-vertical text-slate-500 text-xs font-mono tracking-widest mt-6 uppercase">
          INSPECTOR
        </div>
      </div>
    );
  }

  return (
    <aside className="w-80 bg-daw-surface border-l border-daw-border flex flex-col select-none shadow-xl">
      {/* Top Header & Tabs */}
      <div className="h-11 bg-daw-panel border-b border-daw-border px-3 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-daw-input p-0.5 rounded-lg border border-daw-border">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition ${
              activeTab === 'properties'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Inspector</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition ${
              activeTab === 'list'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Notes ({notes.length})</span>
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-daw-hover transition"
          title="Sembunyikan Sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {activeTab === 'properties' ? (
          <div className="flex-1 flex flex-col">
            <NoteProperties />
            <div className="mt-auto border-t border-daw-border">
              <div className="p-3 bg-daw-panel/50 text-slate-400 text-[11px] flex items-center justify-between">
                <span>Daftar Cepat Note</span>
                <button
                  onClick={() => setActiveTab('list')}
                  className="text-cyan-400 hover:underline"
                >
                  Lihat Semua ({notes.length}) &rarr;
                </button>
              </div>
            </div>
          </div>
        ) : (
          <NotesList />
        )}
      </div>
    </aside>
  );
}

