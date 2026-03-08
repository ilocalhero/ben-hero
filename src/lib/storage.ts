const VERSION = '1.0.0'

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`benhero_${key}`, JSON.stringify({ v: VERSION, data }))
  } catch (e) {
    console.warn('Storage save failed:', e)
  }
}

export function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`benhero_${key}`)
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
