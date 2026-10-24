import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";

// ดึงค่าจากไฟล์ .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ตรวจสอบว่ามีการใส่ค่าจริงใน .env.local หรือไม่
export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

// Fallback config จำลองเพื่อป้องกัน error ตอน Next.js ทำ SSR/Build ก่อนใส่คีย์จริง
const fallbackConfig = {
  apiKey: "AIzaSyDemoKeyForBuildEnvironment1234567",
  authDomain: "beat-by-jerji.firebaseapp.com",
  projectId: "beat-by-jerji",
  storageBucket: "beat-by-jerji.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456",
};

const activeConfig = isFirebaseConfigured ? firebaseConfig : fallbackConfig;

// เช็คว่ามีการ initialize app ไปแล้วหรือยัง (ป้องกัน error ตอน Next.js รีเฟรชหน้าเว็บ)
const app: FirebaseApp = !getApps().length ? initializeApp(activeConfig) : getApp();

// เรียกใช้ Authentication และ Google Provider
const auth: Auth = getAuth(app);
const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();

// เรียกใช้ Cloud Storage (สำหรับไฟล์มีเดีย ปกเพลง และไฟล์เสียง)
const storage: FirebaseStorage = getStorage(app);

export { app, auth, storage, googleProvider };
