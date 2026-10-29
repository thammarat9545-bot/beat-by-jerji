'use client';

import React, { useState, useEffect } from 'react';
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

// นำเข้า Supabase
import { supabase } from '@/lib/supabase';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [beats, setBeats] = useState<Beat[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isLoaded, setIsLoaded] = useState(false);

  // ตรวจสอบสถานะล็อกอิน
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // ดึงข้อมูลบีทจาก Supabase แทน LocalStorage
  useEffect(() => {
    const fetchBeats = async () => {
      try {
        const { data, error } = await supabase
          .from('beats')
          .select('*')
          .order('createdAt', { ascending: false });

        if (error) throw error;
        if (data) setBeats(data as Beat[]);
      } catch (err: any) {
        console.error('Error fetching beats:', err.message);
        showToast('ดึงข้อมูลบีทไม่สำเร็จ: ' + err.message);
      }
    };

    fetchBeats();

    // ส่วนของ Order ยังคงดึงจาก LocalStorage ไว้ก่อน
    try {
      const savedOrders = localStorage.getItem('jerji_studio_orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoaded(true);
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null);
  const [currentPlayingBeat, setCurrentPlayingBeat] = useState<Beat | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
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

  // ลบบีทออกจาก Supabase
  const handleDeleteClick = async (beatId: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบีทนี้ออกจากระบบ?')) {
      try {
        const { error } = await supabase.from('beats').delete().eq('id', beatId);
        
        if (error) throw error;

        setBeats((prev) => prev.filter((b) => b.id !== beatId));
        if (currentPlayingBeat?.id === beatId) {
          setIsPlaying(false);
          setCurrentPlayingBeat(null);
        }
        showToast('ลบบีทสำเร็จ');
      } catch (err: any) {
        alert('เกิดข้อผิดพลาดในการลบบีท: ' + err.message);
      }
    }
  };

  // เปลี่ยนสถานะบีทใน Supabase
  const handleToggleStatus = async (beatId: string, newStatus: BeatStatus) => {
    try {
      const { error } = await supabase
        .from('beats')
        .update({ status: newStatus, updatedAt: new Date().toISOString() })
        .eq('id', beatId);

      if (error) throw error;

      setBeats((prev) =>
        prev.map((b) => (b.id === beatId ? { ...b, status: newStatus } : b))
      );
      showToast(
        newStatus === 'SOLD_OUT'
          ? 'ทำเครื่องหมายว่า Exclusive Sold Out สำเร็จ'
          : 'ปรับสถานะบีทสำเร็จ'
      );
    } catch (err: any) {
      alert('เปลี่ยนสถานะไม่สำเร็จ: ' + err.message);
    }
  };

  // บันทึก/อัปเดตบีทลง Supabase
  const handleSaveBeat = async (beatData: Partial<Beat>) => {
    try {
      if (editingBeat) {
        // อัปเดตข้อมูลเก่า
        const updatedBeat = { 
          ...editingBeat, 
          ...beatData, 
          price: Number(beatData.price || editingBeat.price || 1200),
          updatedAt: new Date().toISOString()
        };

        const { error } = await supabase
          .from('beats')
          .update(updatedBeat)
          .eq('id', editingBeat.id);

        if (error) throw error;

        setBeats((prev) =>
          prev.map((b) => (b.id === editingBeat.id ? (updatedBeat as Beat) : b))
        );
        showToast('อัปเดตข้อมูลบีทลง Database เรียบร้อยแล้ว');
      } else {
        // เพิ่มบีทใหม่
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
          price: Number(beatData.price || 1200),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const { error } = await supabase.from('beats').insert(newBeat);

        if (error) throw error;

        setBeats((prev) => [newBeat, ...prev]);
        showToast('เพิ่มบีทใหม่เข้าสู่ Database สำเร็จ');
      }
    } catch (err: any) {
      alert('บันทึกข้อมูลไม่สำเร็จ: ' + err.message);
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
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 border border-amber-500/40 text-amber-300 text-xs shadow-2xl shadow-amber-500/20 animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        beatCount={beats.length}
      />

      <div className="flex-1 flex flex-col min-w-0 pb-28">
        <AdminHeader
          onAddClick={handleAddClick}
          activeTabTitle={getActiveTabTitle()}
        />

        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {activeTab === 'overview' && (
            <>
              <MetricsCards beats={beats} orders={orders} />
              <SalesChart />
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
              <RecentOrdersTable orders={orders} />
            </>
          )}

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

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <MetricsCards beats={beats} orders={orders} />
              <SalesChart />
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <RecentOrdersTable orders={orders} />
            </div>
          )}
        </main>
      </div>

      <UploadBeatModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBeat(null);
        }}
        onSave={handleSaveBeat}
        editingBeat={editingBeat}
      />

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