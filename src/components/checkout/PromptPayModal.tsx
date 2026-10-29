'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generatePromptPayPayload } from '@/lib/promptpay';
import { Beat, LicenseType, Order } from '@/types';
import {
  X,
  CheckCircle2,
  Clock,
  UploadCloud,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Download,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import Link from 'next/link';

interface PromptPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  beat: Beat | null;
  licenseType?: LicenseType;
  price: number;
  userEmail: string;
  userName: string;
  onPaymentSuccess: (order: Order) => void;
}

export default function PromptPayModal({
  isOpen,
  onClose,
  beat,
  licenseType = 'EXCLUSIVE',
  price,
  userEmail,
  userName,
  onPaymentSuccess,
}: PromptPayModalProps) {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 นาที
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [useCustomQrImage, setUseCustomQrImage] = useState(true);

  const promptPayTarget =
    process.env.NEXT_PUBLIC_PROMPTPAY_ID && process.env.NEXT_PUBLIC_PROMPTPAY_ID !== '0899999999'
      ? process.env.NEXT_PUBLIC_PROMPTPAY_ID
      : '0927236792';
  const recipientName =
    process.env.NEXT_PUBLIC_PROMPTPAY_NAME && process.env.NEXT_PUBLIC_PROMPTPAY_NAME !== 'BEAT BY JERJI STUDIO'
      ? process.env.NEXT_PUBLIC_PROMPTPAY_NAME
      : (process.env.NEXT_PUBLIC_PROMPTPAY_NAME || 'ธรรมรัตน์  ไพลสาลี');

  // สร้าง EMVCo Payload จริงตามมาตรฐานธนาคารแห่งประเทศไทย
  const qrPayload = generatePromptPayPayload(promptPayTarget, price);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isSuccess) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isSuccess]);

  if (!isOpen || !beat) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const copyToClipboard = (text: string, type: 'amount' | 'target') => {
    navigator.clipboard.writeText(text);
    if (type === 'amount') {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    } else {
      setCopiedTarget(true);
      setTimeout(() => setCopiedTarget(false), 2000);
    }
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const orderNumber = `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber,
        customerName: userName || userEmail || 'ลูกค้าสตูดิโอ',
        customerEmail: userEmail,
        totalAmount: price,
        currency: 'THB',
        status: 'COMPLETED',
        provider: 'PROMPTPAY',
        items: [
          {
            id: `item-${Date.now()}`,
            beatId: beat.id,
            beatTitle: beat.title,
            coverImageUrl: beat.coverImageUrl,
            previewAudioUrl: beat.previewAudioUrl,
            untaggedWavUrl: beat.untaggedWavUrl,
            stemsZipUrl: beat.stemsZipUrl,
            bpm: beat.bpm,
            musicalKey: beat.musicalKey,
            genre: beat.genre,
            licenseType,
            price,
          },
        ],
        createdAt: new Date().toISOString(),
      };

      setIsProcessing(false);
      setIsSuccess(true);
      setCompletedOrder(newOrder);
      onPaymentSuccess(newOrder);
    }, 1500);
  };

  const getLicenseLabel = (type: LicenseType) => {
    switch (type) {
      case 'EXCLUSIVE':
        return 'Exclusive Rights (ซื้อขาดแต่ผู้เดียว)';
      case 'TRACKOUT_STEMS':
        return 'Trackout Stems (WAV + ZIP แทร็กแยก)';
      case 'PREMIUM_WAV':
        return 'Premium Lease (Master WAV + MP3)';
      case 'BASIC_MP3':
        return 'Basic MP3 Lease (Untagged MP3)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-8 text-white">
        {/* Top PromptPay Header Bar */}
        <div className="bg-[#113566] px-6 py-4 flex items-center justify-between border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            {/* PromptPay Official Logo Branding */}
            <div className="bg-white px-2.5 py-1 rounded-lg flex items-center">
              <span className="text-xs font-black tracking-tight text-[#113566]">
                พร้อมเพย์ PromptPay
              </span>
            </div>
            <span className="text-xs text-blue-200 font-medium">THAI QR PAYMENT</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {!isSuccess ? (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Beat & License Summary */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={beat.coverImageUrl}
                alt={beat.title}
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-bold text-white truncate">{beat.title}</h4>
                <p className="text-xs text-amber-400 font-medium truncate mt-0.5">
                  สิทธิ์การใช้งานบีทตัวเต็ม (Full Beat Rights)
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {beat.bpm} BPM • {beat.musicalKey} • {beat.genre}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-[10px] text-neutral-400 block">ยอดชำระ</span>
                <span className="text-lg font-black text-amber-400 font-mono">
                  ฿{price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* QR Code Card */}
            <div className="bg-white rounded-2xl p-6 text-black flex flex-col items-center justify-center shadow-xl">
              <div className="text-center mb-3">
                <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  สแกนผ่านแอปธนาคารใดก็ได้
                </p>
                <p className="text-sm font-bold text-neutral-900">{recipientName}</p>
              </div>

              {/* QR Code (รองรับทั้งรูปภาพจริงจากแอปธนาคาร และ Dynamic QR) */}
              <div className="p-2 border-2 border-dashed border-neutral-300 rounded-2xl bg-white max-w-[280px] w-full flex items-center justify-center min-h-[220px]">
                {useCustomQrImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src="/29491.jpg"
                    alt="PromptPay QR Code"
                    className="max-h-[350px] w-auto max-w-full rounded-xl object-contain shadow-sm"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.triedJpg) {
                        target.dataset.triedJpg = 'true';
                        target.src = '/promptpay-qr.jpg';
                      } else if (!target.dataset.triedPng) {
                        target.dataset.triedPng = 'true';
                        target.src = '/promptpay-qr.png';
                      } else {
                        // หากยังไม่มีการใส่รูปภาพในโฟลเดอร์ public จะสลับไปใช้ QR Code ปกติอัตโนมัติ
                        setUseCustomQrImage(false);
                      }
                    }}
                  />
                ) : (
                  <QRCodeSVG
                    value={qrPayload}
                    size={210}
                    level="M"
                    includeMargin={true}
                  />
                )}
              </div>

              {/* Exact Amount Highlight */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#113566]">
                  <span className="text-xs font-semibold">ยอดโอน:</span>
                  <span className="text-base font-black font-mono">
                    ฿{price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(price.toFixed(2), 'amount')}
                    className="p-1 hover:text-blue-900 cursor-pointer"
                    title="คัดลอกจำนวนเงิน"
                  >
                    {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* PromptPay Target */}
              <div className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
                <span>พร้อมเพย์: <b>{promptPayTarget}</b></span>
                <button
                  onClick={() => copyToClipboard(promptPayTarget, 'target')}
                  className="p-1 hover:text-black cursor-pointer"
                  title="คัดลอกหมายเลขพร้อมเพย์"
                >
                  {copiedTarget ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center justify-between text-xs px-2 text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>QR Code มีอายุการใช้งาน:</span>
              </span>
              <span className="font-mono font-bold text-amber-400 text-sm">{formattedTime}</span>
            </div>

            {/* Slip Upload & Proof (Optional) */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-neutral-300">
                หลักฐานการโอนเงิน (สลิปโอนเงิน):
              </label>
              <label className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-dashed border-neutral-700 bg-neutral-950/60 hover:bg-neutral-950 text-neutral-300 text-xs font-medium cursor-pointer transition-colors">
                <UploadCloud className="w-4 h-4 text-amber-400" />
                <span className="truncate">
                  {slipFile ? slipFile.name : 'คลิกเพื่อแนบรูปสลิปโอนเงิน (JPG / PNG)'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    กำลังตรวจสอบการชำระเงิน...
                  </span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>แจ้งชำระเงินเรียบร้อยแล้ว</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-neutral-500">
                ระบบจะตรวจสอบและปลดล็อกไฟล์บีทตัวเต็มให้ดาวน์โหลดใน My Library ทันที
              </p>
            </div>
          </div>
        ) : (
          /* Payment Success State */
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 animate-in zoom-in">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block mb-3">
                PAYMENT COMPLETED
              </span>
              <h3 className="text-2xl font-black text-white">ชำระเงินสำเร็จเรียบร้อย!</h3>
              <p className="text-xs text-neutral-400 mt-2 max-w-sm mx-auto">
                ขอบคุณที่สั่งซื้อบีทเพลงจาก <b>Beat by Jerji</b> สิทธิ์การใช้งานและไฟล์เสียงแท้คุณภาพสูงของคุณถูกเพิ่มเข้าสู่คลังส่วนตัวแล้ว
              </p>
            </div>

            {/* Order Receipt Box */}
            {completedOrder && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-left text-xs space-y-2">
                <div className="flex justify-between text-neutral-400">
                  <span>เลขที่คำสั่งซื้อ:</span>
                  <span className="font-mono text-white font-semibold">
                    {completedOrder.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>รายการบีท:</span>
                  <span className="text-white font-medium">{beat.title}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>สิทธิ์ที่ได้รับ:</span>
                  <span className="text-amber-400 font-semibold">สิทธิ์การใช้งานบีทตัวเต็ม (Full Rights)</span>
                </div>
                <div className="flex justify-between text-neutral-400 pt-2 border-t border-neutral-850">
                  <span>ยอดชำระสุทธิ:</span>
                  <span className="text-base font-bold text-amber-400 font-mono">
                    ฿{price.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <Link
                href="/dashboard"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-extrabold text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>ไปที่คลังของฉัน เพื่อดาวน์โหลดไฟล์</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                ปิดหน้าต่างและเลือกซื้อบีทต่อ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
