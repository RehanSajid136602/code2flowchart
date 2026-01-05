"use client";

import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

import { getFirestore, type Firestore } from "firebase/firestore";

// Load config from NEXT_PUBLIC_ env vars
function getEnvConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}

// Dev fallback to unblock local development if envs are missing.
// NOTE: If you hit Storage errors, try switching storageBucket to "logicflow-8c020.appspot.com".
const DEV_FALLBACK_CONFIG = {
  apiKey: "AIzaSyBsI6i5erDkWUkDXkWCvNVD2ou8DmgQvss",
  authDomain: "logicflow-8c020.firebaseapp.com",
  projectId: "logicflow-8c020",
  storageBucket: "logicflow-8c020.firebasestorage.app",
  messagingSenderId: "1015694834540",
  appId: "1:1015694834540:web:07b68639c4cdd32ab81149",
  measurementId: "G-4NEXH968XE",
};

function hasRequired(cfg: { apiKey?: string; authDomain?: string; projectId?: string; appId?: string } | null) {
  return !!(cfg?.apiKey && cfg?.authDomain && cfg?.projectId && cfg?.appId);
}

function getConfig() {
  const envCfg = getEnvConfig();
  if (hasRequired(envCfg)) return envCfg;
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    return DEV_FALLBACK_CONFIG;
  }
  return envCfg;
}

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  const cfg = getConfig();
  if (!hasRequired(cfg)) return null;
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
