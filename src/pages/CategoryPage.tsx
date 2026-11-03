import { useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ItemList } from '../components/ItemList'
import { useApp } from '../store/AppContextValue'
import { number } from '../utils/date'
import type { ChantItem } from '../types'

export function CategoryPage() {
  const { categoryId } = useParams()
  const { categories, setCategories, counts } = useApp()
  const category = categories.find(entry => entry.id === categoryId)
  const [editing, setEditing] = useState<ChantItem | 'new' | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [deleting, setDeleting] = useState<ChantItem | null>(null)
  if (!category) return <main className="page-wrap"><p>အမျိုးအစားကို ရှာမတွေ့ပါ။</p><Link className="back-link" to="/">မူလစာမျက်နှာသို့</Link></main>
  function edit(item: ChantItem | 'new') { setName(item === 'new' ? '' : item.name); setDescription(item === 'new' ? '' : item.description ?? ''); setEditing(item) }
  function save() {
    const trimmed = name.trim()
    if (!trimmed || !editing) return
    const item = { id: editing === 'new' ? crypto.randomUUID() : editing.id, name: trimmed, description: description.trim() || undefined }
    setCategories(previous => previous.map(entry => entry.id === categoryId ? { ...entry, items: editing === 'new' ? [...entry.items, item] : entry.items.map(existing => existing.id === item.id ? item : existing) } : entry))
    setEditing(null)
  }
  return <main className="page-wrap narrow-page">
    <Link className="back-link" to="/"><ArrowLeft size={18} /> အမျိုးအစားများ</Link>
    <div className="page-heading compact-heading"><div><div className="eyebrow"><span className="eyebrow-dot" /> စိပ်ရန်ရွေးချယ်ပါ</div><h1>{category.name}</h1><p>{number(category.items.length)} မျိုး ရှိပါသည်</p></div><button className="button-outline" onClick={() => edit('new')}><Plus size={19} /> စာသားထည့်မည်</button></div>
    <ItemList items={category.items} counts={counts} categoryId={category.id} onEdit={edit} onDelete={setDeleting} />
    {editing && <ConfirmDialog title={editing === 'new' ? 'စာသားအသစ်' : 'စာသားပြင်မည်'} onClose={() => setEditing(null)} onConfirm={save} confirmLabel="သိမ်းမည်"><label className="field-label" htmlFor="item-name">အမည်</label><input id="item-name" className="text-input" autoFocus maxLength={150} value={name} onChange={event => setName(event.target.value)} /><label className="field-label mt-4" htmlFor="item-description">အဓိပ္ပါယ် ရှင်းလင်းချက် (မထည့်လည်းရသည်)</label><textarea id="item-description" className="text-input" rows={3} maxLength={500} value={description} onChange={event => setDescription(event.target.value)} /></ConfirmDialog>}
    {deleting && <ConfirmDialog title="စာသား ဖျက်မည်လား" onClose={() => setDeleting(null)} onConfirm={() => { setCategories(previous => previous.map(entry => entry.id === categoryId ? { ...entry, items: entry.items.filter(item => item.id !== deleting.id) } : entry)); setDeleting(null) }} confirmLabel="ဖျက်မည်" danger><p>“{deleting.name}” ကို ဖျက်ပါမည်။ စိပ်ခဲ့သော အရေအတွက်နှင့် မှတ်တမ်းများကို ဆက်လက်ထိန်းသိမ်းထားပါမည်။</p></ConfirmDialog>}
  </main>
}