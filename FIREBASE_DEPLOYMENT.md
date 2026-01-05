# Firebase Deployment Guide

## Deploy Firestore Rules

### Option 1: Firebase CLI
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### Option 2: Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Firestore Database > Rules
4. Copy content from `firestore.rules`
5. Click "Publish"

## Deploy Firestore Indexes

### Option 1: Firebase CLI
```bash
# Deploy indexes
firebase deploy --only firestore:indexes
```

### Option 2: Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Firestore Database > Indexes
4. Copy content from `firestore.indexes.json`
5. Click "Start Manual Configuration" and paste the JSON
6. Click "Save"

## Verify Deployment

After deployment, test the following:

### Security Rules Test
1. Try to read/write projects as an authenticated user
2. Verify unauthorized users cannot access projects
3. Verify hard delete fails via client SDK
4. Verify history subcollection works correctly

### Indexes Test
1. Run a query with multiple orderBy conditions
2. Verify composite indexes are being used
3. Check Firestore logs for any missing index errors

## Troubleshooting

### Missing Indexes
If you see errors about missing indexes, run:
```bash
firebase firestore:indexes
```

### Permission Denied
Ensure your Firebase security rules are deployed correctly:
```bash
firebase firestore:rules
```

### Service Account Issues
If Admin SDK operations fail, verify:
1. `FIREBASE_ADMIN_SDK_CERT` is set correctly in `.env.local`
2. The service account has proper permissions (Cloud Datastore Owner or Firebase Admin)
3. The JSON is valid and properly escaped
