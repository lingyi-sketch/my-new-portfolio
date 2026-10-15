import { useSyncExternalStore } from 'react'

// Tiny shared store so any upload form can report compression progress to one banner.
let state = { phase: 'idle', progress: 0, message: '' }
const listeners = new Set()

export function setUploadStatus(next) {
  state = { ...state, ...next }
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useUploadStatus() {
  return useSyncExternalStore(subscribe, () => state)
}
