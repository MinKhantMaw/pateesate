import { createContext, useContext } from 'react'
import type { Store } from './AppContext'

export const AppContext = createContext<Store | null>(null)
export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('AppProvider missing')
  return context
}