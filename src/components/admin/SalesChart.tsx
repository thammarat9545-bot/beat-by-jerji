'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { MONTHLY_SALES_DATA, LICENSE_TIER_SHARE } from '@/data/mockData';
import { TrendingUp, PieChart as PieIcon, BarChart2 } from 'lucide-react';

export default function SalesChart() {
  const hasSalesData = MONTHLY_SALES_DATA.length > 0;
  const hasShareData = LICENSE_TIER_SHARE.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue Trend Area Chart */}
      <div className="lg:col-span-2 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">แนวโน้มยอดขายรายเดือน (Revenue Trends)</h3>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              สถิติยอดขายรวมคำสั่งซื้อผ่าน Stripe, PromptPay & Firebase
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-neutral-400">ยอดขายเดือนปัจจุบัน</span>
            <p className="text-lg font-bold text-amber-400">฿0</p>
          </div>
        </div>

        {hasSalesData ? (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_SALES_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="month" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#737373"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `฿${val / 1000}k`}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[240px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-neutral-800 rounded-xl bg-neutral-950/40">
            <BarChart2 className="w-10 h-10 text-neutral-600 mb-2" />
            <p className="text-sm font-semibold text-neutral-300">ยังไม่มีข้อมูลยอดขายในขณะนี้</p>
            <p className="text-xs text-neutral-500 max-w-sm mt-1">
              เมื่อลูกค้าเริ่มทำการสั่งซื้อบีทผ่านหน้าร้าน กราฟแนวโน้มรายได้และสถิติจะแสดงขึ้นที่นี่โดยอัตโนมัติ
            </p>
          </div>
        )}
      </div>

      {/* License Tier Share */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-400" />
              สัดส่วน License ที่ขายได้
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mb-4">
            วิเคราะห์ประเภทสิทธิ์ที่ลูกค้านิยมซื้อมากที่สุด
          </p>

          {hasShareData ? (
            <div className="h-[180px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={LICENSE_TIER_SHARE}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {LICENSE_TIER_SHARE.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#171717" strokeWidth={2} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[180px] flex flex-col items-center justify-center text-center p-4 border border-dashed border-neutral-800 rounded-xl bg-neutral-950/40">
              <PieIcon className="w-8 h-8 text-neutral-600 mb-2" />
              <p className="text-xs font-semibold text-neutral-400">ยังไม่มีประวัติสัดส่วน License</p>
              <p className="text-[11px] text-neutral-500 mt-1">รอการสั่งซื้อรายการแรก</p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-neutral-800">
          <p className="text-[11px] text-neutral-500 text-center">
            ระบบรองรับ 4 ระดับสิทธิ์: Basic, Premium, Stems, Exclusive
          </p>
        </div>
      </div>
    </div>
  );
}
