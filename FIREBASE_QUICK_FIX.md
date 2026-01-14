# Firebase Environment Variables Setup Instructions

## Quick Steps to Fix Firebase Configuration

1. **Stop the development server** (Ctrl+C)
2. **Add these lines to your `.env.local` file**:

```bash
# Firebase Client Configuration (LogicFlow project)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBsI6i5erDkWUkDXkWCvNVD2ou8DmgQvss
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=logicflow-8c020.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=logicflow-8c020
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=logicflow-8c020.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1015694834540
NEXT_PUBLIC_FIREBASE_APP_ID=1:1015694834540:web:07b68639c4cdd32ab81149
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-4NEXH968XE
```

3. **Restart the development server** with:
   ```bash
   npm run dev
   ```

4. **Verify it worked** - The Firebase configuration error should disappear and you can test Google sign-in.

## Troubleshooting

- **Still getting Firebase error?** Check that your `.env.local` file is in the project root (same directory as package.json)
- **Environment variables not loading?** Make sure the file is named exactly `.env.local` (not `.env.local.txt` or similar)
- **Hydration errors persisting?** These are from Dark Reader browser extension and can be ignored for development

## What Was Fixed

1. ✅ Firebase configuration added to environment examples
2. ✅ Enhanced error messages show exactly which variables are missing  
3. ✅ Added debug logging to help troubleshoot environment variable loading
4. ✅ Added `suppressHydrationWarning` to SVG elements to prevent Dark Reader conflicts