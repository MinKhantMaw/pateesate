import { defaultCategories } from '../data/defaultCategories'
import { defaultCombos } from '../data/defaultCombos'
import type { AppData, Category, Combo, SessionData, Sessions } from '../types'

const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
const integer = (value: unknown) => Number.isSafeInteger(value) && (value as number) >= 0
const target = (value: unknown) => integer(value) && (value as number) > 0 && (value as number) <= 1000000
export const sequenceKey = (categoryId: string, group?: string) => `${categoryId}:${group ?? ''}`
const singleSession = (session: unknown) => object(session) && integer(session.count) && target(session.target) && (session.count as number) < (session.target as number) && Array.isArray(session.undo) && session.undo.every(entry => object(entry) && typeof entry.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry.date) && typeof entry.completed === 'boolean' && target(entry.target))
const sequenceSession = (session: unknown) => object(session) && typeof session.categoryId === 'string' && (session.group === undefined || typeof session.group === 'string') && (session.sourceType === undefined || ['category', 'group', 'combo'].includes(session.sourceType as string)) && (session.sourceId === undefined || typeof session.sourceId === 'string') && (session.sourceType !== 'combo' || (typeof session.sourceId === 'string' && !!session.sourceId)) && typeof session.entryItemId === 'string' && integer(session.currentIndex) && (session.repeatIndex === undefined || integer(session.repeatIndex)) && integer(session.sessionTaps) && integer(session.passes) && target(session.target) && (session.passes as number) < (session.target as number) && (session.progress === undefined || integer(session.progress)) && Array.isArray(session.undo) && session.undo.every(entry => object(entry) && typeof entry.itemId === 'string' && typeof entry.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry.date) && integer(entry.previousIndex) && typeof entry.completed === 'boolean' && integer(entry.sessionTapsBefore) && integer(entry.passesBefore) && (entry.progressBefore === undefined || integer(entry.progressBefore)) && (entry.repeatBefore === undefined || integer(entry.repeatBefore)))

export function normalizeCategories(categories: Category[]): Category[] {
  return categories.map(category => ({ ...category, items: category.id === 'combo' ? category.items.map(item => ({ ...item, group: undefined })) : category.items, mode: category.mode ?? defaultCategories.find(entry => entry.id === category.id)?.mode ?? 'single' }))
}

export function availableCategories(categories: Category[]): Category[] {
  const catalog = defaultCategories.find(category => category.id === 'combo')!
  const existing = categories.find(category => category.id === catalog.id)
  const ids = new Set(categories.flatMap(category => category.items.map(item => item.id)))
  const missing = catalog.items.filter(item => !ids.has(item.id))
  return existing ? categories.map(category => category.id === catalog.id ? { ...category, items: [...category.items, ...missing] } : category) : [...categories, { ...catalog, items: missing }]
}

export function upgradeLegacyCombos(combos: Combo[]): Combo[] {
  const defaultCombo = defaultCombos[0]
  const oldSteps = defaultCombo.steps.slice(0, 12)
  const preserved = combos.filter(combo => !(combo.id === 'saranagon-guna9' && combo.name === 'သရဏဂုံ + ဂုဏ်တော် ၉ ပါး' && JSON.stringify(combo.steps) === JSON.stringify(oldSteps)))
  return preserved.some(combo => combo.id === defaultCombo.id) ? preserved : [...preserved, defaultCombo]
}

export function normalizeSession(value: unknown): SessionData {
  if (object(value) && object(value.singles) && object(value.sequences)) return value as unknown as SessionData
  return { singles: value as Sessions, sequences: {} }
}

export function normalizeData(data: AppData): AppData {
  return { ...data, categories: normalizeCategories(data.categories), combos: data.combos ?? defaultCombos, session: normalizeSession(data.session), groupRounds: data.groupRounds ?? {} }
}

export function validData(value: unknown): value is AppData {
  if (!object(value) || !Array.isArray(value.categories) || !object(value.counts) || !object(value.history) || !object(value.settings) || !object(value.session)) return false
  const categoryIds = new Set<string>()
  const itemIds = new Set<string>()
  for (const category of value.categories) {
    if (!object(category) || typeof category.id !== 'string' || !category.id || categoryIds.has(category.id) || typeof category.name !== 'string' || !category.name.trim() || !Array.isArray(category.items) || (category.mode !== undefined && category.mode !== 'single' && category.mode !== 'sequence')) return false
    categoryIds.add(category.id)
    for (const item of category.items) {
      if (!object(item) || typeof item.id !== 'string' || !item.id || itemIds.has(item.id) || typeof item.name !== 'string' || !item.name.trim() || (item.description !== undefined && typeof item.description !== 'string') || (item.group !== undefined && typeof item.group !== 'string')) return false
      itemIds.add(item.id)
    }
  }
  if (value.combos !== undefined) {
    if (!Array.isArray(value.combos)) return false
    const comboIds = new Set<string>()
    for (const combo of value.combos) {
      if (!object(combo) || typeof combo.id !== 'string' || !combo.id || comboIds.has(combo.id) || typeof combo.name !== 'string' || !combo.name.trim() || !Array.isArray(combo.steps) || !combo.steps.length || !combo.steps.every(step => object(step) && typeof step.itemId === 'string' && !!step.itemId && target(step.repeat))) return false
      comboIds.add(combo.id)
    }
  }
  if (!Object.values(value.counts).every(count => object(count) && integer(count.total) && integer(count.rounds))) return false
  if (!Object.entries(value.history).every(([day, entries]) => /^\d{4}-\d{2}-\d{2}$/.test(day) && object(entries) && Object.values(entries).every(integer))) return false
  const settings = value.settings
  if (!['light', 'dark'].includes(settings.theme as string) || typeof settings.vibration !== 'boolean' || typeof settings.sound !== 'boolean' || !target(settings.defaultTarget)) return false
  if (value.groupRounds !== undefined && (!object(value.groupRounds) || !Object.values(value.groupRounds).every(integer))) return false
  const session = value.session
  if ('singles' in session || 'sequences' in session) return object(session.singles) && object(session.sequences) && Object.values(session.singles).every(singleSession) && Object.values(session.sequences).every(sequenceSession) && (session.modes === undefined || (object(session.modes) && Object.values(session.modes).every(mode => mode === 'single' || mode === 'sequence'))) && (session.categoryId === undefined || typeof session.categoryId === 'string') && (session.group === undefined || typeof session.group === 'string') && (session.currentIndex === undefined || integer(session.currentIndex)) && (session.sessionTaps === undefined || integer(session.sessionTaps))
  return Object.values(session).every(singleSession)
}

export function downloadData(data: AppData) {
  const blob = new Blob([JSON.stringify({ version: 4, ...data }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `pawtiza-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}