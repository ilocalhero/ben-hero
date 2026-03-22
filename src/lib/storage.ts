const VERSION = '1.0.0'

let _userPrefix = ''

export function setUserPrefix(prefix: string): void {
  _userPrefix = prefix
}

function storageKey(key: string): string {
  return _userPrefix ? `benhero_${_userPrefix}_${key}` : `benhero_${key}`
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(storageKey(key), JSON.stringify({ v: VERSION, data }))
  } catch (e) {
    console.warn('Storage save failed:', e)
  }
}

export function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(storageKey(key))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed.data as T
  } catch {
    return null
  }
}

export function clearStorage(): void {
  Object.keys(localStorage)
    .filter(k => k.startsWith('benhero_'))
    .forEach(k => localStorage.removeItem(k))
}

/** Clear only the current user's prefixed storage keys (player, progress, resetVersion). */
export function clearUserStorage(): void {
  if (!_userPrefix) return
  const prefix = `benhero_${_userPrefix}_`
  Object.keys(localStorage)
    .filter(k => k.startsWith(prefix))
    .forEach(k => localStorage.removeItem(k))
}
