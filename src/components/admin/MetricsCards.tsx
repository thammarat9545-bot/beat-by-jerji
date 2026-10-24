'use client';

import React from 'react';
import { DollarSign, Music, ShoppingBag, Headphones, TrendingUp } from 'lucide-react';
import { Beat, Order } from '@/types';

interface MetricsCardsProps {
  beats: Beat[];
  orders: Order[];
}

export default function MetricsCards({ beats, orders }: MetricsCardsProps) {
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalPlays = beats.reduce((sum, b) => sum + b.playsCount, 0);
  const soldOutCount = beats.filter((b) => b.status === 'SOLD_OUT').length;
  const activeCount = beats.filter((b) => b.status === 'PUBLISHED').length;

  const cards = [
    {
      title: 'รายได้รวม (Total Revenue)',
      value: `฿${totalRevenue.toLocaleString()}`,
      change: '+24.5%',
      isPositive: true,
      description: 'เทียบกับเดือนที่แล้ว',
      icon: DollarSign,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'บีทในระบบ (Active Beats)',
      value: `${activeCount} บีท`,
      change: `${soldOutCount} Exclusive Sold`,
      isPositive: true,
      description: `จากทั้งหมด ${beats.length} รายการ`,
      icon: Music,
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    {
      title: 'คำสั่งซื้อสำเร็จ (Orders)',
      value: `${completedOrders.length} ออเดอร์`,
      change: '+18.2%',
      isPositive: true,
      description: 'อัตราจ่ายเงินสำเร็จ 96%',
      icon: ShoppingBag,
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'ยอดเปิดฟังพรีวิว (Plays)',
      value: totalPlays.toLocaleString(),
      change: '+31.4%',
      isPositive: true,
      description: 'สตรีมผ่านตัวเล่นหน้าเว็บ',
      icon: Headphones,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} border p-5 transition-all hover:scale-[1.01] hover:shadow-lg backdrop-blur-sm bg-neutral-900/60`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-400">{card.title}</span>
              <div className="p-2 rounded-xl bg-neutral-800/80 border border-neutral-700/50">
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold tracking-tight text-white">{card.value}</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium border ${card.badgeColor}`}
              >
                <TrendingUp className="w-3 h-3" />
                {card.change}
              </span>
              <span className="text-neutral-400 truncate">{card.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
