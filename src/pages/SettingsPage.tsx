import { useEffect, useRef, useState } from "react";
import { Download, Upload, Trash2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { RoundSettings } from "../components/RoundSettings";
import { ReminderSettings } from "../components/ReminderSettings";
import { defaultCategories, defaultSettings } from "../data/defaultCategories";
import { defaultCombos } from "../data/defaultCombos";
import { useApp } from "../store/AppContextValue";
import { downloadData, validData } from "../utils/data";
import type { Settings } from "../types";

export function SettingsPage() {
  const store = useApp();
  const fileInput = useRef<HTMLInputElement>(null);
  const exportSection = useRef<HTMLElement>(null);
  const location = useLocation();
  const [resetStep, setResetStep] = useState(0);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (new URLSearchParams(location.search).has("export")) exportSection.current?.scrollIntoView();
  }, [location.search]);
  function update(patch: Partial<Settings>) {
    store.setSettings((previous) => ({ ...previous, ...patch }));
  }
  async function importFile(file?: File) {
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (
        !validData(parsed) ||
        !("version" in parsed) ||
        (parsed.version !== 1 &&
          parsed.version !== 2 &&
          parsed.version !== 3 &&
          parsed.version !== 4 &&
          parsed.version !== 5 &&
          parsed.version !== 6)
      )
        throw new Error("Invalid data");
      if (
        !window.confirm(
          "လက်ရှိမှတ်တမ်းအားလုံးကို ဖိုင်ထဲရှိ အချက်အလက်များဖြင့် အစားထိုးမည်လား။",
        )
      )
        return;
      store.replaceData(parsed, parsed.version !== 4 && parsed.version !== 5 && parsed.version !== 6, parsed.version !== 6);
      setMessage("မှတ်တမ်းများ ထည့်သွင်းပြီးပါပြီ။");
    } catch {
      setMessage("ဖိုင်ပုံစံ မမှန်ပါ။ မှတ်တမ်းများကို မပြောင်းလဲခဲ့ပါ။");
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  }
  return (
    <main className="page-wrap narrow-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" /> ကိုယ်ပိုင်ရွေးချယ်မှုများ
          </div>
          <h1>ဆက်တင်များ</h1>
          <p>မိမိနှစ်သက်သလို ပြင်ဆင်နိုင်ပါသည်။</p>
        </div>
      </div>
      <section className="settings-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">ပုံစံနှင့် အသံ</span>
            <h2>အသုံးပြုပုံ</h2>
          </div>
        </div>
        <label className="setting-row">
          <strong>မျက်နှာပြင်အရောင်</strong>
          <select className="text-input theme-select" value={store.settings.theme} onChange={event => update({ theme: event.target.value as Settings["theme"] })}>
            <option value="light">အလင်း</option><option value="dark">အမှောင်</option><option value="night">ညအတွက်</option>
          </select>
        </label>
        <label className="setting-row"><strong>မြန်မာဂဏန်း</strong><input className="toggle" type="checkbox" checked={store.settings.burmeseNumerals} onChange={event => update({ burmeseNumerals: event.target.checked })} /></label>
        <label className="setting-row"><strong>စိပ်နေစဉ် မျက်နှာပြင်ဖွင့်ထားမည်</strong><input className="toggle" type="checkbox" checked={store.settings.wakeLock} onChange={event => update({ wakeLock: event.target.checked })} /></label>
        <fieldset className="setting-row bead-style-setting">
          <legend className="sr-only">ပုတီးစေ့အရောင်</legend>
          <strong>ပုတီးစေ့အရောင်</strong>
          <div className="bead-style-options">
            {([['gold', 'ရွှေရောင်'], ['jade', 'ကျောက်စိမ်း'], ['wood', 'သစ်သား']] as const).map(([value, label]) => (
              <label key={value} title={label}>
                <input type="radio" name="bead-style" value={value} checked={store.settings.beadStyle === value} onChange={() => update({ beadStyle: value })} />
                <span className={`bead-swatch ${value}`} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="setting-row">
          <strong>ပုတီးစေ့အလင်း</strong>
          <input className="toggle" type="checkbox" checked={store.settings.glowEffect} onChange={(event) => update({ glowEffect: event.target.checked })} />
        </label>
        <label className="setting-row">
          <span>
            <strong>တုန်ခါမှု</strong>
            <small>စိပ်သည့်အခါ ဖုန်းတုန်ခါမည်</small>
          </span>
          <input
            className="toggle"
            type="checkbox"
            checked={store.settings.vibration}
            onChange={(event) => update({ vibration: event.target.checked })}
          />
        </label>
        <label className="setting-row">
          <span>
            <strong>အသံ</strong>
            <small>စိပ်သည့်အခါ အသံဖွင့်မည်</small>
          </span>
          <input
            className="toggle"
            type="checkbox"
            checked={store.settings.sound}
            onChange={(event) => update({ sound: event.target.checked })}
          />
        </label>
        <RoundSettings
          beadsPerRound={store.settings.beadsPerRound}
          goalRounds={store.settings.goalRounds}
          onChange={(beadsPerRound, goalRounds) =>
            update({ beadsPerRound, goalRounds, defaultTarget: beadsPerRound })
          }
        />
        <ReminderSettings />
      </section>
      <section className="settings-section" ref={exportSection}>
        <div className="section-heading">
          <div>
            <span className="section-kicker">သိမ်းဆည်းခြင်း</span>
            <h2>မှတ်တမ်းများ</h2>
          </div>
        </div>
        <div className="setting-row">
          <span>
            <strong>မှတ်တမ်း ထုတ်ယူမည်</strong>
            <small>ဖိုင်အဖြစ် သိမ်းဆည်းမည်</small>
          </span>
          <button
            className="button-outline"
            onClick={() => {
              const lastBackupAt = new Date().toISOString();
              downloadData({
                categories: store.categories,
                combos: store.combos,
                counts: store.counts,
                history: store.history,
                settings: { ...store.settings, lastBackupAt },
                session: store.sessionData,
                groupRounds: store.groupRounds,
                goalHistory: store.goalHistory,
              });
              update({ lastBackupAt });
              setMessage("မှတ်တမ်း ထုတ်ယူပြီးပါပြီ။");
            }}
          >
            <Download size={18} /> ထုတ်ယူမည်
          </button>
        </div>
        <div className="setting-row">
          <span>
            <strong>မှတ်တမ်း ပြန်ထည့်မည်</strong>
            <small>ယခင်ထုတ်ယူထားသော ဖိုင်ကို ရွေးပါ</small>
          </span>
          <input
            ref={fileInput}
            hidden
            type="file"
            accept="application/json,.json"
            onChange={(event) => void importFile(event.target.files?.[0])}
          />
          <button
            className="button-outline"
            onClick={() => fileInput.current?.click()}
          >
            <Upload size={18} /> ရွေးမည်
          </button>
        </div>
        <div className="setting-row">
          <span>
            <strong>အချက်အလက်အားလုံး ဖျက်မည်</strong>
            <small>မူလအခြေအနေသို့ ပြန်ပြောင်းမည်</small>
          </span>
          <button
            className="button-outline destructive"
            onClick={() => setResetStep(1)}
          >
            <Trash2 size={18} /> ဖျက်မည်
          </button>
        </div>
        <p className="settings-message" role="status">
          {message}
        </p>
      </section>
      {resetStep === 1 && (
        <ConfirmDialog
          title="အချက်အလက်အားလုံး ဖျက်မည်လား"
          onClose={() => setResetStep(0)}
          onConfirm={() => setResetStep(2)}
          confirmLabel="ဆက်လုပ်မည်"
          danger
        >
          <p>
            စိပ်ခဲ့သမျှ၊ မှတ်တမ်းနှင့် ကိုယ်ပိုင်စာသားများ အားလုံး
            ဖျက်သွားပါမည်။ မဖျက်မီ မှတ်တမ်းထုတ်ယူထားနိုင်ပါသည်။
          </p>
        </ConfirmDialog>
      )}
      {resetStep === 2 && (
        <ConfirmDialog
          title="ထပ်မံအတည်ပြုပါ"
          onClose={() => setResetStep(0)}
          onConfirm={() => {
            store.replaceData({
              categories: defaultCategories,
              combos: defaultCombos,
              counts: {},
              history: {},
              settings: defaultSettings,
              session: { singles: {}, sequences: {} },
              groupRounds: {},
            });
            setResetStep(0);
            setMessage("အချက်အလက်အားလုံး ပြန်လည်စတင်ပြီးပါပြီ။");
          }}
          confirmLabel="အားလုံးဖျက်မည်"
          danger
        >
          <p>
            ဤလုပ်ဆောင်ချက်ကို ပြန်ပြင်၍ မရပါ။ အချက်အလက်အားလုံးကို အမှန်တကယ်
            ဖျက်မည်လား။
          </p>
        </ConfirmDialog>
      )}
    </main>
  );
}
