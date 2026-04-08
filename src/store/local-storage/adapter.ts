import type { StorageAdapter } from "../storage"

export const localStorageAdapter: StorageAdapter = {
  get: (key) => localStorage.getItem(key),
  set: (key, value) => localStorage.setItem(key, value),
  remove: (key) => localStorage.removeItem(key),
  keys: () => {
    const result: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) result.push(key)
    }
    return result
  },
}
