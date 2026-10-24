'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Beat } from '@/types';
import { Play, Pause, X, Volume2, VolumeX, ShieldAlert } from 'lucide-react';

interface AdminAudioBarProps {
  currentBeat: Beat | null;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onClose: () => void;
}

export default function AdminAudioBar({
  currentBeat,
  isPlaying,
  onPlayToggle,
  onClose,
}: AdminAudioBarProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;

    if (currentBeat) {
      audioRef.current.src = currentBeat.previewAudioUrl;
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [currentBeat]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  if (!currentBeat) return null;

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 border-t border-neutral-800 backdrop-blur-xl px-4 py-3 shadow-2xl transition-transform">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => onPlayToggle()}
      />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Beat Info */}
        <div className="flex items-center gap-3 min-w-0 w-1/4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentBeat.coverImageUrl}
            alt={currentBeat.title}
            className="w-12 h-12 rounded-xl object-cover shadow-md flex-shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
              <span>{currentBeat.title}</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                Watermarked MP3
              </span>
            </h4>
            <p className="text-xs text-neutral-400 truncate">
              {currentBeat.genre} • {currentBeat.bpm} BPM • {currentBeat.musicalKey}
            </p>
          </div>
        </div>

        {/* Player Controls & Progress */}
        <div className="flex-1 max-w-xl flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-4">
            <button
              onClick={onPlayToggle}
              className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center transition-transform hover:scale-105 shadow-md shadow-amber-500/30 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-black" />
              ) : (
                <Play className="w-4 h-4 fill-black ml-0.5" />
              )}
            </button>
          </div>

          <div className="w-full flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
            <span>{formatTime(progress)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={progress}
              onChange={handleSeek}
              className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Audio controls & close */}
        <div className="flex items-center justify-end gap-3 w-1/4">
          <button
            onClick={toggleMute}
            className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            title="ปิดเครื่องเล่น"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
