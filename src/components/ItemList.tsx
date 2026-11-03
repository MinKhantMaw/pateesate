import { ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ChantItem, Counts } from '../types'
import { number } from '../utils/date'

export function ItemList({ items, counts, categoryId, onEdit, onDelete }: { items: ChantItem[]; counts: Counts; categoryId: string; onEdit: (item: ChantItem) => void; onDelete: (item: ChantItem) => void }) {
  if (!items.length) return <div className="empty-state">ဤအမျိုးအစားတွင် စိပ်ရန် စာသား မရှိသေးပါ။</div>
  return <div className="item-list">{items.map((item, index) => <div className="item-row" key={item.id}>
    <Link to={`/category/${categoryId}/item/${item.id}`} className="item-main"><span className="item-number">{number(index + 1)}</span><span className="min-w-0 flex-1"><span className="item-name">{item.name}</span>{item.description && <span className="item-description">{item.description}</span>}</span><span className="item-count">{number(counts[item.id]?.total ?? 0)}<small>ကြိမ်</small></span><ChevronRight size={18} className="shrink-0 text-muted" /></Link>
    <div className="item-actions"><button className="icon-button" title="ပြင်မည်" aria-label={`${item.name} ပြင်မည်`} onClick={() => onEdit(item)}><Pencil size={16} /></button><button className="icon-button" title="ဖျက်မည်" aria-label={`${item.name} ဖျက်မည်`} onClick={() => onDelete(item)}><Trash2 size={16} /></button></div>
  </div>)}</div>
}