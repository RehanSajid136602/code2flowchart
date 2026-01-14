# Environment Variable Loading Issues - Troubleshooting

## Current Problem
Next.js shows "Environments: .env.local" but loads NO NEXT_PUBLIC variables (Array(0)).

## Debug Steps

### 1. Verify .env.local Location
Your `.env.local` file MUST be in the exact project root:
```
C:\Users\Admin\Documents\code-flowchart\code2flowchart\.env.local
```

NOT in:
```
C:\Users\Admin\Documents\code-flowchart\.env.local
```

### 2. Check File Content
Open your `.env.local` file and verify it contains:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBsI6i5erDkWUkDXkWCvNVD2ou8DmgQvss
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=logicflow-8c020.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=logicflow-8c020
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=logicflow-8c020.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1015694834540
NEXT_PUBLIC_FIREBASE_APP_ID=1:1015694834540:web:07b68639c4cdd32ab81149
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-4NEXH968XE
```

### 3. Check File Encoding
Make sure `.env.local` is:
- Plain text file (UTF-8)
- No special characters
- No hidden formatting (like RTF)

### 4. Restart Completely
After any changes:
1. Stop dev server (Ctrl+C)
2. Delete .next folder (if exists): `rmdir /s /q .next`
3. Start dev server: `npm run dev`

### 5. Check Console Logs
After restart, look for:
```
All environment variables: { ... }
NEXT_PUBLIC variables: ['NEXT_PUBLIC_FIREBASE_API_KEY', ...]
Firebase env check: {hasApiKey: true, hasAuthDomain: true, ...}
```

## Common Issues

### Issue: File in wrong directory
**Solution**: Move `.env.local` to project root (`C:\Users\Admin\Documents\code-flowchart\code2flowchart\`)

### Issue: File has hidden formatting
**Solution**: Open in Notepad, Save As → Encoding: UTF-8, Plain text

### Issue: Extra spaces or quotes
**Solution**: Ensure format is exactly `KEY=value` (no quotes around values)

### Issue: Case sensitivity
**Solution**: Ensure uppercase `NEXT_PUBLIC_FIREBASE_...` (Next.js is case-sensitive)

## Temporary Workaround
If environment variables still don't load, temporarily use hardcoded config:

In `src/lib/firebase.ts`, replace `getEnvConfig()` return with:
```typescript
return {
  apiKey: "AIzaSyBsI6i5erDkWUkDXkWCvNVD2ou8DmgQvss",
  authDomain: "logicflow-8c020.firebaseapp.com",
  projectId: "logicflow-8c020",
  storageBucket: "logicflow-8c020.firebasestorage.app",
  messagingSenderId: "1015694834540",
  appId: "1:1015694834540:web:07b68639c4cdd32ab81149",
  measurementId: "G-4NEXH968XE",
};
```

## Next Debug Step
After restart, check console for new debug output showing:
- All environment variables object
- Specific NEXT_PUBLIC variable names
- Firebase config values