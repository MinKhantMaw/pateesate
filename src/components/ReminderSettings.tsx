import { useEffect, useState } from "react";
import { useApp } from "../store/AppContextValue";
import {
  getPushSDK,
  iosNeedsInstall,
  pushConfigured,
  pushSupported,
} from "../utils/push";
import { pwaRegistrationFailed } from "../utils/pwa";
import { number } from "../utils/date";

export function ReminderSettings() {
  const { settings, setSettings } = useApp();
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >(() => ("Notification" in window ? Notification.permission : "unsupported"));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [workerFailed, setWorkerFailed] = useState(pwaRegistrationFailed);
  const needsInstall = iosNeedsInstall();

  useEffect(() => {
    const refresh = () =>
      setPermission(
        "Notification" in window ? Notification.permission : "unsupported",
      );
    const workerError = () => setWorkerFailed(true);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("pwa-registration-error", workerError);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("pwa-registration-error", workerError);
    };
  }, []);

  async function toggle(enabled: boolean) {
    setMessage("");
    setBusy(true);
    try {
      if (enabled) {
        setSettings((previous) => ({ ...previous, reminders: true }));
        if (needsInstall || !pushSupported()) {
          setMessage("ဤဘရောက်ဇာတွင် push သတိပေးချက် မရနိုင်ပါ။");
          return;
        }
        if (!pushConfigured()) {
          setMessage("Push သတိပေးချက်ကို မသတ်မှတ်ရသေးပါ။");
          return;
        }
        const result =
          Notification.permission === "default"
            ? await Notification.requestPermission()
            : Notification.permission;
        setPermission(result);
        if (result !== "granted") return;
        const sdk = await getPushSDK();
        if (!sdk.Notifications.isPushSupported()) {
          setMessage("ဤဘရောက်ဇာတွင် push သတိပေးချက် မရနိုင်ပါ။");
          return;
        }
        await sdk.User.PushSubscription.optIn();
      } else {
        if (
          pushConfigured() &&
          pushSupported() &&
          Notification.permission === "granted"
        ) {
          const sdk = await getPushSDK();
          if (sdk.Notifications.isPushSupported())
            await sdk.User.PushSubscription.optOut();
        }
        setSettings((previous) => ({ ...previous, reminders: false }));
      }
    } catch {
      setMessage("Push သတိပေးချက်ကို ပြောင်း၍ မရပါ။ နောက်တစ်ကြိမ် ကြိုးစားပါ။");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="reminder-settings">
      <label className="setting-row">
        <span>
          <strong>နေ့စဉ်သတိပေးချက်</strong>
          <small>မနက် {number(8)} နာရီနှင့် ည {number(8)} နာရီ</small>
        </span>
        <input
          className="toggle"
          type="checkbox"
          checked={settings.reminders}
          disabled={busy}
          onChange={(event) => void toggle(event.target.checked)}
        />
      </label>
      <div className="reminder-status" role="status">
        <p>
          {permission === "granted"
            ? "သတိပေးချက် ခွင့်ပြုထားပါသည်။"
            : permission === "denied"
              ? "သတိပေးချက် ခွင့်မပြုထားပါ။"
              : permission === "default"
                ? "သတိပေးချက် ခွင့်ပြုချက် မတောင်းရသေးပါ။"
                : "ဤဘရောက်ဇာတွင် သတိပေးချက် မရနိုင်ပါ။"}
        </p>
        {permission === "denied" && (
          <p>ဘရောက်ဇာ၏ site settings တွင် notifications ကို ခွင့်ပြုပေးပါ။</p>
        )}
        {needsInstall && (
          <p>
            Share ခလုတ်ကိုနှိပ်ပြီး Add to Home Screen လုပ်မှ သတိပေးချက်ရပါမည်
          </p>
        )}
        {workerFailed && <p>App service worker ကို ဖွင့်၍ မရပါ။</p>}
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}
