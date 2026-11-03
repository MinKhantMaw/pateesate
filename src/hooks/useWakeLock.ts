import { useEffect, useState } from 'react'

export function useWakeLock() {
  const [enabled, setEnabled] = useState(false)
  const [error, setError] = useState(false)
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator
  useEffect(() => {
    if (!enabled || !supported) return
    let active = true
    let sentinel: WakeLockSentinel | undefined
    const acquire = async () => {
      if (document.visibilityState !== 'visible') return
      try {
        const lock = await navigator.wakeLock.request('screen')
        if (!active) { void lock.release(); return }
        sentinel = lock
        setError(false)
      } catch { if (active) setError(true) }
    }
    void acquire()
    document.addEventListener('visibilitychange', acquire)
    return () => { active = false; document.removeEventListener('visibilitychange', acquire); if (sentinel) void sentinel.release() }
  }, [enabled, supported])
  return { enabled, setEnabled, supported, error }
}