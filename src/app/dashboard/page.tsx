'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Music,
  ShoppingBag,
  Download,
  FileText,
  Play,
  Pause,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  User,
  CheckCircle2,
  Lock,
  Headphones,
  Sliders,
  ChevronRight,
  Archive,
} from 'lucide-react';
import { Beat, Order, LicenseType } from '@/types';

interface PurchasedBeatItem {
  id: string;
  orderNumber: string;
  purchasedAt: string;
  beatTitle: string;
  bpm: number;
  musicalKey: string;
  genre: string;
  coverImageUrl: string;
  previewAudioUrl: string;
  licenseType?: LicenseType;
  untaggedWavUrl?: string;
  stemsZipUrl?: string;
  downloadCount: number;
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'library' | 'orders' | 'profile'>('library');

  // Audio Playback
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Purchased items and Orders state
  const [purchasedBeats, setPurchasedBeats] = useState<PurchasedBeatItem[]>([]);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load customer orders from LocalStorage if available
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem('jerji_studio_orders');
      if (savedOrders) {
        const allOrders: Order[] = JSON.parse(savedOrders);
        const myOrders = allOrders.filter(
          (o) => o.customerEmail.toLowerCase() === user?.email?.toLowerCase()
        );
        setCustomerOrders(myOrders);

        // Derive purchased beats from completed orders
        const items: PurchasedBeatItem[] = [];
        myOrders
          .filter((o) => o.status === 'COMPLETED')
          .forEach((o) => {
            o.items.forEach((item) => {
              items.push({
                id: item.id,
                orderNumber: o.orderNumber,
                purchasedAt: o.createdAt,
                beatTitle: item.beatTitle,
                bpm: item.bpm || 140,
                musicalKey: item.musicalKey || 'C Minor',
                genre: item.genre || 'Hip Hop',
                coverImageUrl: item.coverImageUrl,
                previewAudioUrl: item.previewAudioUrl || '',
                untaggedWavUrl: item.untaggedWavUrl,
                stemsZipUrl: item.stemsZipUrl,
                licenseType: item.licenseType || 'EXCLUSIVE',
                downloadCount: 0,
              });
            });
          });
        setPurchasedBeats(items);
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  const handlePlayToggle = (beat: PurchasedBeatItem) => {
    if (playingId === beat.id) {
      audioElement?.pause();
      setPlayingId(null);
    } else {
      audioElement?.pause();
      const audio = new Audio(beat.previewAudioUrl);
      audio.play();
      audio.onended = () => setPlayingId(null);
      setAudioElement(audio);
      setPlayingId(beat.id);
    }
  };

  const handleDownload = (fileType: string, beatTitle: string) => {
    showToast(`กำลังสร้าง Secure Signed URL สำหรับดาวน์โหลด ${fileType}: ${beatTitle}`);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-neutral-400 text-sm">
          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</span>
        </div>
      </div>
    );
  }

