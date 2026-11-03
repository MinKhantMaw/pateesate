import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T, isValid?: (value: unknown) => boolean) {
  const [initial] = useState(() => {
    if (typeof window === 'undefined') return { value: initialValue, error: false, missing: false }
    try {
      const saved = window.localStorage.getItem(key)
      if (saved === null) return { value: initialValue, error: false, missing: true }
      const parsed: unknown = JSON.parse(saved)
      if (isValid && !isValid(parsed)) throw new Error('Invalid stored data')
      return { value: parsed as T, error: false, missing: false }
    } catch {
      return { value: initialValue, error: true, missing: false }
    }
  })
  const [error, setError] = useState(initial.error)
  const [value, setState] = useState(initial.value)
  const dirty = useRef(initial.missing)
  const latest = useRef(value)
  useEffect(() => { latest.current = value }, [value])
  const setValue: Dispatch<SetStateAction<T>> = useCallback(next => {
    dirty.current = true
    setState(next)
  }, [])
  const flush = useCallback(() => {
    if (!dirty.current) return
    try {
      window.localStorage.setItem(key, JSON.stringify(latest.current))
      dirty.current = false
    } catch {
      setError(true)
    }
  }, [key])
  useEffect(() => {
    const timer = window.setTimeout(flush, 350)
    return () => window.clearTimeout(timer)
  }, [value, flush])
  useEffect(() => {
    const onVisibility = () => { if (document.visibilityState === 'hidden') flush() }
    window.addEventListener('beforeunload', flush)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('beforeunload', flush)
      document.removeEventListener('visibilitychange', onVisibility)
      flush()
    }
  }, [flush])
  return [value, setValue, error] as const
}