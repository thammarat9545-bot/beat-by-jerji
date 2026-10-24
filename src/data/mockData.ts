import { Beat, Order, SalesDataPoint, LicenseShareData } from '../types';

// เริ่มต้นคลังบีทว่างเปล่าตามที่ระบุ (พร้อมให้อัปโหลดบีทจริงของสตูดิโอผ่านระบบ Dashboard)
export const INITIAL_BEATS: Beat[] = [];

// เริ่มต้นรายการคำสั่งซื้อว่างเปล่า
export const RECENT_ORDERS: Order[] = [];

// เริ่มต้นสถิติยอดขายว่างเปล่า
export const MONTHLY_SALES_DATA: SalesDataPoint[] = [];

// เริ่มต้นสัดส่วน License ว่างเปล่า
export const LICENSE_TIER_SHARE: LicenseShareData[] = [];
