"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import {
  userLogin, userLogout,
  enableDemoMode, disableDemoMode, isDemoMode,
} from '@/lib/ecommerce-service';

export interface FirestoreUserData {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: 'farmer' | 'vendor' | 'admin';
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
  loginAsDemo: (role?: 'farmer' | 'vendor') => void;
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
  const [isDemo, setIsDemo] = useState<boolean>(false);

  useEffect(() => {
    // Sync initial demo state from storage
    if (isDemoMode()) {
      setIsDemo(true);
      setUserData({
        uid: 'demo_farmer_123',
        name: 'Demo Farmer',
        email: 'demo@aegroshield.in',
        role: 'farmer',
        district: 'Meerut',
        isDemo: true,
      });
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsDemo(false);
        disableDemoMode();

        const userRef = doc(db, 'users', firebaseUser.uid);
        const unsubDoc = onSnapshot(
          userRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data() as FirestoreUserData;
              setUserData(data);
              userLogin(data.email || firebaseUser.email || '', false);
            } else {
              const fallbackData: FirestoreUserData = {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || 'Farmer Account',
                email: firebaseUser.email || '',
                role: 'farmer',
                isDemo: false,
              };
              setUserData(fallbackData);
              userLogin(fallbackData.email, false);
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
        if (!isDemoMode()) {
          setUserData(null);
          setIsDemo(false);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginAsDemo = (role: 'farmer' | 'vendor' = 'farmer') => {
    enableDemoMode(true);
    setIsDemo(true);
    if (role === 'vendor') {
      setUserData({
        uid: 'demo_vendor_123',
        name: 'Kisan Seva Kendra Owner',
        email: 'vendor@aegroshield.in',
        role: 'vendor',
        storeName: 'Kisan Seva Kendra',
        district: 'Meerut',
        isDemo: true,
      });
    } else {
      setUserData({
        uid: 'demo_farmer_123',
        name: 'Demo Farmer',
        email: 'demo@aegroshield.in',
        role: 'farmer',
        district: 'Meerut',
        isDemo: true,
      });
    }
  };

  const setDemoMode = (val: boolean) => {
    if (val) {
      enableDemoMode(true);
      setIsDemo(true);
    } else {
      disableDemoMode();
      setIsDemo(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error('[AuthContext] SignOut error:', e);
    }
    setUser(null);
    setUserData(null);
    setIsDemo(false);
    disableDemoMode();
    userLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        isDemo,
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
