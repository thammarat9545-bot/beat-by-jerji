export type Role = 'CUSTOMER' | 'ADMIN';

export type BeatStatus = 'PUBLISHED' | 'SOLD_OUT' | 'DRAFT' | 'ARCHIVED';

export type LicenseType = 'BASIC_MP3' | 'PREMIUM_WAV' | 'TRACKOUT_STEMS' | 'EXCLUSIVE';

export type OrderStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';

export type PaymentProvider = 'STRIPE' | 'PROMPTPAY' | 'OMISE' | 'MOCK';

export interface LicensePricing {
  basicMp3: number;
  premiumWav: number;
  trackoutStems: number;
  exclusive: number;
}

export interface Beat {
  id: string;
  title: string;
  slug: string;
  bpm: number;
  musicalKey: string;
  genre: string;
  tags: string[];
  coverImageUrl: string;
  previewAudioUrl: string; // Preview with voice tag
  untaggedWavUrl?: string; // High-res WAV
  stemsZipUrl?: string;    // Track stems ZIP
  status: BeatStatus;
  playsCount: number;
  likesCount: number;
  downloadsCount: number;
  price: number;           // ราคาเดียวที่กำหนดได้เอง (THB)
  pricing?: LicensePricing;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  beatId: string;
  beatTitle: string;
  coverImageUrl: string;
  previewAudioUrl?: string;
  untaggedWavUrl?: string;
  stemsZipUrl?: string;
  bpm?: number;
  musicalKey?: string;
  genre?: string;
  licenseType?: LicenseType;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  provider: PaymentProvider;
  items: OrderItem[];
  createdAt: string;
}

export interface SalesDataPoint {
  month: string;
  revenue: number;
  orders: number;
}

export interface LicenseShareData {
  name: string;
  value: number;
  color: string;
}