  const getLicenseBadge = (_type?: LicenseType) => {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
        สิทธิ์การใช้งานบีทตัวเต็ม (Full Beat Rights)
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased selection:bg-amber-500 selection:text-black">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-neutral-900 border border-amber-500/40 text-amber-300 text-xs shadow-2xl animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <header className="border-b border-neutral-850 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Music className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-extrabold tracking-tight text-white text-base">
                BEAT BY JERJI
              </h1>
              <span className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">
                Customer Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-850 hover:bg-neutral-800 text-amber-400 border border-neutral-700 text-xs font-semibold transition-colors"
              >
                <span>ไปยังแดชบอร์ดเจ้าของร้าน (Admin)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}

            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-800 text-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Customer Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/30 border border-neutral-800 p-6 sm:p-8">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xl font-black text-black shadow-xl shadow-amber-500/20">
                {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'CU'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white">
                    {user.displayName || 'ลูกค้าผู้รักเสียงเพลง'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3 inline mr-1" />
                    Verified Customer
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  อีเมล: {user.email} • บัญชีสมาชิกปลอดภัยด้วย Firebase Authentication
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4">
              <div className="px-4 py-3 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 text-center">
                <span className="block text-xs text-neutral-400">บีทในคลัง</span>
                <span className="text-xl font-bold text-amber-400">
                  {purchasedBeats.length}
                </span>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 text-center">
                <span className="block text-xs text-neutral-400">คำสั่งซื้อ</span>
                <span className="text-xl font-bold text-white">
                  {customerOrders.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-neutral-850 pb-3">
          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'library'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>คลังบีทของฉัน (My Library)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-300">
              {purchasedBeats.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>ประวัติคำสั่งซื้อ (Orders)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-300">
              {customerOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>ตั้งค่าบัญชี (Profile)</span>
          </button>
        </div>

        {/* TAB 1: MY LIBRARY */}
        {activeTab === 'library' && (
          <div className="space-y-4">
            {purchasedBeats.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/40">
                <Music className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">
                  ยังไม่มีบีทในคลังส่วนตัวของคุณ
                </h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto mb-6">
                  หลังจากสั่งซื้อและชำระเงินสำเร็จ บีทไฟล์คุณภาพสูง (Untagged WAV) และไฟล์แยกแทร็ก (Stems ZIP) จะมาแสดงที่นี่ให้ดาวน์โหลดได้ตลอดเวลา
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-transform hover:scale-105"
                >
                  <span>เลือกดูบีทในแคตตาล็อก</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {purchasedBeats.map((beat) => (
                  <div
                    key={beat.id}
                    className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
                  >
                    {/* Beat Info & Preview Trigger */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={beat.coverImageUrl}
                          alt={beat.beatTitle}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handlePlayToggle(beat)}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          {playingId === beat.id ? (
                            <Pause className="w-6 h-6 text-amber-400 fill-amber-400" />
                          ) : (
                            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                          )}
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">
                            {beat.beatTitle}
                          </h4>
                          {getLicenseBadge(beat.licenseType)}
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                          {beat.bpm} BPM • {beat.musicalKey} • สั่งซื้อเมื่อ {new Date(beat.purchasedAt).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    </div>

                    {/* Download Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-800">
                      <button
                        onClick={() => handleDownload('Master WAV (Untagged)', beat.beatTitle)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-semibold border border-neutral-700 transition-colors cursor-pointer"
                        title="ดาวน์โหลดไฟล์ Master WAV คุณภาพสูง (ไม่มีลายน้ำ)"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>Master WAV</span>
                      </button>

                      <button
                        onClick={() => handleDownload('Stems ZIP', beat.beatTitle)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-colors cursor-pointer"
                        title="ดาวน์โหลดไฟล์แยกแทร็กเครื่องดนตรีทั้งหมด (ZIP)"
                      >
                        <Archive className="w-3.5 h-3.5 text-purple-400" />
                        <span>Track Stems (ZIP)</span>
                      </button>

                      <button
                        onClick={() => handleDownload('License Agreement PDF', beat.beatTitle)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-850 hover:bg-neutral-800 text-neutral-300 text-xs font-medium border border-neutral-750 transition-colors cursor-pointer"
                        title="ดาวน์โหลดเอกสารสัญญาอนุญาตการใช้สิทธิ์เพลง (License PDF)"
                      >
                        <FileText className="w-3.5 h-3.5 text-neutral-400" />
                        <span>ใบอนุญาตสิทธิ์</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDERS */}
        {activeTab === 'orders' && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-md overflow-hidden">
            <div className="p-5 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white">
                ประวัติคำสั่งซื้อทั้งหมด ({customerOrders.length})
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                ประวัติการชำระเงินผ่านระบบ Stripe, PromptPay และ Firebase Store
              </p>
            </div>

            {customerOrders.length === 0 ? (
              <div className="p-12 text-center text-neutral-500 text-xs">
                ยังไม่มีประวัติการทำรายการคำสั่งซื้อ
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-neutral-950/40 text-neutral-400 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">เลขที่ออเดอร์</th>
                      <th className="py-3 px-4">วันที่ทำรายการ</th>
                      <th className="py-3 px-4">รายการบีท</th>
                      <th className="py-3 px-4">สิทธิ์ที่เลือก</th>
                      <th className="py-3 px-4 text-right">ยอดชำระ</th>
                      <th className="py-3 px-4 text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {customerOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-neutral-800/20">
                        <td className="py-3 px-4 font-mono font-medium text-white">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 px-4 text-neutral-400">
                          {new Date(order.createdAt).toLocaleDateString('th-TH')}
                        </td>
                        <td className="py-3 px-4 font-medium text-neutral-200">
                          {order.items[0]?.beatTitle || 'Beat Item'}
                        </td>
                        <td className="py-3 px-4">
                          {getLicenseBadge(order.items[0]?.licenseType || 'BASIC_MP3')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                          ฿{order.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 backdrop-blur-md space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">ข้อมูลบัญชีสมาชิก</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                จัดการข้อมูลส่วนตัวและการตั้งค่าความปลอดภัย
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">ชื่อที่แสดง (Display Name)</label>
                <input
                  type="text"
                  disabled
                  value={user.displayName || 'ไม่มี'}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">อีเมล (Email)</label>
                <input
                  type="email"
                  disabled
                  value={user.email || ''}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">ระดับสิทธิ์ในระบบ (Role)</label>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 font-mono">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>{user.role}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
