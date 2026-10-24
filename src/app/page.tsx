'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Music,
  LayoutDashboard,
  ShieldCheck,
  ArrowRight,
  Headphones,
  Sliders,
  Play,
  Pause,
  User,
  ShoppingBag,
  Plus,
  Lock,
  Search,
  Filter,
  Volume2,
  VolumeX,
  X,
  Check,
  Radio,
  Sparkles,
  Download,
  FileCheck,
  Disc,
  Clock,
  Layers,
} from 'lucide-react';
import { Beat, LicenseType, Order } from '@/types';
import PromptPayModal from '@/components/checkout/PromptPayModal';

export default function Home() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [beats, setBeats] = useState<Beat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');

  // Audio Playback
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // PromptPay Checkout Modal
  const [isPromptPayOpen, setIsPromptPayOpen] = useState(false);
  const [checkoutBeat, setCheckoutBeat] = useState<Beat | null>(null);
  const [checkoutPrice, setCheckoutPrice] = useState<number>(0);

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Load beats from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jerji_studio_beats');
      if (saved) {
        setBeats(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Audio element control
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

  const handlePlayToggle = (beat: Beat) => {
    if (currentBeat?.id === beat.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentBeat(beat);
      setIsPlaying(true);
    }
  };

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

  const handleBuyBeat = (beat: Beat) => {
    if (beat.status === 'SOLD_OUT') {
      showToast('ขออภัย บีทนี้มีผู้สั่งซื้อไปแล้ว');
      return;
    }
    if (!user) {
      router.push('/login');
      return;
    }

    const price = beat.price ?? beat.pricing?.basicMp3 ?? 1200;
    setCheckoutBeat(beat);
    setCheckoutPrice(price);
    setIsPromptPayOpen(true);
  };

  const handlePaymentSuccess = (newOrder: Order) => {
    try {
      const existingOrders: Order[] = JSON.parse(localStorage.getItem('jerji_studio_orders') || '[]');
      localStorage.setItem('jerji_studio_orders', JSON.stringify([newOrder, ...existingOrders]));

      if (checkoutBeat) {
        const updatedBeats = beats.map((b) =>
          b.id === checkoutBeat.id ? { ...b, status: 'SOLD_OUT' as const } : b
        );
        setBeats(updatedBeats);
        localStorage.setItem('jerji_studio_beats', JSON.stringify(updatedBeats));
      }
    } catch (e) {
      console.error(e);
    }

    showToast(`ชำระเงินสำเร็จ! เพิ่ม ${newOrder.items[0]?.beatTitle} เข้าสู่คลังเรียบร้อย`);
  };

  // Filter beats
  const filteredBeats = beats.filter((beat) => {
    const matchesSearch =
      beat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beat.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beat.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGenre = selectedGenre === 'ALL' || beat.genre.toLowerCase().includes(selectedGenre.toLowerCase());

    return matchesSearch && matchesGenre;
  });

  const genres = ['ALL', 'Trap / Drill', 'Boom Bap', 'R&B / Soul', 'Synthwave', 'Lo-Fi Chill'];

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased selection:bg-amber-500 selection:text-black pb-28">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-neutral-900 border border-amber-500/40 text-amber-300 text-xs shadow-2xl animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Studio Navigation Header */}
      <header className="border-b border-neutral-850 px-6 py-4 sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-extrabold tracking-tight text-lg text-white leading-tight">
                BEAT BY JERJI
              </h1>
              <span className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Audio Licensing Studio
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-neutral-400">
            <a href="#beats" className="hover:text-amber-400 transition-colors">
              แคตตาล็อกบีท (Beats)
            </a>
            <a href="#about" className="hover:text-amber-400 transition-colors">
              เกี่ยวกับสตูดิโอ (About)
            </a>
          </nav>

          {/* Right User Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-white border border-neutral-800 text-xs font-semibold transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span className="truncate max-w-[120px]">{user.displayName || 'คลังของฉัน'}</span>
                </Link>

                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-transform hover:scale-105 shadow-md shadow-amber-500/20"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>แอดมิน</span>
                  </Link>
                )}

                <button
                  onClick={() => logout()}
                  className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-850 text-xs transition-colors cursor-pointer"
                  title="ออกจากระบบ"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-neutral-200 border border-neutral-800 text-xs font-semibold transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>เข้าสู่ระบบ (Sign In)</span>
                </Link>

                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105"
                >
                  <span>สมัครสมาชิก</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-16 overflow-hidden">
        {/* Ambient Studio Lighting Orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-amber-500/15 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-semibold text-amber-300">NEW SOUNDBANK 2026</span>
            <span className="text-neutral-500">•</span>
            <span>808 Heavy, Radio-Ready Beats</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
            ยกระดับผลงานเพลงของคุณด้วย{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              บีทคุณภาพระดับสตูดิโอ
            </span>
          </h1>

          <p className="mt-6 text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            เลือกฟังบีทและเช่าสิทธิ์เพลงออนไลน์ได้ทันที มีให้เลือกทั้งไฟล์ MP3, WAV และ Stems แยกแทร็ก พร้อมระบบดาวน์โหลดไฟล์แท้ไม่มีลายน้ำหลังชำระเงิน
          </p>

          {/* Quick Search Bar */}
          <div className="mt-10 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อบีท, แนวเพลง, หรือแท็ก เช่น Trap, Travis Scott, 140 BPM..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 backdrop-blur-xl shadow-2xl transition-all"
              />
            </div>

            {/* Genre Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedGenre === g
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Beat Store Catalog Section */}
      <section id="beats" className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-850">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Disc className="w-6 h-6 text-amber-400 animate-spin-slow" />
              <span>แคตตาล็อกบีทเพลง (Beat Catalog)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-850 text-neutral-300 border border-neutral-800">
                {filteredBeats.length} แทร็ก
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              กดปุ่ม Play เพื่อฟังเสียงพรีวิวคุณภาพสูง (Protected Audio Preview)
            </p>
          </div>

          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>อัปโหลดบีทใหม่ (Admin)</span>
            </Link>
          )}
        </div>

        {/* Empty Catalog State */}
        {filteredBeats.length === 0 ? (
          <div className="p-16 text-center rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/30 backdrop-blur-sm">
            <Music className="w-14 h-14 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">
              สตูดิโอกำลังเตรียมเปิดตัวคอลเลกชันบีทใหม่เร็วๆ นี้
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mb-6 leading-relaxed">
              แทร็กใหม่กำลังอยู่ในขั้นตอน Final Mastering และพร้อมเปิดให้ฟังและสั่งซื้อสิทธิ์เร็วๆ นี้
            </p>
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-transform hover:scale-105"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>ไปที่แอดมินแดชบอร์ดเพื่อลงบีท</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBeats.map((beat) => {
              const isCurrent = currentBeat?.id === beat.id && isPlaying;
              return (
                <div
                  key={beat.id}
                  className="rounded-3xl bg-neutral-900/60 border border-neutral-800 overflow-hidden hover:border-neutral-700 transition-all group flex flex-col justify-between shadow-xl backdrop-blur-sm hover:scale-[1.01]"
                >
                  <div>
                    {/* Artwork Container */}
                    <div className="relative aspect-video overflow-hidden group/art">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={beat.coverImageUrl}
                        alt={beat.title}
                        className="w-full h-full object-cover group-hover/art:scale-105 transition-transform duration-300"
                      />

                      {/* Play overlay button */}
                      <button
                        onClick={() => handlePlayToggle(beat)}
                        className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center transition-opacity cursor-pointer ${
                          isCurrent ? 'opacity-100' : 'opacity-0 group-hover/art:opacity-100'
                        }`}
                      >
                        <div className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shadow-xl shadow-amber-500/30 transition-transform hover:scale-110">
                          {isCurrent ? (
                            <Pause className="w-6 h-6 fill-black" />
                          ) : (
                            <Play className="w-6 h-6 fill-black ml-1" />
                          )}
                        </div>
                      </button>

                      {/* Sold Out badge */}
                      {beat.status === 'SOLD_OUT' && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-black flex items-center gap-1 shadow-lg">
                          <Lock className="w-3 h-3" /> Exclusive Sold Out
                        </div>
                      )}

                      {/* Tag pill */}
                      <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-black/70 backdrop-blur-md text-neutral-300 border border-neutral-800">
                        {beat.bpm} BPM • {beat.musicalKey}
                      </div>
                    </div>

                    {/* Beat Info */}
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                          {beat.title}
                        </h4>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">
                        {beat.genre}
                      </p>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {beat.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] bg-neutral-950 text-neutral-400 border border-neutral-800/80"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Buy Action */}
                  <div className="p-5 pt-0 border-t border-neutral-850/80 flex items-center justify-between mt-4">
                    <div>
                      <span className="text-[10px] text-neutral-400 block">ราคาบีท (Price)</span>
                      <span className="text-base font-extrabold text-amber-400 font-mono">
                        ฿{(beat.price ?? beat.pricing?.basicMp3 ?? 1200).toLocaleString()}
                      </span>
                    </div>

                    {beat.status === 'SOLD_OUT' ? (
                      <span className="px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-400 text-xs font-semibold">
                        ขายแล้ว (Sold Out)
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBuyBeat(beat)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black text-xs font-bold shadow-md shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>สั่งซื้อบีท</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* About & Producer Showcase */}
      <section id="about" className="max-w-7xl mx-auto px-6 py-20 border-t border-neutral-850">
        <div className="rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/20 border border-neutral-800 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Jerji Beats Studio
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
              ผลิตเสียงดนตรีด้วยมาตรฐานระดับอุตสาหกรรม
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-4 leading-relaxed">
              ทุกบีทผ่านขั้นตอน Sound Design ที่คัดสรรเสียง 808, กลอง Hip-hop และเมโลดี้ด้วย Synth อนาล็อก พร้อมการ Mix และ Pre-master ให้พร้อมสำหรับศิลปินนำเสียงร้องมาอัดและปล่อยผลงานได้ทันที
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-850 text-center">
              <span className="block text-2xl font-black text-amber-400 font-mono">100%</span>
              <span className="text-[11px] text-neutral-400">Royalty Free Leases</span>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-850 text-center">
              <span className="block text-2xl font-black text-white font-mono">Instant</span>
              <span className="text-[11px] text-neutral-400">Firebase Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* PromptPay QR Code Payment Modal */}
      <PromptPayModal
        isOpen={isPromptPayOpen}
        onClose={() => setIsPromptPayOpen(false)}
        beat={checkoutBeat}
        price={checkoutPrice}
        userEmail={user?.email || ''}
        userName={user?.displayName || ''}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Persistent Audio Bar (Bottom Player) */}
      {currentBeat && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/95 border-t border-neutral-800 backdrop-blur-xl px-4 py-3 shadow-2xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Beat Info */}
            <div className="flex items-center gap-3 w-1/4 min-w-0">
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
                    Preview Tag
                  </span>
                </h4>
                <p className="text-xs text-neutral-400 truncate">
                  {currentBeat.genre} • {currentBeat.bpm} BPM
                </p>
              </div>
            </div>

            {/* Audio Controls & Scrub Bar */}
            <div className="flex-1 max-w-xl flex flex-col items-center gap-1">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center transition-transform hover:scale-105 shadow-md shadow-amber-500/30 cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-black" />
                ) : (
                  <Play className="w-4 h-4 fill-black ml-0.5" />
                )}
              </button>

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

            {/* Quick Buy & Close */}
            <div className="flex items-center justify-end gap-3 w-1/4">
              <button
                onClick={() => handleBuyBeat(currentBeat)}
                disabled={currentBeat.status === 'SOLD_OUT'}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs shadow-md shadow-amber-500/20 hover:scale-105 transition-transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>
                  {currentBeat.status === 'SOLD_OUT'
                    ? 'ขายแล้ว'
                    : `฿${(currentBeat.price ?? currentBeat.pricing?.basicMp3 ?? 1200).toLocaleString()}`}
                </span>
              </button>

              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentBeat(null);
                }}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                title="ปิดตัวเล่น"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
