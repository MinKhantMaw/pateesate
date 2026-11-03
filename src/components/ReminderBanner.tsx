import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../store/AppContextValue'
import { dateKey } from '../utils/date'

export function ReminderBanner() {
  const { settings, setSettings, history } = useApp()
  const current = useRef({ settings, history })
  const [message, setMessage] = useState('')

  useEffect(() => { current.current = { settings, history } }, [settings, history])
  useEffect(() => {
    if (!settings.reminders) return
    let previous = Date.now()
    function check() {
      if (document.visibilityState !== 'visible') return
      const now = Date.now()
      const yangon = new Date(now + 390 * 60 * 1000)
      const year = yangon.getUTCFullYear()
      const month = yangon.getUTCMonth()
      const day = yangon.getUTCDate()
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const slots = [{ hour: '08', time: Date.UTC(year, month, day, 1, 30), text: 'မင်္ဂလာပါ 🙏 ဒီနေ့ ပုတီးစိပ်ဖို့ အချိန်ရပါပြီ' }, { hour: '20', time: Date.UTC(year, month, day, 13, 30), text: 'ညနေစောင်းပါပြီ 🙏 ဒီနေ့ ပုတီးစိပ်ပြီးပြီလား' }]
      const slot = slots.findLast(entry => previous < entry.time && entry.time <= now)
      previous = now
      if (!slot) return
      const slotId = `${date}:${slot.hour}`
      if (current.current.settings.lastReminderSlot === slotId || Object.values(current.current.history[dateKey(new Date(now))] ?? {}).some(count => count > 0)) return
      current.current.settings = { ...current.current.settings, lastReminderSlot: slotId }
      setSettings(previousSettings => ({ ...previousSettings, lastReminderSlot: slotId }))
      setMessage(slot.text)
    }
    const timer = window.setInterval(check, 15000)
    window.addEventListener('focus', check)
    document.addEventListener('visibilitychange', check)
    return () => { window.clearInterval(timer); window.removeEventListener('focus', check); document.removeEventListener('visibilitychange', check) }
  }, [settings.reminders, setSettings])

  if (!message) return null
  return <div className="reminder-banner" role="status"><span>{message}</span><button className="icon-button" aria-label="ပိတ်မည်" title="ပိတ်မည်" onClick={() => setMessage('')}><X size={18} /></button></div>
}