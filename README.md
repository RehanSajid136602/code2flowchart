# LogicFlow AI

Bidirectional **code ↔ flowchart** tool built with **Next.js App Router**, **React Flow (@xyflow/react)**, and AI backends (Gemini / Groq).

## Features

- Code editor (Monaco)
- Code → Flowchart (AI)
- Flowchart → Code (AI)
- Flowchart bug spotting + complexity estimate (AI)
- Step-by-step tracer
- Firebase Authentication:
  - Google sign-in
  - Email/password sign-up + **email verification**
  - Password reset

## Setup

### 1) Install

```bash
npm install
```

### 2) Environment variables

Copy the example file and fill it:

```bash
cp .env.local.example .env.local
```

Firebase keys are used **client-side** (NEXT_PUBLIC_*) and are safe to expose.

### 3) Enable Firebase Auth providers

In Firebase Console → Authentication → Sign-in method:

- Enable **Google**
- Enable **Email/Password**

Also add your dev origin to Authorized domains:

- `localhost`

### 4) Run

```bash
npm run dev
```

Open http://localhost:3000

## Notes

- Email verification: this app **allows access but shows a warning banner** when the user is not verified.
- AI providers are configured in `src/lib/gemini.ts`.
