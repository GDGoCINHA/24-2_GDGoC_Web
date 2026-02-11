'use client'

export type StoredAuthUser = object | null

export const USER_STORAGE_KEY = 'gdgoc.user'
export const ACCESS_TOKEN_KEY = 'gdgoc.at'
export const REFRESH_TOKEN_KEY = 'gdgoc.rt'

const getLocalStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const readStoredString = (key: string): string | null => {
  const storage = getLocalStorage()
  if (!storage) return null
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

export const writeStoredString = (key: string, value: string | null): void => {
  const storage = getLocalStorage()
  if (!storage) return
  try {
    if (value) {
      storage.setItem(key, value)
    } else {
      storage.removeItem(key)
    }
  } catch {
    // ignore write failure
  }
}

export const readStoredUser = <T extends object = Record<string, unknown>>(): T | null => {
  const raw = readStoredString(USER_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export const writeStoredUser = <T extends object>(user: T | null): void => {
  const storage = getLocalStorage()
  if (!storage) return
  try {
    if (user) {
      storage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    } else {
      storage.removeItem(USER_STORAGE_KEY)
    }
  } catch {
    // ignore write failure
  }
}

export const clearStoredAuth = (): void => {
  writeStoredUser(null)
  writeStoredString(ACCESS_TOKEN_KEY, null)
  writeStoredString(REFRESH_TOKEN_KEY, null)
}

type StorageListener = (payload: { key: string | null; newValue: string | null }) => void

export const subscribeAuthStorage = (listener: StorageListener): (() => void) => {
  if (typeof window === 'undefined') return () => {}

  const handler = (event: StorageEvent): void => {
    if (event.storageArea !== window.localStorage) return
    if (
      event.key === USER_STORAGE_KEY ||
      event.key === ACCESS_TOKEN_KEY ||
      event.key === REFRESH_TOKEN_KEY ||
      event.key === null
    ) {
      listener({ key: event.key, newValue: event.newValue })
    }
  }

  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}
