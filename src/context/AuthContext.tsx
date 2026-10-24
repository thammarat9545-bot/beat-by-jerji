'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import { Role } from '@/types';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: Role;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isFirebaseReady: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultAdminEmails = ['admin@beatbyjerji.com', 'jerji.beats@studio.com'];
const envAdminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
  ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase())
  : [];
const ADMIN_EMAILS = Array.from(new Set([...defaultAdminEmails, ...envAdminEmails]));

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ตรวจสอบสถานะการล็อกอินจริงผ่าน Firebase
  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          const role: Role =
            firebaseUser.email && ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase())
              ? 'ADMIN'
              : 'CUSTOMER';

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'ลูกค้าผู้รักเสียงเพลง',
            photoURL: firebaseUser.photoURL,
            role,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    if (!auth) {
      throw new Error('ระบบ Authentication ขัดข้อง กรุณาลองใหม่อีกครั้ง');
    }
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    if (!auth) {
      throw new Error('ระบบ Authentication ขัดข้อง กรุณาลองใหม่อีกครั้ง');
    }
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: name });
      const role: Role = ADMIN_EMAILS.includes(email.toLowerCase()) ? 'ADMIN' : 'CUSTOMER';
      setUser({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: name,
        photoURL: cred.user.photoURL,
        role,
      });
    }
  };

  const loginWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error('ระบบ Authentication ขัดข้อง กรุณาลองใหม่อีกครั้ง');
    }
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseReady: isFirebaseConfigured,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
