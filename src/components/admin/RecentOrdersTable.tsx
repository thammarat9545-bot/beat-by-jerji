'use client';

import React, { useState } from 'react';
import { Order, LicenseType } from '@/types';
import { CheckCircle2, Clock, AlertCircle, ShieldCheck, ShoppingBag, FileText, ExternalLink, X, Eye } from 'lucide-react';

interface RecentOrdersTableProps {
  orders: Order[];
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const [selectedSlip, setSelectedSlip] = useState<{
    url: string;
    orderNumber: string;
    customerName: string;
    amount: number;
    date: string;
  } | null>(null);

  const getLicenseBadge = (_type?: LicenseType) => {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
        Full Beat License
      </span>
    );
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> สำเร็จ
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> รอชำระเงิน
          </span>
        );
      case 'FAILED':
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" /> ล้มเหลว
          </span>
        );
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-md overflow-hidden">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>คำสั่งซื้อล่าสุด (Recent Transactions)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                {orders.length} รายการ
              </span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              ประวัติการซื้อสิทธิ์บีทจากลูกค้า ตรวจสอบสลิปโอนเงิน และระบบออก Signed URLs ปลอดภัย
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Payment Gateway & Webhook Ready</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/40 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">เลขที่คำสั่งซื้อ</th>
                <th className="py-3 px-4">ลูกค้า</th>
                <th className="py-3 px-4">บีทที่สั่งซื้อ</th>
                <th className="py-3 px-4">สิทธิ์การใช้งาน</th>
                <th className="py-3 px-4">ช่องทาง</th>
                <th className="py-3 px-4 text-right">ยอดชำระ</th>
                <th className="py-3 px-4 text-center">สลิปโอนเงิน</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-xs">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShoppingBag className="w-8 h-8 text-neutral-600" />
                      <p className="text-sm font-medium text-neutral-400">ยังไม่มีรายการคำสั่งซื้อในระบบ</p>
                      <p className="text-xs text-neutral-600">คำสั่งซื้อจากลูกค้าจะปรากฏที่นี่หลังชำระเงินสำเร็จ</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const firstItem = order.items?.[0];
                  return (
                    <tr key={order.id} className="hover:bg-neutral-800/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-neutral-300">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-white">{order.customerName}</p>
                          <p className="text-[11px] text-neutral-500">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {firstItem ? (
                          <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={firstItem.coverImageUrl}
                              alt={firstItem.beatTitle}
                              className="w-7 h-7 rounded-lg object-cover"
                            />
                            <span className="font-medium text-neutral-200">
                              {firstItem.beatTitle}
                            </span>
                          </div>
                        ) : (
                          <span className="text-neutral-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {getLicenseBadge(firstItem?.licenseType)}
                      </td>
                      <td className="py-3 px-4 font-medium text-neutral-400">
                        <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700/60 text-[10px]">
                          {order.provider}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                        ฿{order.totalAmount.toLocaleString()}
                      </td>
                      {/* สลิปโอนเงิน */}
                      <td className="py-3 px-4 text-center">
                        {order.slipUrl ? (
                          <button
                            onClick={() =>
                              setSelectedSlip({
                                url: order.slipUrl!,
                                orderNumber: order.orderNumber,
                                customerName: order.customerName,
                                amount: order.totalAmount,
                                date: order.createdAt,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-medium text-[11px] transition-all hover:scale-105 cursor-pointer shadow-sm"
                            title="คลิกเพื่อดูรูปสลิปโอนเงิน"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={order.slipUrl}
                              alt="slip preview"
                              className="w-4 h-4 rounded object-cover border border-amber-400/40"
                            />
                            <Eye className="w-3.5 h-3.5" />
                            <span>ดูสลิป</span>
                          </button>
                        ) : (
                          <span className="text-neutral-600 text-[11px]">ไม่มีสลิป</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(order.status)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Modal Preview for Admin */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl my-8">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">หลักฐานการชำระเงิน (สลิปโอนเงิน)</h4>
                  <p className="text-[11px] font-mono text-neutral-400">{selectedSlip.orderNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSlip(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Image & Details */}
            <div className="p-6 space-y-4">
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex justify-between items-center text-xs">
                <div>
                  <span className="text-neutral-400 block text-[10px]">ลูกค้า</span>
                  <span className="font-semibold text-white">{selectedSlip.customerName}</span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-400 block text-[10px]">ยอดชำระ</span>
                  <span className="font-black text-amber-400 font-mono text-base">฿{selectedSlip.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* The Slip Image */}
              <div className="rounded-2xl border border-neutral-800 overflow-hidden bg-neutral-950 flex items-center justify-center p-2 max-h-[500px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedSlip.url}
                  alt="Payment Slip"
                  className="w-full h-auto max-h-[460px] object-contain rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <a
                  href={selectedSlip.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>เปิดรูปขนาดเต็ม</span>
                </a>
                <button
                  onClick={() => setSelectedSlip(null)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
