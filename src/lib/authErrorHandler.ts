export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code || ''
  const message = (error as { message?: string })?.message || ''

  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'Invalid email or password. Please check your credentials and try again.'
  }

  if (code === 'auth/email-already-in-use') {
    return 'An account with this email already exists. Please sign in instead.'
  }

  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use a stronger password with at least 6 characters.'
  }

  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.'
  }

  if (code === 'auth/missing-password') {
    return 'Please enter your password.'
  }

  if (code === 'auth/popup-closed-by-user') {
    return 'Sign-in was cancelled. Please try again.'
  }

  if (code === 'auth/popup-blocked') {
    return 'Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.'
  }

  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Please wait a few minutes before trying again.'
  }

  if (code === 'auth/network-request-failed') {
    return 'Network error. Please check your internet connection and try again.'
  }

  if (code === 'auth/user-disabled') {
    return 'This account has been disabled. Please contact support for help.'
  }

  if (code === 'auth/operation-not-allowed') {
    return 'This sign-in method is not available. Please contact support for help.'
  }

  if (code === 'auth/invalid-verification-code') {
    return 'Invalid verification code. Please check and try again.'
  }

  if (code === 'auth/expired-action-code') {
    return 'This link has expired. Please request a new one.'
  }

  if (message.includes('Firebase Auth is not configured')) {
    return 'Authentication service is not available. Please try again later.'
  }

  if (message.includes('CONFIGURATION_NOT_FOUND')) {
    return 'Authentication service is temporarily unavailable. Please try again later.'
  }

  return 'Something went wrong. Please try again.'
}
