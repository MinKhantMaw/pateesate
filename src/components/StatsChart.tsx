import { dateKey, number, shiftDay } from '../utils/date'
import type { History } from '../types'

export function StatsChart({ history, today }: { history: History; today: Date }) {
  const days = Array.from({ length: 7 }, (_, index) => shiftDay(today, index - 6))
  const values = days.map(day => Object.values(history[dateKey(day)] ?? {}).reduce((sum, count) => sum + count, 0))
  const maximum = Math.max(...values, 1)
  return <div className="chart" role="img" aria-label={`နောက်ဆုံး ${number(7)} ရက် စုစုပေါင်း ${number(values.reduce((sum, value) => sum + value, 0))} ကြိမ်`}>
    {days.map((day, index) => <div className="chart-column" key={dateKey(day)}><span className="chart-value">{number(values[index])}</span><div className="chart-track"><div className={`chart-bar ${index === 6 ? 'today' : ''}`} style={{ height: `${Math.max(values[index] ? 7 : 2, values[index] / maximum * 100)}%` }} /></div><span className="chart-label">{number(day.getDate())}/{number(day.getMonth() + 1)}</span></div>)}
  </div>
}