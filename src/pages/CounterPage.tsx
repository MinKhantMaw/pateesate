import { useEffect, useState } from 'react'
import { ArrowLeft, RotateCcw, Undo2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { CounterButton } from '../components/CounterButton'
import { useCounter } from '../hooks/useCounter'
import { useWakeLock } from '../hooks/useWakeLock'
import { useApp } from '../store/AppContextValue'
import { number } from '../utils/date'

export function CounterPage() {
  const { categoryId, itemId = '' } = useParams()
  const { categories } = useApp()
  const category = categories.find(entry => entry.id === categoryId)
  const item = category?.items.find(entry => entry.id === itemId)
  const counter = useCounter(itemId)
  const wake = useWakeLock()
  const [completed, setCompleted] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [pendingTarget, setPendingTarget] = useState<number | null>(null)
  const [customTarget, setCustomTarget] = useState('')
  useEffect(() => { if (completed) { const timer = window.setTimeout(() => setCompleted(false), 3500); return () => window.clearTimeout(timer) } }, [completed, counter.count.rounds])
  if (!item || !category) return <main className="page-wrap"><p>စိပ်ရန်စာသားကို ရှာမတွေ့ပါ။</p><Link className="back-link" to="/">မူလစာမျက်နှာသို့</Link></main>
  function changeTarget(target: number) {
    if (!Number.isSafeInteger(target) || target < 1 || target > 1000000 || target === counter.session.target) return
    if (counter.session.count || counter.session.undo.length) setPendingTarget(target)
    else counter.reset(target)
  }
  return <main className="counter-page">
    <div className="counter-top"><Link className="back-link" to={`/category/${category.id}`}><ArrowLeft size={18} /> နောက်သို့</Link><span className="counter-category">{category.name}</span></div>
    <div className="counter-heading"><div className="eyebrow justify-center"><span className="eyebrow-dot" /> ယခုစိပ်နေသည်</div><h1>{item.name}</h1>{item.description && <p>{item.description}</p>}</div>
    <div className="counter-stage"><div className="bead-orbit"><CounterButton count={counter.session.count} target={counter.session.target} onClick={() => { if (counter.tap()) setCompleted(true) }} /></div></div>
    <div className="round-message" aria-live="polite">{completed ? 'တစ်ပတ်ပြည့်ပါပြီ' : '\u00a0'}</div>
    <div className="counter-summary"><div><span>စုစုပေါင်း</span><strong>{number(counter.count.total)} <small>ကြိမ်</small></strong></div><div><span>ပတ်ရေ</span><strong>{number(counter.count.rounds)} <small>ပတ်</small></strong></div></div>
    <div className="counter-actions"><button className="button-secondary" disabled={!counter.session.undo.length} onClick={() => { counter.undo(); setCompleted(false) }}><Undo2 size={19} /> တစ်ကြိမ်ပြန်ယူမည်</button><button className="button-secondary" onClick={() => setConfirmReset(true)}><RotateCcw size={19} /> ယခုအကြိမ် ပြန်စမည်</button></div>
    <div className="counter-settings"><div><label className="field-label" htmlFor="target-select">တစ်ပတ်လျှင် အကြိမ်ရေ</label><select id="target-select" className="text-input" value={[9, 27, 54, 108].includes(counter.session.target) ? counter.session.target : 'custom'} onChange={event => { if (event.target.value === 'custom') { setCustomTarget(String(counter.session.target)); return } changeTarget(Number(event.target.value)) }}><option value="9">၉ ကြိမ်</option><option value="27">၂၇ ကြိမ်</option><option value="54">၅၄ ကြိမ်</option><option value="108">၁၀၈ ကြိမ်</option><option value="custom">ကိုယ်တိုင်သတ်မှတ်မည်</option></select>{(customTarget !== '' || ![9, 27, 54, 108].includes(counter.session.target)) && <div className="custom-target"><input aria-label="ကိုယ်တိုင်သတ်မှတ်မည့် အကြိမ်ရေ" className="text-input" type="number" min="1" max="1000000" value={customTarget || counter.session.target} onChange={event => setCustomTarget(event.target.value)} /><button className="button-outline" onClick={() => { changeTarget(Number(customTarget)); setCustomTarget('') }}>သတ်မှတ်မည်</button></div>}</div><label className="wake-row"><span>မျက်နှာပြင်ဖွင့်ထားမည်{!wake.supported && <small>ဤဘရောက်ဇာတွင် မရနိုင်ပါ</small>}{wake.error && <small>မျက်နှာပြင်ဖွင့်ထား၍ မရပါ</small>}</span><input type="checkbox" className="toggle" checked={wake.enabled} disabled={!wake.supported} onChange={event => wake.setEnabled(event.target.checked)} /></label></div>
    {confirmReset && <ConfirmDialog title="ယခုအကြိမ် ပြန်စမည်လား" onClose={() => setConfirmReset(false)} onConfirm={() => { counter.reset(); setCompleted(false); setConfirmReset(false) }} confirmLabel="ပြန်စမည်"><p>ယခုအကြိမ်ကို သုညမှ ပြန်စပါမည်။ စုစုပေါင်းနှင့် မှတ်တမ်းများ မပျက်ပါ။</p></ConfirmDialog>}
    {pendingTarget !== null && <ConfirmDialog title="အကြိမ်ရေ ပြောင်းမည်လား" onClose={() => setPendingTarget(null)} onConfirm={() => { counter.reset(pendingTarget); setCompleted(false); setPendingTarget(null) }} confirmLabel="ပြောင်းမည်"><p>အကြိမ်ရေပြောင်းလျှင် ယခုအကြိမ်ကို သုညမှ ပြန်စပါမည်။ စုစုပေါင်းနှင့် မှတ်တမ်းများ မပျက်ပါ။</p></ConfirmDialog>}
  </main>
}