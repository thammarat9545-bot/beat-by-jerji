'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Music,
  BarChart3,
  ShoppingBag,
  ExternalLink,
  ShieldAlert,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  beatCount: number;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  beatCount,
}: AdminSidebarProps) {
  const { user } = useAuth();
  const navItems = [
    {
      id: 'overview',
      label: 'ภาพรวม (Overview)',
      icon: LayoutDashboard,
    },
    {
      id: 'beats',
      label: 'จัดการบีท (Beats)',
      icon: Music,
      badge: beatCount,
    },
    {
      id: 'analytics',
      label: 'สถิติยอดขาย (Analytics)',
      icon: BarChart3,
    },
    {
      id: 'orders',
      label: 'คำสั่งซื้อ (Orders)',
      icon: ShoppingBag,
    },
  ];

  return (
    <aside className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col justify-between p-4 flex-shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-neutral-850">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Radio className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold tracking-tight text-white text-base leading-tight">
              BEAT BY JERJI
            </h1>
            <span className="text-[10px] font-semibold tracking-wider text-amber-400 uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Admin Studio
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Studio Presets Section */}
        <div className="mt-8 px-3">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
            System & Storage
          </span>
          <div className="space-y-2 text-xs text-neutral-400">
            <div className="p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800/80 flex items-center justify-between">
              <span className="text-[11px]">Storage Status</span>
              <span className="text-[10px] text-emerald-400 font-medium">Firebase Storage Ready</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800/80 flex items-center justify-between">
              <span className="text-[11px]">Watermark Audio</span>
              <span className="text-[10px] text-amber-400 font-medium">Active (Protected)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Profile & Switch to Store */}
      <div className="pt-4 border-t border-neutral-850 space-y-3">
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            <span>ไปที่หน้าร้านสตูดิโอ</span>
          </div>
          <span className="text-[10px] text-neutral-500">Storefront</span>
        </Link>

        {/* User Card */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-neutral-900/40 border border-neutral-850">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xs font-bold text-black flex-shrink-0">
            {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.displayName || 'Owner / Producer'}
            </p>
            <p className="text-[10px] text-neutral-400 truncate">
              {user?.email || 'admin@beatbyjerji.com'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
