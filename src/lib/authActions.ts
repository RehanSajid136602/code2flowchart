'use client';

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';

async function ensureAuthConfigured() {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error(
      'Firebase Auth is not configured. Ensure .env.local is set and reload.'
    );
  }
  try {
    const apiKey = (auth.app.options as { apiKey?: string })?.apiKey;
    if (!apiKey) throw new Error('Missing Firebase API key');
    const res = await fetch(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=${encodeURIComponent(
        apiKey
      )}`
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg: string = data?.error?.message || `HTTP ${res.status}`;
      if (msg.includes('CONFIGURATION_NOT_FOUND')) {
        throw new Error(
          'Firebase Auth backend is not enabled for this project/API key. In Firebase Console: Authentication > Get started, enable Email/Password & Google, and add your dev domain in Authorized domains.'
        );
      }
      throw new Error(`Auth configuration check failed: ${msg}`);
    }
  } catch (e) {
    throw e;
  }
}

function requireAuth() {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error(
      'Firebase Auth is not configured. Ensure .env.local is set and reload.'
    );
  }
  return auth;
}

export async function signInWithGoogle() {
  await ensureAuthConfigured();
  const auth = requireAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return signInWithPopup(auth, provider);
}

export async function signUpWithEmail(params: {
  email: string;
  password: string;
  displayName?: string;
}) {
  await ensureAuthConfigured();
  const auth = requireAuth();
  const { email, password, displayName } = params;
  const trimmedEmail = email.trim();

  try {
    const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);

    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }

    await sendEmailVerification(cred.user);

    return cred;
  } catch (e: any) {
    if (e?.code === 'auth/invalid-credential') {
      throw new Error('The credentials provided are invalid or have expired.');
    }
    throw e;
  }
}

export async function signInWithEmail(params: { email: string; password: string }) {
  await ensureAuthConfigured();
  const auth = requireAuth();
  try {
    return await signInWithEmailAndPassword(auth, params.email.trim(), params.password);
  } catch (e: any) {
    if (e?.code === 'auth/invalid-credential') {
      throw new Error('Invalid email or password. Please check your credentials and try again.');
    }
    throw e;
  }
}

export async function resendVerificationEmail() {
  const auth = requireAuth();
  if (!auth.currentUser) throw new Error('Not signed in');

  // Refresh user state to avoid stale emailVerified flag or token
  const { reload } = await import('firebase/auth');
  try {
    await reload(auth.currentUser);
  } catch { }

  if (auth.currentUser.emailVerified) {
    return; // Already verified, nothing to send
  }

  // Configure where the verification link should send users back
  const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
  const actionCodeSettings = origin
    ? {
      url: `${origin}/login?verified=1`,
      handleCodeInApp: true,
    }
    : undefined;

  try {
    const { sendEmailVerification } = await import('firebase/auth');
    await sendEmailVerification(auth.currentUser, actionCodeSettings as any);
  } catch (e: unknown) {
    const error = e as { code?: string };
    const code = error?.code || '';
    if (code === 'auth/too-many-requests') {
      throw new Error('Too many attempts. Please wait a few minutes before trying again.');
    }
    if (code === 'auth/operation-not-allowed') {
      throw new Error('Email/password sign-in is disabled in Firebase Auth. Enable it in the Firebase Console.');
    }
    if (code === 'auth/invalid-continue-uri' || code === 'auth/unauthorized-continue-uri') {
      throw new Error('The return URL is not authorized. Add your domain (e.g., localhost) in Firebase Auth > Settings > Authorized domains.');
    }
    throw e;
  }
}

export async function resetPassword(email: string) {
  await ensureAuthConfigured();
  const auth = requireAuth();
  return sendPasswordResetEmail(auth, email);
}

export async function logout() {
  const auth = requireAuth();
  return signOut(auth);
}
