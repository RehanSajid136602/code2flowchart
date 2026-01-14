"use client";

import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getFirestore, type Firestore } from "firebase/firestore";

function getEnvConfig() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBsI6i5erDkWUkDXkWCvNVD2ou8DmgQvss",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "logicflow-8c020.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "logicflow-8c020",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "logicflow-8c020.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1015694834540",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1015694834540:web:07b68639c4cdd32ab81149",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-4NEXH968XE",
  };

  // Debug logging
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('Firebase env check:', {
      hasApiKey: !!config.apiKey,
      hasAuthDomain: !!config.authDomain,
      hasProjectId: !!config.projectId,
      hasAppId: !!config.appId,
      usingFallback: !process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    });
  }

  return config;
}

function hasRequired(cfg: { apiKey?: string; authDomain?: string; projectId?: string; appId?: string } | null) {
  return !!(cfg?.apiKey && cfg?.authDomain && cfg?.projectId && cfg?.appId);
}

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  const cfg = getEnvConfig();
  if (!hasRequired(cfg)) {
    const missingVars = [];
    if (!cfg?.apiKey) missingVars.push('NEXT_PUBLIC_FIREBASE_API_KEY');
    if (!cfg?.authDomain) missingVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
    if (!cfg?.projectId) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    if (!cfg?.appId) missingVars.push('NEXT_PUBLIC_FIREBASE_APP_ID');

    console.error(
      'Firebase config is incomplete. Missing environment variables: ' + missingVars.join(', ') + '.\n' +
      'Please add these to your .env.local file and restart the dev server. See .env.example for reference.'
    );

    // Also show what environment variables are available (for debugging)
    console.log('Available NEXT_PUBLIC env vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));

    return null;
  }
  return getApps().length ? getApp() : initializeApp(cfg);
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

export function getFirebaseFirestore(): Firestore | null {
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    if (!(await isSupported())) return null;
    return getAnalytics(app);
  } catch {
    return null;
  }
}
