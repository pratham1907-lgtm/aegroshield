"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface FirestoreUserData {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: 'farmer' | 'seller' | 'vendor' | 'admin';
  isDemo?: boolean;
  district?: string;
  address?: string;
  license?: string;
  storeName?: string;
  createdAt?: any;
  [key: string]: any;
}

export interface AuthContextType {
  user: User | null;
  userData: FirestoreUserData | null;
  loading: boolean;
  isDemo: boolean;
  loginAsDemo: (role?: 'farmer' | 'seller' | 'vendor') => void;
  logout: () => Promise<void>;
  setDemoMode: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isDemo: false,
  loginAsDemo: () => {},
  logout: async () => {},
  setDemoMode: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<FirestoreUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Purge any stale demo keys from browser storage immediately
    if (typeof window !== 'undefined') {
      try {
        const demoKeys = [
          'aegroshield_is_demo_mode',
          'aegroshield_current_user',
          'aegroshield_current_vendor',
          'aegroshield_demo_products',
          'aegroshield_demo_vendors',
          'aegroshield_demo_orders',
          'aegroshield_demo_machinery',
          'aegroshield_demo_labour',
          'aegroshield_real_products',
          'aegroshield_real_vendors',
          'aegroshield_real_orders',
          'aegroshield_real_machinery',
          'aegroshield_real_labour',
        ];
        demoKeys.forEach(k => localStorage.removeItem(k));
      } catch (e) {
        console.warn('[AuthContext] Storage cleanup warning:', e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        const userRef = doc(db, 'users', firebaseUser.uid);
        const unsubDoc = onSnapshot(
          userRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data() as FirestoreUserData;
              setUserData(data);
            } else {
              const fallbackData: FirestoreUserData = {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || 'Farmer Account',
                email: firebaseUser.email || '',
                role: 'farmer',
                isDemo: false,
              };
              setUserData(fallbackData);
            }
            setLoading(false);
          },
          (err) => {
            console.warn('[AuthContext] User doc listen error:', err);
            setLoading(false);
          }
        );

        return () => unsubDoc();
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginAsDemo = () => {
    // Demo accounts permanently disabled
  };

  const setDemoMode = () => {
    // Demo mode permanently disabled
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error('[AuthContext] SignOut error:', e);
    }
    setUser(null);
    setUserData(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('aegroshield_current_user');
      } catch (e) {}
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        isDemo: false,
        loginAsDemo,
        logout,
        setDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
