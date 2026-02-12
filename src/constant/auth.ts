export const PENDING_SIGNUP_STORAGE_KEY = 'gdgoc.pendingSignup'

export interface PendingSignupPayload {
  oauthSubject: string
  email: string
  name: string
  picture?: string
  next?: string
}
