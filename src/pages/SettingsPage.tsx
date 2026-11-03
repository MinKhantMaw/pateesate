import { useRef, useState } from "react";
import { Download, Upload, Trash2 } from "lucide-react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { defaultCategories, defaultSettings } from "../data/defaultCategories";
import { defaultCombos } from "../data/defaultCombos";
import { useApp } from "../store/AppContextValue";
import { downloadData, validData } from "../utils/data";
import type { Settings } from "../types";

export function SettingsPage() {
  const store = useApp();
  const fileInput = useRef<HTMLInputElement>(null);
  const [resetStep, setResetStep] = useState(0);
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState(String(store.settings.defaultTarget));
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
          parsed.version !== 4)
      )
        throw new Error("Invalid data");
      if (
        !window.confirm(
          "လက်ရှိမှတ်တမ်းအားလုံးကို ဖိုင်ထဲရှိ အချက်အလက်များဖြင့် အစားထိုးမည်လား။",
        )
      )
        return;
      store.replaceData(parsed, parsed.version !== 4);
      setTarget(String(parsed.settings.defaultTarget));
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
          <span>
            <strong>အမှောင်ပုံစံ</strong>
            <small>မျက်နှာပြင်အရောင် ပြောင်းမည်</small>
          </span>
          <input
            className="toggle"
            type="checkbox"
            checked={store.settings.theme === "dark"}
            onChange={(event) =>
              update({ theme: event.target.checked ? "dark" : "light" })
            }
          />
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
        <div className="setting-row target-setting">
          <span>
            <strong>မူလ တစ်ပတ်အကြိမ်ရေ</strong>
            <small>အသစ်စိပ်မည့် စာသားများအတွက်</small>
          </span>
          <div className="flex items-center gap-2">
            <input
              className="text-input target-input"
              aria-label="မူလ တစ်ပတ်အကြိမ်ရေ"
              type="number"
              min="1"
              max="1000000"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
            <button
              className="button-outline"
              onClick={() => {
                const value = Number(target);
                if (
                  Number.isSafeInteger(value) &&
                  value >= 1 &&
                  value <= 1000000
                ) {
                  update({ defaultTarget: value });
                  setMessage("မူလအကြိမ်ရေ သိမ်းပြီးပါပြီ။");
                } else setMessage("အကြိမ်ရေကို ၁ မှ ၁,၀၀၀,၀၀၀ အတွင်း ထည့်ပါ။");
              }}
            >
              သိမ်းမည်
            </button>
          </div>
        </div>
      </section>
      <section className="settings-section">
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
            onClick={() =>
              downloadData({
                categories: store.categories,
                combos: store.combos,
                counts: store.counts,
                history: store.history,
                settings: store.settings,
                session: store.sessionData,
                groupRounds: store.groupRounds,
              })
            }
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
            setTarget(String(defaultSettings.defaultTarget));
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
