import type { AppData } from '../types'

const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
const integer = (value: unknown) => Number.isSafeInteger(value) && (value as number) >= 0
const target = (value: unknown) => integer(value) && (value as number) > 0 && (value as number) <= 1000000

export function validData(value: unknown): value is AppData {
  if (!object(value) || !Array.isArray(value.categories) || !object(value.counts) || !object(value.history) || !object(value.settings) || !object(value.session)) return false
  const categoryIds = new Set<string>()
  const itemIds = new Set<string>()
  for (const category of value.categories) {
    if (!object(category) || typeof category.id !== 'string' || !category.id || categoryIds.has(category.id) || typeof category.name !== 'string' || !category.name.trim() || !Array.isArray(category.items)) return false
    categoryIds.add(category.id)
    for (const item of category.items) {
      if (!object(item) || typeof item.id !== 'string' || !item.id || itemIds.has(item.id) || typeof item.name !== 'string' || !item.name.trim() || (item.description !== undefined && typeof item.description !== 'string')) return false
      itemIds.add(item.id)
    }
  }
  if (!Object.values(value.counts).every(count => object(count) && integer(count.total) && integer(count.rounds))) return false
  if (!Object.entries(value.history).every(([day, entries]) => /^\d{4}-\d{2}-\d{2}$/.test(day) && object(entries) && Object.values(entries).every(integer))) return false
  const settings = value.settings
  if (!['light', 'dark'].includes(settings.theme as string) || typeof settings.vibration !== 'boolean' || typeof settings.sound !== 'boolean' || !target(settings.defaultTarget)) return false
  return Object.values(value.session).every(session => object(session) && integer(session.count) && target(session.target) && (session.count as number) < (session.target as number) && Array.isArray(session.undo) && session.undo.every(entry => object(entry) && typeof entry.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry.date) && typeof entry.completed === 'boolean' && target(entry.target)))
}

export function downloadData(data: AppData) {
  const blob = new Blob([JSON.stringify({ version: 1, ...data }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `pawtiza-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}