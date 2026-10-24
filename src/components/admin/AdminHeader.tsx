'use client';

import React from 'react';
import { Plus, Bell, Volume2, Shield } from 'lucide-react';

interface AdminHeaderProps {
  onAddClick: () => void;
  activeTabTitle: string;
}

export default function AdminHeader({ onAddClick, activeTabTitle }: AdminHeaderProps) {
  return (
    <header className="h-16 px-6 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-bold text-white capitalize">{activeTabTitle}</h2>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-800 text-neutral-400 border border-neutral-700">
          <Shield className="w-3 h-3 text-amber-400" />
          Admin Access Granted
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Audio Monitor Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-400">
          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px]">Audio Engine Ready</span>
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-0.5 h-1.5 bg-amber-400 animate-pulse" />
            <span className="w-0.5 h-3 bg-amber-400 animate-pulse delay-75" />
            <span className="w-0.5 h-2 bg-amber-400 animate-pulse delay-150" />
          </div>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
          title="การแจ้งเตือน"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-neutral-950" />
        </button>

        {/* Quick Upload Action */}
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>เพิ่มบีทใหม่</span>
        </button>
      </div>
    </header>
  );
}
