'use client';

import React, { useState } from 'react';
import { Beat, BeatStatus } from '@/types';
import {
  Play,
  Pause,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Lock,
  Headphones,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface BeatManagementTableProps {
  beats: Beat[];
  onAddClick: () => void;
  onEditClick: (beat: Beat) => void;
  onDeleteClick: (beatId: string) => void;
  onToggleStatus: (beatId: string, newStatus: BeatStatus) => void;
  currentPlayingId: string | null;
  isPlaying: boolean;
  onPlayToggle: (beat: Beat) => void;
}

export default function BeatManagementTable({
  beats,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onToggleStatus,
  currentPlayingId,
  isPlaying,
  onPlayToggle,
}: BeatManagementTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredBeats = beats.filter((beat) => {
    const matchesSearch =
      beat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beat.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beat.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      selectedStatus === 'ALL' ? true : beat.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: BeatStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            เปิดขาย (Active)
          </span>
        );
      case 'SOLD_OUT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10">
            <Lock className="w-3.5 h-3.5" />
            Exclusive Sold Out
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-800 text-neutral-400 border border-neutral-700">
            <Clock className="w-3.5 h-3.5" />
            แบบร่าง (Draft)
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            ซ่อนการขาย
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-md overflow-hidden shadow-xl">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-neutral-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>คลังจัดการบีท (Beat Catalog Management)</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-neutral-800 text-neutral-300 border border-neutral-700">
              {filteredBeats.length} รายการ
            </span>
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            อัปโหลด แก้ไขราคา License และควบคุมสถานะสิทธิ์ Exclusive ของแต่ละแทร็ก
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อบีท, แนวเพลง, แท็ก..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-800/80 border border-neutral-700 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none bg-neutral-800/80 border border-neutral-700 text-neutral-200 text-xs rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">สถานะทั้งหมด</option>
              <option value="PUBLISHED">เปิดขาย (Published)</option>
              <option value="SOLD_OUT">ขายขาดแล้ว (Sold Out)</option>
              <option value="DRAFT">แบบร่าง (Draft)</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Add New Beat Button */}
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold text-sm shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>อัปโหลดบีทใหม่</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-950/40 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">บีท / ข้อมูลเสียง</th>
              <th className="py-3.5 px-4">แนวเพลง & แท็ก</th>
              <th className="py-3.5 px-4 text-center">BPM / Key</th>
              <th className="py-3.5 px-4">ราคาตาม License</th>
              <th className="py-3.5 px-4 text-center">สถิติเปิดฟัง</th>
              <th className="py-3.5 px-4 text-center">สถานะ</th>
              <th className="py-3.5 px-4 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 text-sm">
            {filteredBeats.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-neutral-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-neutral-600" />
                    <span>ไม่พบบีทที่ตรงกับเงื่อนไขค้นหา</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredBeats.map((beat) => {
                const isCurrentPlaying = currentPlayingId === beat.id && isPlaying;
                return (
                  <tr
                    key={beat.id}
                    className="hover:bg-neutral-800/30 transition-colors group"
                  >
                    {/* Beat Info & Audio Preview Trigger */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 group/cover">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={beat.coverImageUrl}
                            alt={beat.title}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => onPlayToggle(beat)}
                            className={`absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity cursor-pointer ${
                              isCurrentPlaying
                                ? 'opacity-100'
                                : 'opacity-0 group-hover/cover:opacity-100'
                            }`}
                            title={isCurrentPlaying ? 'หยุดฟัง' : 'ฟังตัวอย่าง (Preview Tag)'}
                          >
                            {isCurrentPlaying ? (
                              <Pause className="w-5 h-5 text-amber-400 fill-amber-400" />
                            ) : (
                              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                            )}
                          </button>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                              {beat.title}
                            </span>
                            {isCurrentPlaying && (
                              <span className="flex items-center gap-0.5 text-[10px] text-amber-400 animate-pulse">
                                <Sparkles className="w-3 h-3" /> Playing
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-neutral-400 block">
                            /{beat.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Genre & Tags */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="text-xs font-medium text-neutral-200">
                          {beat.genre}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {beat.tags.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-400 border border-neutral-700/60"
                            >
                              #{tag}
                            </span>
                          ))}
                          {beat.tags.length > 2 && (
                            <span className="text-[10px] text-neutral-500 self-center">
                              +{beat.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* BPM & Key */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-mono text-xs font-semibold text-neutral-200">
                          {beat.bpm} BPM
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {beat.musicalKey}
                        </span>
                      </div>
                    </td>

                    {/* Pricing Tiers */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs space-y-0.5">
                        <div className="flex items-center justify-between gap-3 text-neutral-300">
                          <span className="text-[11px] text-neutral-400">MP3 / WAV:</span>
                          <span className="font-mono font-medium">
                            ฿{beat.pricing.basicMp3.toLocaleString()} / ฿{beat.pricing.premiumWav.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-amber-400">
                          <span className="text-[11px] text-neutral-400">Exclusive:</span>
                          <span className="font-mono font-semibold">
                            ฿{beat.pricing.exclusive.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Plays Count */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 text-xs text-neutral-300">
                        <Headphones className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{beat.playsCount.toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(beat.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Sold Out Toggle */}
                        {beat.status !== 'SOLD_OUT' ? (
                          <button
                            onClick={() => onToggleStatus(beat.id, 'SOLD_OUT')}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors"
                            title="ทำเครื่องหมายว่า Exclusive ขายแล้ว (Sold Out)"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onToggleStatus(beat.id, 'PUBLISHED')}
                            className="p-1.5 rounded-lg text-amber-400 hover:text-emerald-400 hover:bg-neutral-800 transition-colors"
                            title="เปิดขายอีกครั้ง (Published)"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => onEditClick(beat)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                          title="แก้ไขข้อมูลบีท"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteClick(beat.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="ลบบีท"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
