import { ArrowUpRight, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Category, Counts } from '../types'
import { number } from '../utils/date'

export function CategoryCard({ category, counts, index, onEdit, onDelete }: { category: Category; counts: Counts; index: number; onEdit: () => void; onDelete: () => void }) {
  const total = category.items.reduce((sum, item) => sum + (counts[item.id]?.total ?? 0), 0)
  return <article className="category-card">
    <div className="flex items-start justify-between gap-3"><span className={`category-mark mark-${index % 4}`}>{number(index + 1)}</span><div className="flex gap-1"><button className="icon-button" onClick={onEdit} aria-label={`${category.name} ပြင်မည်`} title="ပြင်မည်"><Pencil size={17} /></button><button className="icon-button" onClick={onDelete} aria-label={`${category.name} ဖျက်မည်`} title="ဖျက်မည်"><Trash2 size={17} /></button></div></div>
    <Link to={`/category/${category.id}`} className="category-link"><h2 className="category-title">{category.name}</h2><span className="category-arrow"><ArrowUpRight size={20} /></span></Link>
    <div className="category-meta"><span>{number(category.items.length)} မျိုး</span><span>စုစုပေါင်း <strong>{number(total)}</strong> ကြိမ်</span></div>
  </article>
}