import React, { useState } from 'react';
import { X, Copy, Download, Check, FileJson, ShieldCheck } from 'lucide-react';
import { useChartStore } from '../../store/useChartStore';

export default function ExportModal({ isOpen, onClose }) {
  const { exportChart, songTitle, notes } = useChartStore();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonString = exportChart();

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `${(songTitle || 'nuwara_chart').toLowerCase().replace(/\s+/g, '_')}_chart.json`;
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="w-full max-w-2xl bg-daw-panel border border-daw-border rounded-xl shadow-2xl flex flex-col max-h-[85vh] text-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-daw-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-semibold text-white">Ekspor Data Chart JSON</h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Unity C# Engine Compatible</span>
                </span>
                <span>•</span>
                <span>{notes.length} total notes</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-daw-hover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* JSON Preview Box */}
        <div className="flex-1 p-5 overflow-hidden flex flex-col min-h-0">
          <p className="text-xs text-slate-400 mb-2">
            Data JSON di bawah disusun persis sesuai skema C# game <em>Nuwara: Resonance</em> tanpa komentar agar langsung valid saat di-load di Unity.
          </p>
          <div className="flex-1 overflow-auto bg-[#090b10] p-4 rounded-lg border border-daw-border font-mono text-xs text-cyan-300 leading-relaxed">
            <pre>{jsonString}</pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-daw-border flex items-center justify-between bg-daw-surface">
          <span className="text-[11px] text-slate-500 font-mono">
            {new Blob([jsonString]).size} bytes
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg bg-daw-panel hover:bg-daw-hover border border-daw-border text-xs text-slate-200 hover:text-white flex items-center gap-2 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Copy to Clipboard'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white flex items-center gap-2 shadow-lg shadow-cyan-900/40 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download .JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

