# Firebase Configuration Guide
# Add these to your .env.local file for complete Firebase setup

# === Client-side Configuration (for browser authentication) ===
# LogicFlow project configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBsI6i5erDkWUkDXkWCvNVD2ou8DmgQvss
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=logicflow-8c020.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=logicflow-8c020
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=logicflow-8c020.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1015694834540
NEXT_PUBLIC_FIREBASE_APP_ID=1:1015694834540:web:07b68639c4cdd32ab81149
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-4NEXH968XE

# === Server-side Configuration (for Admin SDK) ===

# Get these from Firebase Console > Project Settings > Service Accounts
# Generate a new private key and paste the JSON content below
FIREBASE_ADMIN_SDK_CERT='{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com"
}'

# Optional: Override database URL (auto-derived from project_id if not set)
# FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com

# Optional: Override project ID (auto-derived from cert if not set)
# FIREBASE_PROJECT_ID=your-project-id
