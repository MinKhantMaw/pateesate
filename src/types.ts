export interface ChantItem { id: string; name: string; description?: string }
export interface Category { id: string; name: string; items: ChantItem[] }
export interface Count { total: number; rounds: number }
export type Counts = Record<string, Count>
export type History = Record<string, Record<string, number>>
export interface Settings { theme: 'light' | 'dark'; vibration: boolean; sound: boolean; defaultTarget: number }
export interface CounterSession { count: number; target: number; undo: { date: string; completed: boolean; target: number }[] }
export type Sessions = Record<string, CounterSession>
export interface AppData { categories: Category[]; counts: Counts; history: History; settings: Settings; session: Sessions }