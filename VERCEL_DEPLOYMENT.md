# Vercel Deployment & Firebase Production Guide

To successfully deploy **LogicFlow AI** to Vercel with Firebase, follow these critical steps:

## 1. Firebase Production Environment
Since you are using Firebase, your production site on Vercel needs to point to your live Firebase project.

### Required Environment Variables
Add these to your **Vercel Project Settings > Environment Variables**:

| Variable | Source / Value |
| :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Console > Project Settings |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Your Gemini API Key |
| `FIREBASE_ADMIN_SDK_CERT` | **Crucial:** Your Service Account JSON string |

> **Pro Tip:** To get the `FIREBASE_ADMIN_SDK_CERT` value:
> 1. Go to Firebase Console > Project Settings > Service Accounts.
> 2. Click **Generate new private key**.
> 3. Open the downloaded JSON and **copy the entire content**.
> 4. Paste it as a single string in Vercel.

## 2. Deploying Firestore Rules
Your local `firestore.rules` file must be uploaded to Firebase for the "Save" feature to work in production.

**Option A (Firebase CLI):**
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

**Option B (Manual):**
1. Open `firestore.rules` in this editor.
2. Copy the content.
3. Go to [Firebase Console > Firestore > Rules](https://console.firebase.google.com/).
4. Paste and click **Publish**.

## 3. Vercel Build Configuration
The project is already optimized for Vercel. Simply:
1. Push your code to GitHub/GitLab.
2. Import the repository into Vercel.
3. Vercel will auto-detect Next.js and run `npm run build`.

## 4. Troubleshooting "Save Failed" (Production)
If you still see "Save Failed" after deploying:
1. **Check Authorized Domains:** In Firebase Console > Authentication > Settings, ensure your Vercel deployment URL (e.g., `*.vercel.app`) is added to the "Authorized domains" list.
2. **Logs:** Check Vercel Function logs for any "FIREBASE_ADMIN_SDK_CERT not found" errors.

Your project is now ready for world-class deployment! 🚀
