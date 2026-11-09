import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useChartStore } from '../../store/useChartStore';
import { audioManager } from '../../utils/audioManager';

export default function WaveformView({ scrollContainerRef }) {
  const containerRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const {
    zoom,
    audioDuration,
    audioFile,
    currentTime
  } = useChartStore();

  const totalWidth = Math.max(800, audioDuration * zoom);

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy existing instance if any
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }

    if (!audioFile) {
      setIsReady(false);
      return;
    }

    try {
      const ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor: '#1e293b',
        progressColor: '#0ea5e9',
        cursorColor: '#38bdf8',
        cursorWidth: 2,
        height: 64,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        media: audioManager.audioElement,
        minPxPerSec: zoom,
        interact: true,
        fillParent: false,
        autoCenter: false
      });

      ws.on('ready', () => {
        setIsReady(true);
      });

      ws.on('interaction', (newTime) => {
        audioManager.seek(newTime);
      });

      wavesurferRef.current = ws;
    } catch (err) {
      console.warn("WaveSurfer initialization note:", err);
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [audioFile]);

  // Update zoom on WaveSurfer when zoom changes
  useEffect(() => {
    if (wavesurferRef.current && isReady) {
      wavesurferRef.current.zoom(zoom);
    }
  }, [zoom, isReady]);

  return (
    <div className="h-16 bg-[#0c0e17] border-b border-daw-border relative overflow-hidden select-none">
      {/* Background track indicator */}
      <div className="absolute top-1 left-2 z-10 pointer-events-none flex items-center gap-1.5">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-daw-panel/80 px-1.5 py-0.5 rounded border border-daw-border">
          Master Waveform
        </span>
      </div>

      {/* Waveform container */}
      <div 
        ref={containerRef} 
        style={{ width: `${totalWidth}px` }} 
        className="h-full cursor-pointer relative"
      >
        {!audioFile && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-xs font-mono select-none pointer-events-none">
            [ Belum ada audio • Silakan klik Upload Audio di header untuk memuat lagu ]
          </div>
        )}
      </div>
    </div>
  );
}

