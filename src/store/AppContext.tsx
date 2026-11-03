import { useEffect, type ReactNode } from 'react'
import { AppContext } from './AppContextValue'
import { defaultCategories, defaultSettings } from '../data/defaultCategories'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { dateKey } from '../utils/date'
import { validData } from '../utils/data'
import type { AppData, Category, Counts, History, Sessions, Settings } from '../types'

const empty: AppData = { categories: defaultCategories, counts: {}, history: {}, settings: defaultSettings, session: {} }
const validatePart = (key: keyof AppData) => (value: unknown) => validData({ ...empty, [key]: value })

function useAppStore() {
  const [categories, setCategories, categoriesError] = useLocalStorage<Category[]>('pawtiza:categories', defaultCategories, validatePart('categories'))
  const [counts, setCounts, countsError] = useLocalStorage<Counts>('pawtiza:counts', {}, validatePart('counts'))
  const [history, setHistory, historyError] = useLocalStorage<History>('pawtiza:history', {}, validatePart('history'))
  const [settings, setSettings, settingsError] = useLocalStorage<Settings>('pawtiza:settings', defaultSettings, validatePart('settings'))
  const [session, setSession, sessionError] = useLocalStorage<Sessions>('pawtiza:session', {}, validatePart('session'))
  const [, , versionError] = useLocalStorage<number>('pawtiza:version', 1, value => value === 1)

  useEffect(() => { document.documentElement.classList.toggle('dark', settings.theme === 'dark') }, [settings.theme])

  function increment(id: string) {
    const current = session[id] ?? { count: 0, target: settings.defaultTarget, undo: [] }
    const date = dateKey()
    const completed = current.count + 1 >= current.target
    setSession(previous => ({ ...previous, [id]: { ...current, count: completed ? 0 : current.count + 1, undo: [...current.undo, { date, completed, target: current.target }] } }))
    setCounts(previous => ({ ...previous, [id]: { total: (previous[id]?.total ?? 0) + 1, rounds: (previous[id]?.rounds ?? 0) + (completed ? 1 : 0) } }))
    setHistory(previous => ({ ...previous, [date]: { ...previous[date], [id]: (previous[date]?.[id] ?? 0) + 1 } }))
    return completed
  }

  function undo(id: string) {
    const current = session[id]
    const last = current?.undo.at(-1)
    if (!current || !last) return
    setSession(previous => ({ ...previous, [id]: { ...current, target: last.target, count: last.completed ? last.target - 1 : Math.max(0, current.count - 1), undo: current.undo.slice(0, -1) } }))
    setCounts(previous => ({ ...previous, [id]: { total: Math.max(0, (previous[id]?.total ?? 0) - 1), rounds: Math.max(0, (previous[id]?.rounds ?? 0) - (last.completed ? 1 : 0)) } }))
    setHistory(previous => ({ ...previous, [last.date]: { ...previous[last.date], [id]: Math.max(0, (previous[last.date]?.[id] ?? 0) - 1) } }))
  }

  function resetSession(id: string, target?: number) {
    setSession(previous => ({ ...previous, [id]: { count: 0, target: target ?? previous[id]?.target ?? settings.defaultTarget, undo: [] } }))
  }
  function replaceData(data: AppData) {
    setCategories(data.categories); setCounts(data.counts); setHistory(data.history); setSettings(data.settings); setSession(data.session)
  }
  return { categories, setCategories, counts, history, settings, setSettings, session, increment, undo, resetSession, replaceData, storageError: categoriesError || countsError || historyError || settingsError || sessionError || versionError }
}

export type Store = ReturnType<typeof useAppStore>
export function AppProvider({ children }: { children: ReactNode }) {
  const store = useAppStore()
  return <AppContext.Provider value={store}>{children}</AppContext.Provider>
}
