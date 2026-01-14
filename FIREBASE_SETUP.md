# Firebase Setup Guide

This project uses Firebase for authentication and data storage. You need to configure both client-side and server-side Firebase settings.

## Quick Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable Authentication (Email/Password and Google providers)
4. Enable Firestore Database

### 2. Get Client Configuration
1. In Firebase Console, go to Project Settings > General
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to register a web app
4. Copy the configuration values

### 3. Configure Environment Variables
Create `.env.local` file in your project root and add:

```bash
# Client-side Firebase Configuration (LogicFlow project)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBsI6i5erDkWUkDXkWCvNVD2ou8DmgQvss
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=logicflow-8c020.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=logicflow-8c020
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=logicflow-8c020.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1015694834540
NEXT_PUBLIC_FIREBASE_APP_ID=1:1015694834540:web:07b68639c4cdd32ab81149
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-4NEXH968XE

# Server-side Firebase Admin (optional, for API routes)
FIREBASE_ADMIN_SDK_CERT='{"type":"service_account","project_id":"your-project-id",...}'
```

### 4. Enable Authentication Providers
1. In Firebase Console, go to Authentication > Sign-in method
2. Enable Email/Password provider
3. Enable Google provider (add your authorized domains)

### 5. Setup Firestore Rules
In Firebase Console > Firestore Database > Rules, add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Projects belong to their owners
    match /projects/{projectId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Testing the Setup

After configuration, restart your development server and try signing up/in with Google or email to verify the setup works.

## Troubleshooting

- **"Firebase config is incomplete"**: Check that all NEXT_PUBLIC_FIREBASE_* variables are set in `.env.local`
- **Google sign-in not working**: Ensure your domain is added to authorized domains in Firebase Authentication settings
- **Firestore permissions denied**: Check your Firestore security rules

For detailed server-side setup, see `firebase-admin-setup.md`.