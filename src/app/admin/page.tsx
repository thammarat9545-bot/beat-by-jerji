'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import MetricsCards from '@/components/admin/MetricsCards';
import SalesChart from '@/components/admin/SalesChart';
import BeatManagementTable from '@/components/admin/BeatManagementTable';
import RecentOrdersTable from '@/components/admin/RecentOrdersTable';
import UploadBeatModal from '@/components/admin/UploadBeatModal';
import AdminAudioBar from '@/components/admin/AdminAudioBar';
import { INITIAL_BEATS, RECENT_ORDERS } from '@/data/mockData';
import { Beat, BeatStatus, Order } from '@/types';
import { Music, AlertCircle, Sparkles, ShieldAlert, Lock, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [beats, setBeats] = useState<Beat[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isLoaded, setIsLoaded] = useState(false);

  // ตรวจสอบว่าล็อกอินแล้วหรือยัง ถ้ายังไม่ได้ล็อกอิน ให้เด้งไปหน้า /login ทันที
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // โหลดข้อมูลบีทที่เคยบันทึกไว้ในเบราว์เซอร์
  React.useEffect(() => {
    try {
      const savedBeats = localStorage.getItem('jerji_studio_beats');
      if (savedBeats) {
        setBeats(JSON.parse(savedBeats));
      }
      const savedOrders = localStorage.getItem('jerji_studio_orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoaded(true);
  }, []);

  // บันทึกลง LocalStorage ทุกครั้งที่มีการเปลี่ยนแปลงบีท
  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('jerji_studio_beats', JSON.stringify(beats));
    }
  }, [beats, isLoaded]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null);

  // Audio Preview State
  const [currentPlayingBeat, setCurrentPlayingBeat] = useState<Beat | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Notification Toast (Optional lightweight visual feedback)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddClick = () => {
    setEditingBeat(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (beat: Beat) => {
    setEditingBeat(beat);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (beatId: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบีทนี้?')) {
      setBeats((prev) => prev.filter((b) => b.id !== beatId));
      if (currentPlayingBeat?.id === beatId) {
        setIsPlaying(false);
        setCurrentPlayingBeat(null);
      }
      showToast('ลบบีทสำเร็จ');
    }
  };

  const handleToggleStatus = (beatId: string, newStatus: BeatStatus) => {
    setBeats((prev) =>
      prev.map((b) => (b.id === beatId ? { ...b, status: newStatus } : b))
    );
    showToast(
      newStatus === 'SOLD_OUT'
        ? 'ทำเครื่องหมายว่า Exclusive Sold Out สำเร็จ'
        : 'ปรับสถานะบีทเป็นเปิดขายแล้ว'
    );
  };

  const handleSaveBeat = (beatData: Partial<Beat>) => {
    if (editingBeat) {
      setBeats((prev) =>
        prev.map((b) => (b.id === editingBeat.id ? ({ ...b, ...beatData } as Beat) : b))
      );
      showToast('อัปเดตข้อมูลบีทเรียบร้อยแล้ว');
    } else {
      const newBeat: Beat = {
        id: `beat-${Date.now()}`,
        title: beatData.title || 'Untitled Beat',
        slug: beatData.slug || 'untitled-beat',
        bpm: beatData.bpm || 140,
        musicalKey: beatData.musicalKey || 'C Minor',
        genre: beatData.genre || 'Trap',
        tags: beatData.tags || [],
        coverImageUrl: beatData.coverImageUrl || '',
        previewAudioUrl: beatData.previewAudioUrl || '',
        status: beatData.status || 'PUBLISHED',
        playsCount: 0,
        likesCount: 0,
        downloadsCount: 0,
        pricing: beatData.pricing || {
          basicMp3: 790,
          premiumWav: 1490,
          trackoutStems: 2990,
          exclusive: 8900,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setBeats((prev) => [newBeat, ...prev]);
      showToast('เพิ่มบีทใหม่เข้าสู่คลังสำเร็จ');
    }
  };

  const handlePlayToggle = (beat: Beat) => {
    if (currentPlayingBeat?.id === beat.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentPlayingBeat(beat);
      setIsPlaying(true);
    }
  };

  const getActiveTabTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'ภาพรวมสตูดิโอ (Studio Overview)';
      case 'beats':
        return 'คลังจัดการบีท (Beat Catalog)';
      case 'analytics':
        return 'สถิติและยอดขาย (Sales Analytics)';
      case 'orders':
        return 'คำสั่งซื้อและธุรกรรม (Orders & Transactions)';
      default:
        return 'แดชบอร์ด';
    }
  };

  // 1. Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-neutral-400 text-sm">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</span>
        </div>
      </div>
    );
  }

  // 2. ถ้ายังไม่ได้ล็อกอิน ให้ขึ้นหน้าแจ้งเตือนและเด้งไปหน้า /login
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 shadow-xl shadow-amber-500/10">
          <Lock className="w-8 h-8" />
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-3">
          Login Required
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
          ต้องเข้าสู่ระบบก่อน จึงจะเข้าหน้าแดชบอร์ดได้
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mb-6 leading-relaxed">
          ระบบกำลังนำคุณไปยังหน้าเข้าสู่ระบบ (Login) เพื่อยืนยันตัวตน...
        </p>
        <Link
          href="/login"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-black text-xs font-bold transition-transform hover:scale-105 shadow-md shadow-amber-500/20"
        >
          <LogIn className="w-4 h-4 stroke-[2.5]" />
          <span>ไปที่หน้าเข้าสู่ระบบทันที</span>
        </Link>
      </div>
    );
  }

  // 3. ถ้าล็อกอินแล้ว แต่ไม่ใช่ Role === 'ADMIN'
  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6 shadow-xl shadow-rose-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 mb-3">
          403 Forbidden • Access Denied
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
          สิทธิ์การเข้าถึงถูกจำกัด (Admin Access Required)
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mb-6 leading-relaxed">
          บัญชีของคุณ (<b className="text-white">{user.email}</b>) ได้รับสิทธิ์เป็น <b>CUSTOMER</b> ซึ่งไม่สามารถเข้าถึงระบบหลังบ้านของเจ้าของร้านได้
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-transform hover:scale-105 shadow-md shadow-amber-500/20"
          >
            <span>ไปที่แดชบอร์ดลูกค้าของคุณ</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold border border-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่หน้าร้านหลัก</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-neutral-100 font-sans antialiased selection:bg-amber-500 selection:text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 border border-amber-500/40 text-amber-300 text-xs shadow-2xl shadow-amber-500/20 animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        beatCount={beats.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-28">
        <AdminHeader
          onAddClick={handleAddClick}
          activeTabTitle={getActiveTabTitle()}
        />

        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              {/* KPI Metrics */}
              <MetricsCards beats={beats} orders={orders} />

              {/* Sales Chart Section */}
              <SalesChart />

              {/* Beat Management Table */}
              <BeatManagementTable
                beats={beats}
                onAddClick={handleAddClick}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                onToggleStatus={handleToggleStatus}
                currentPlayingId={currentPlayingBeat?.id || null}
                isPlaying={isPlaying}
                onPlayToggle={handlePlayToggle}
              />

              {/* Recent Orders Table */}
              <RecentOrdersTable orders={orders} />
            </>
          )}

          {/* BEATS TAB */}
          {activeTab === 'beats' && (
            <div className="space-y-6">
              <BeatManagementTable
                beats={beats}
                onAddClick={handleAddClick}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                onToggleStatus={handleToggleStatus}
                currentPlayingId={currentPlayingBeat?.id || null}
                isPlaying={isPlaying}
                onPlayToggle={handlePlayToggle}
              />
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <MetricsCards beats={beats} orders={orders} />
              <SalesChart />
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <RecentOrdersTable orders={orders} />
            </div>
          )}
        </main>
      </div>

      {/* Upload / Edit Modal */}
      <UploadBeatModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBeat(null);
        }}
        onSave={handleSaveBeat}
        editingBeat={editingBeat}
      />

      {/* Persistent Audio Bar */}
      <AdminAudioBar
        currentBeat={currentPlayingBeat}
        isPlaying={isPlaying}
        onPlayToggle={() => setIsPlaying(!isPlaying)}
        onClose={() => {
          setIsPlaying(false);
          setCurrentPlayingBeat(null);
        }}
      />
    </div>
  );
}
