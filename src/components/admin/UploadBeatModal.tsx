'use client';

import React, { useState, useEffect } from 'react';
import { Beat, BeatStatus } from '@/types';
import {
  X,
  UploadCloud,
  Music,
  FileAudio,
  DollarSign,
  Tag,
  Sliders,
  Image as ImageIcon,
  Check,
  Loader2,
} from 'lucide-react';
import { uploadFileToFirebase } from '@/lib/storage';

interface UploadBeatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (beatData: Partial<Beat>) => void;
  editingBeat?: Beat | null;
}

export default function UploadBeatModal({
  isOpen,
  onClose,
  onSave,
  editingBeat,
}: UploadBeatModalProps) {
  const [title, setTitle] = useState('');
  const [bpm, setBpm] = useState(140);
  const [musicalKey, setMusicalKey] = useState('C Minor');
  const [genre, setGenre] = useState('Trap / Drill');
  const [tags, setTags] = useState('Dark, 808 Heavy, Melodic');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [previewAudioUrl, setPreviewAudioUrl] = useState('');
  const [status, setStatus] = useState<BeatStatus>('PUBLISHED');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadFileToFirebase(file, 'covers');
      setCoverImageUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAudio(true);
    try {
      const url = await uploadFileToFirebase(file, 'previews');
      setPreviewAudioUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingAudio(false);
    }
  };

  // Pricing
  const [priceBasic, setPriceBasic] = useState(790);
  const [pricePremium, setPricePremium] = useState(1490);
  const [priceTrackout, setPriceTrackout] = useState(2990);
  const [priceExclusive, setPriceExclusive] = useState(8900);

  useEffect(() => {
    if (editingBeat) {
      setTitle(editingBeat.title);
      setBpm(editingBeat.bpm);
      setMusicalKey(editingBeat.musicalKey);
      setGenre(editingBeat.genre);
      setTags(editingBeat.tags.join(', '));
      setCoverImageUrl(editingBeat.coverImageUrl);
      setPreviewAudioUrl(editingBeat.previewAudioUrl);
      setStatus(editingBeat.status);
      setPriceBasic(editingBeat.pricing.basicMp3);
      setPricePremium(editingBeat.pricing.premiumWav);
      setPriceTrackout(editingBeat.pricing.trackoutStems);
      setPriceExclusive(editingBeat.pricing.exclusive);
    } else {
      // Default reset for new beat
      setTitle('');
      setBpm(130);
      setMusicalKey('C Minor');
      setGenre('Trap / Drill');
      setTags('');
      setCoverImageUrl('');
      setPreviewAudioUrl('');
      setStatus('PUBLISHED');
      setPriceBasic(790);
      setPricePremium(1490);
      setPriceTrackout(2990);
      setPriceExclusive(8900);
    }
  }, [editingBeat, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!coverImageUrl) {
      alert('กรุณาอัปโหลดรูปภาพปกบีท (Cover Artwork) ผ่าน Firebase Storage หรือระบุ URL');
      return;
    }
    if (!previewAudioUrl) {
      alert('กรุณาอัปโหลดไฟล์เสียงพรีวิว (MP3) ผ่าน Firebase Storage หรือระบุ URL');
      return;
    }

    const tagArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSave({
      id: editingBeat ? editingBeat.id : `beat-${Date.now()}`,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      bpm: Number(bpm),
      musicalKey,
      genre,
      tags: tagArray,
      coverImageUrl,
      previewAudioUrl,
      status,
      pricing: {
        basicMp3: Number(priceBasic),
        premiumWav: Number(pricePremium),
        trackoutStems: Number(priceTrackout),
        exclusive: Number(priceExclusive),
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Music className="w-5 h-5 text-amber-400" />
              {editingBeat ? 'แก้ไขข้อมูลบีท' : 'อัปโหลดบีทใหม่ (Upload New Beat)'}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              กำหนดไฟล์เสียง ปกเพลง ข้อมูลสเปก และราคาตาม License
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Beat Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                ชื่อบีท (Beat Title) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น Midnight Tokyo, Cyber Mirage"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-800/90 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                แนวเพลง (Genre)
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-800/90 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Trap / Drill">Trap / Drill</option>
                <option value="Boom Bap">Boom Bap</option>
                <option value="R&B / Soul">R&B / Soul</option>
                <option value="Synthwave / Pop">Synthwave / Pop</option>
                <option value="Lo-Fi Chill">Lo-Fi Chill</option>
                <option value="Rage / Hyperpop">Rage / Hyperpop</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  BPM (Tempo)
                </label>
                <input
                  type="number"
                  min="60"
                  max="220"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-800/90 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Key
                </label>
                <input
                  type="text"
                  value={musicalKey}
                  onChange={(e) => setMusicalKey(e.target.value)}
                  placeholder="เช่น C Minor"
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-800/90 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-neutral-400" />
                แท็กสไตล์บีท (คั่นด้วยจุลภาค)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="เช่น Dark, Travis Scott, 808 Heavy, Club"
                className="w-full px-4 py-2 rounded-xl bg-neutral-800/90 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Media & Audio Files Section */}
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4" />
              การจัดการไฟล์เสียง & รูปภาพปก
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
                    Cover Artwork (URL หรือเลือกไฟล์)
                  </span>
                  {uploadingCover && (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> กำลังอัปโหลด...
                    </span>
                  )}
                </label>
                <div className="space-y-1.5">
                  <input
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-[11px] border border-neutral-700 cursor-pointer transition-colors">
                    <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                    <span>เลือกไฟล์รูปภาพ (Firebase Storage)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <FileAudio className="w-3.5 h-3.5 text-neutral-400" />
                    Preview Audio (Voice Tag MP3)
                  </span>
                  {uploadingAudio && (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> กำลังอัปโหลด...
                    </span>
                  )}
                </label>
                <div className="space-y-1.5">
                  <input
                    type="url"
                    value={previewAudioUrl}
                    onChange={(e) => setPreviewAudioUrl(e.target.value)}
                    placeholder="https://.../preview.mp3"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-[11px] border border-neutral-700 cursor-pointer transition-colors">
                    <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                    <span>เลือกไฟล์เสียง MP3 (Firebase Storage)</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Note about Cloud Storage */}
            <div className="text-[11px] text-neutral-400 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800 flex items-start gap-2">
              <span className="text-amber-400 font-bold">Firebase Storage:</span>
              <span>
                รองรับการอัปโหลดไฟล์ไปยัง Firebase Storage หรือใส่ลิงก์ตรง โดยไฟล์ตัวเต็ม Untagged WAV และ Stems ZIP สามารถตั้งค่าให้ดาวน์โหลดแบบเฉพาะสมาชิกผ่านหน้า Customer Dashboard
              </span>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              กำหนดราคาตามประเภทสิทธิ์ (License Pricing in THB)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700">
                <span className="block text-[11px] font-medium text-neutral-400">Basic Lease</span>
                <span className="block text-[10px] text-neutral-500 mb-1">Untagged MP3</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-500">฿</span>
                  <input
                    type="number"
                    value={priceBasic}
                    onChange={(e) => setPriceBasic(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700">
                <span className="block text-[11px] font-medium text-neutral-400">Premium Lease</span>
                <span className="block text-[10px] text-neutral-500 mb-1">Master WAV + MP3</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-500">฿</span>
                  <input
                    type="number"
                    value={pricePremium}
                    onChange={(e) => setPricePremium(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700">
                <span className="block text-[11px] font-medium text-neutral-400">Trackout Stems</span>
                <span className="block text-[10px] text-neutral-500 mb-1">WAV + Separated ZIP</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-500">฿</span>
                  <input
                    type="number"
                    value={priceTrackout}
                    onChange={(e) => setPriceTrackout(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <span className="block text-[11px] font-medium text-amber-300">Exclusive Rights</span>
                <span className="block text-[10px] text-amber-400/70 mb-1">สิทธิ์ซื้อขาดแต่ผู้เดียว</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-amber-400">฿</span>
                  <input
                    type="number"
                    value={priceExclusive}
                    onChange={(e) => setPriceExclusive(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-neutral-900 border border-amber-500/40 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400">สถานะเริ่มต้น:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('PUBLISHED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                    status === 'PUBLISHED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  เปิดขาย (Published)
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('DRAFT')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                    status === 'DRAFT'
                      ? 'bg-neutral-700 text-white border border-neutral-600'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  แบบร่าง (Draft)
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('SOLD_OUT')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                    status === 'SOLD_OUT'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  Sold Out
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>บันทึกบีท</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
