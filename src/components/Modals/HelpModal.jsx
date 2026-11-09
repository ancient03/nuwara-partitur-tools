import React from 'react';
import { X, Keyboard, HelpCircle, Layers, Gamepad2, Sparkles, BookOpen } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause pemutaran musik' },
    { key: 'F', desc: 'Tap note di Lane 0 (AIR) pada posisi playhead' },
    { key: 'J', desc: 'Tap note di Lane 1 (GROUND) pada posisi playhead' },
    { key: 'Tahan F / J', desc: 'Membuat Hold Note secara real-time selama tombol ditahan' },
    { key: 'Delete / Backspace', desc: 'Hapus note yang sedang dipilih' },
    { key: 'Ctrl + Z', desc: 'Undo tindakan terakhir' },
    { key: 'Ctrl + Y', desc: 'Redo tindakan yang di-undo' },
    { key: 'Alt + Scroll', desc: 'Zoom in / Zoom out timeline horizontal' },
    { key: 'Klik Grid', desc: 'Tambah note baru pada posisi kursor (snapped)' },
    { key: 'Drag Ujung Note', desc: 'Ubah durasi note (otomatis jadi Hold Note)' },
    { key: 'Klik Kanan Note', desc: 'Hapus note langsung' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="w-full max-w-xl bg-daw-panel border border-daw-border rounded-xl shadow-2xl flex flex-col max-h-[85vh] text-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-daw-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-white">Panduan & Shortcut Nuwara Chart Editor</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-daw-hover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs">
          {/* Keyboard Shortcuts */}
          <div>
            <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Keyboard className="w-4 h-4" />
              <span>Keyboard Shortcuts</span>
            </h3>
            <div className="bg-[#090b10] rounded-lg border border-daw-border divide-y divide-daw-border font-mono">
              {shortcuts.map((item, idx) => (
                <div key={idx} className="px-3 py-2 flex items-center justify-between">
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-[11px]">
                    {item.key}
                  </kbd>
                  <span className="text-slate-300 font-sans text-right">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Unity Integration Guide */}
          <div>
            <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Gamepad2 className="w-4 h-4" />
              <span>Format Engine Unity C#</span>
            </h3>
            <div className="bg-[#090b10] p-3 rounded-lg border border-daw-border space-y-2 text-slate-300">
              <p>
                Aplikasi ini mengekspor dan mengimpor file JSON murni yang langsung dibaca oleh Unity JsonUtility / Newtonsoft.Json:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li><strong className="text-slate-200">Lane 0 (Air)</strong>: Note di udara untuk aksi lompat/serang atas.</li>
                <li><strong className="text-slate-200">Lane 1 (Ground)</strong>: Note di darat untuk aksi tebas/dash darat.</li>
                <li><strong className="text-slate-200">entityType 0</strong>: Single Note (Tap biasa, durasi = 0).</li>
                <li><strong className="text-slate-200">entityType 2</strong>: Hold Note (Note panjang dengan durasi &gt; 0).</li>
                <li><strong className="text-slate-200">tickRate</strong>: Frekuensi kalkulasi skor continuous hold (default 4).</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-daw-border flex items-center justify-end bg-daw-surface">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

