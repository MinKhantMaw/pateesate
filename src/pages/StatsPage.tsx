import { useEffect, useState } from "react";
import {
  Flame,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Sparkles,
} from "lucide-react";
import { StatsChart } from "../components/StatsChart";
import { useApp } from "../store/AppContextValue";
import { availableCategories, sequenceKey } from "../utils/data";
import { dateKey, number, shiftDay } from "../utils/date";

export function StatsPage() {
  const { categories, combos, counts, history, groupRounds, goalHistory } =
    useApp();
  const [today, setToday] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setToday(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const todayKey = dateKey(today);
  const weekStart = dateKey(shiftDay(today, -((today.getDay() + 6) % 7)));
  const monthStart = `${todayKey.slice(0, 7)}-01`;
  const sumDays = (start: string) =>
    Object.entries(history)
      .filter(([date]) => date >= start && date <= todayKey)
      .reduce(
        (sum, [, entries]) =>
          sum + Object.values(entries).reduce((a, b) => a + b, 0),
        0,
      );
  const all = Object.values(counts).reduce(
    (sum, count) => sum + count.total,
    0,
  );
  const dayTotal = (date: Date) =>
    Object.values(history[dateKey(date)] ?? {}).reduce(
      (sum, value) => sum + value,
      0,
    );
  let cursor = dayTotal(today) ? today : shiftDay(today, -1);
  let streak = 0;
  while (dayTotal(cursor) > 0) {
    streak++;
    cursor = shiftDay(cursor, -1);
  }
  const names = new Map(
    availableCategories(categories).flatMap((category) =>
      category.items.map((item) => [item.id, item.name] as const),
    ),
  );
  const groupNames = new Map(
    categories.flatMap((category) =>
      Array.from(
        new Set(category.items.map((item) => item.group || undefined)),
        (group) =>
          [
            sequenceKey(category.id, group),
            group ? `${category.name} · ${group}` : category.name,
          ] as const,
      ),
    ),
  );
  for (const combo of combos) groupNames.set(combo.id, combo.name);
  const stats = [
    { label: "ဒီနေ့", value: sumDays(todayKey), icon: Sparkles },
    { label: "ဒီအပတ်", value: sumDays(weekStart), icon: CalendarDays },
    {
      label: "ဒီလ",
      value: sumDays(monthStart),
      icon: ChartNoAxesColumnIncreasing,
    },
    { label: "အားလုံး", value: all, icon: Flame },
  ];
  return (
    <main className="page-wrap">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" /> ကုသိုလ်မှတ်တမ်း
          </div>
          <h1>စိပ်ခဲ့သမျှ</h1>
          <p>တစ်နေ့ချင်းစီ၏ ကြိုးစားအားထုတ်မှုများ။</p>
        </div>
        <div className="streak">
          <Flame size={21} />
          <span>
            ဆက်တိုက် <strong>{number(streak)} ရက်</strong>
          </span>
        </div>
      </div>
      <div className="stats-grid">
        {stats.map(({ label, value, icon: Icon }) => (
          <div className="stat-tile" key={label}>
            <div>
              <span>{label}</span>
              <Icon size={19} />
            </div>
            <strong>
              {number(value)} <small>ကြိမ်</small>
            </strong>
          </div>
        ))}
      </div>
      <section className="content-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">ရည်မှန်းချက်</span>
            <h2>ပြည့်ခဲ့သော အစီအစဉ်များ</h2>
          </div>
          <strong>
            {number(
              Object.values(goalHistory).reduce(
                (total, entries) => total + entries.length,
                0,
              ),
            )}{" "}
            ကြိမ်
          </strong>
        </div>
        <div className="history-list">
          {Object.entries(goalHistory)
            .sort(([first], [second]) => second.localeCompare(first))
            .flatMap(([date, entries]) =>
              Object.entries(
                entries.reduce<Record<number, number>>(
                  (totals, entry) => ({
                    ...totals,
                    [entry.goalRounds]: (totals[entry.goalRounds] ?? 0) + 1,
                  }),
                  {},
                ),
              ).map(([goal, count]) => (
                <div className="history-row" key={`${date}:${goal}`}>
                  <span>
                    {number(Number(goal))} ပတ်ပြည့်သည့်ရက်:{" "}
                    {number(Number(date.slice(8, 10)))} /{" "}
                    {number(Number(date.slice(5, 7)))} /{" "}
                    {number(Number(date.slice(0, 4)))}
                  </span>
                  <strong>{number(count)} ကြိမ်</strong>
                </div>
              )),
            )}
          {!Object.values(goalHistory).some((entries) => entries.length) && (
            <div className="empty-state">မှတ်တမ်း မရှိသေးပါ။</div>
          )}
        </div>
      </section>
      <section className="content-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">နေ့စဉ်မှတ်တမ်း</span>
            <h2>လွန်ခဲ့သော ၇ ရက်</h2>
          </div>
        </div>
        <StatsChart history={history} today={today} />
      </section>
      <section className="content-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">စုစုပေါင်း</span>
            <h2>စာသားအလိုက်</h2>
          </div>
        </div>
        <div className="history-list">
          {Object.entries(counts)
            .sort((a, b) => b[1].total - a[1].total)
            .map(([id, count]) => (
              <div className="history-row" key={id}>
                <span>
                  {names.get(id) ?? "ဖျက်ထားသော စာသား"}{" "}
                  {!names.has(id) && <small>({id})</small>}
                </span>
                <strong>{number(count.total)} ကြိမ်</strong>
              </div>
            ))}
          {!Object.keys(counts).length && (
            <div className="empty-state">မှတ်တမ်း မရှိသေးပါ။</div>
          )}
        </div>
      </section>
      <section className="content-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">အစဉ်လိုက်စိပ်ခြင်း</span>
            <h2>အုပ်စုအလိုက် ပတ်ရေ</h2>
          </div>
        </div>
        <div className="history-list">
          {Object.entries(groupRounds).map(([key, rounds]) => (
            <div className="history-row" key={key}>
              <span>
                {groupNames.get(key) ?? "ဖျက်ထားသော အုပ်စု"}{" "}
                {!groupNames.has(key) && <small>({key})</small>}
              </span>
              <strong>{number(rounds)} ပတ်</strong>
            </div>
          ))}
          {!Object.keys(groupRounds).length && (
            <div className="empty-state">မှတ်တမ်း မရှိသေးပါ။</div>
          )}
        </div>
      </section>
      <section className="content-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">နေ့စဉ်</span>
            <h2>စိပ်ခဲ့သော မှတ်တမ်းများ</h2>
          </div>
        </div>
        <div className="history-list">
          {Object.entries(history)
            .sort(([a], [b]) => b.localeCompare(a))
            .filter(([, entries]) =>
              Object.values(entries).some((value) => value > 0),
            )
            .map(([date, entries]) => (
              <div className="history-day" key={date}>
                <h3>
                  {number(Number(date.slice(8, 10)))} /{" "}
                  {number(Number(date.slice(5, 7)))} /{" "}
                  {number(Number(date.slice(0, 4)))}
                </h3>
                {Object.entries(entries)
                  .filter(([, value]) => value > 0)
                  .map(([id, value]) => (
                    <div className="history-row" key={id}>
                      <span>{names.get(id) ?? "ဖျက်ထားသော စာသား"}</span>
                      <strong>{number(value)} ကြိမ်</strong>
                    </div>
                  ))}
              </div>
            ))}
          {!Object.values(history).some((entries) =>
            Object.values(entries).some((value) => value > 0),
          ) && <div className="empty-state">မှတ်တမ်း မရှိသေးပါ။</div>}
        </div>
      </section>
    </main>
  );
}
