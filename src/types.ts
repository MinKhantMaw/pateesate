export interface ChantItem { id: string; name: string; description?: string; group?: string; fullText?: string }
export type CounterMode = 'single' | 'sequence'
export interface Category { id: string; name: string; items: ChantItem[]; mode: CounterMode }
export interface Count { total: number; rounds: number }
export type Counts = Record<string, Count>
export type History = Record<string, Record<string, number>>
export interface Settings { theme: 'light' | 'dark' | 'night'; vibration: boolean; sound: boolean; wakeLock: boolean; burmeseNumerals: boolean; pinnedItems: string[]; onboardingComplete: boolean; iosHintDismissed: boolean; lastBackupAt?: string; lastOpenedAt?: string; backupReminderDismissedAt?: string; lastCounterPath?: string; defaultTarget: number; beadsPerRound: number; goalRounds: number; reminders: boolean; chantTextSize: number; beadStyle: 'gold' | 'jade' | 'wood'; glowEffect: boolean; lastReminderSlot?: string }
export interface CounterSession { count: number; target: number; roundsDone?: number; goalRounds?: number; goalReached?: boolean; undo: { date: string; completed: boolean; target: number; goalId?: string }[] }
export type Sessions = Record<string, CounterSession>
export type GroupRounds = Record<string, number>
export interface ComboStep { itemId: string; repeat: number }
export interface Combo { id: string; name: string; steps: ComboStep[] }
export interface SequenceUndo { itemId: string; date: string; previousIndex: number; completed: boolean; sessionTapsBefore: number; passesBefore: number; progressBefore?: number; repeatBefore?: number; goalId?: string }
export type SequenceSource = 'category' | 'group' | 'combo'
export interface SequenceSession { categoryId: string; group?: string; sourceType?: SequenceSource; sourceId?: string; entryItemId: string; currentIndex: number; repeatIndex?: number; sessionTaps: number; passes: number; target: number; beadsPerRound?: number; goalRounds?: number; goalReached?: boolean; progress?: number; undo: SequenceUndo[] }
export interface SessionData { singles: Sessions; sequences: Record<string, SequenceSession>; modes?: Record<string, CounterMode>; categoryId?: string; group?: string; currentIndex?: number; sessionTaps?: number; sourceType?: SequenceSource | 'single'; sourceId?: string; stepIndex?: number; repeatIndex?: number; passesDone?: number; tapsInRound?: number; roundsDone?: number; goalReached?: boolean }
export interface GoalCompletion { id: string; goalRounds: number; beadsPerRound: number }
export type GoalHistory = Record<string, GoalCompletion[]>
export interface AppData { categories: Category[]; combos: Combo[]; counts: Counts; history: History; settings: Settings; session: SessionData; groupRounds: GroupRounds; goalHistory?: GoalHistory }