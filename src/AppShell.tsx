import { useEffect, useState } from "react";
import { BarChart3, CircleDot, Download, Hand, Settings, Share, Smartphone, X } from "lucide-react";
import { HashRouter, Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { AppProvider } from "./store/AppContext";
import { useApp } from "./store/AppContextValue";
import { Home } from "./pages/Home";
import { CategoryPage } from "./pages/CategoryPage";
import { ComboCounterPage, CounterPage } from "./pages/CounterPage";
import { StatsPage } from "./pages/StatsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ReminderBanner } from "./components/ReminderBanner";
import { number } from "./utils/date";

function Layout() {
  const { storageError, settings, setSettings } = useApp();
  const location = useLocation();
  const counterScreen = /^\/(category\/[^/]+\/item\/[^/]+|combo\/[^/]+)$/.test(location.pathname);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);
  const backupDate = Math.max(Date.parse(settings.lastBackupAt ?? "") || 0, Date.parse(settings.backupReminderDismissedAt ?? "") || 0);
  const backupDue = backupDate > 0 && now - backupDate >= 30 * 24 * 60 * 60 * 1000;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const safari = /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(navigator.userAgent);
  const installed = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
  const onboarding = [
    { icon: Hand, title: "နှိပ်ပြီး စိပ်ပါ", text: "မျက်နှာပြင်အောက်ပိုင်းကို နှိပ်တိုင်း တစ်ကြိမ်စိပ်ပါမည်။" },
    { icon: Smartphone, title: "ဤဖုန်းတွင် သိမ်းပါမည်", text: "မှတ်တမ်းများသည် ဤဖုန်းတွင်သာ ရှိပါသည်။ မပျောက်စေရန် backup ထုတ်ထားပါ။" },
    { icon: Share, title: "ပင်မမျက်နှာပြင်သို့ ထည့်ပါ", text: "ဘရောက်ဇာ၏ မျှဝေမီနူးမှ Add to Home Screen ကို ရွေးပါ။" },
  ];
  const currentStep = onboarding[onboardingStep];
  function advanceOnboarding() {
    if (onboardingStep < onboarding.length - 1) setOnboardingStep(onboardingStep + 1);
    else setSettings(previous => ({ ...previous, onboardingComplete: true }));
  }
  const navigation = [
    { to: "/", label: "ပုတီးစိပ်", icon: CircleDot },
    { to: "/stats", label: "မှတ်တမ်း", icon: BarChart3 },
    { to: "/settings", label: "ဆက်တင်", icon: Settings },
  ];
  return (
    <div className={`app-shell${counterScreen ? " is-counter" : ""}`}>
      <header className="site-header">
        <div className="header-inner">
          <NavLink to="/" className="brand">
            <span className="brand-icon">
              <CircleDot size={22} />
            </span>
            <span>
              <strong>ပုတီးစိပ်</strong>
              <small>နေ့စဉ်ကုသိုလ်</small>
            </span>
          </NavLink>
          <nav className="desktop-nav" aria-label="အဓိက လမ်းညွှန်">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
          <span className="header-blessing">စိတ်ချမ်းသာ ကိုယ်ကျန်းမာပါစေ</span>
        </div>
      </header>
      {storageError && (
        <div className="storage-warning" role="alert">
          မှတ်တမ်း သိမ်းဆည်း၍ မရနိုင်ပါ သို့မဟုတ် သိမ်းထားသော အချက်အလက်
          ပျက်နေပါသည်။ ဘရောက်ဇာ သိုလှောင်မှုကို စစ်ဆေးပြီး မှတ်တမ်းကို
          ထုတ်ယူထားပါ။
        </div>
      )}
      <ReminderBanner key={settings.reminders ? "on" : "off"} />
      {!counterScreen && backupDue && <div className="safety-banner" role="status"><Download size={20} aria-hidden="true" /><Link to="/settings?export=1">ဒေတာ backup လုပ်ထားပါ</Link><button className="icon-button" aria-label="သတိပေးချက်ပိတ်မည်" title="ပိတ်မည်" onClick={() => setSettings(previous => ({ ...previous, backupReminderDismissedAt: new Date().toISOString() }))}><X size={18} /></button></div>}
      {!counterScreen && settings.onboardingComplete && ios && safari && !installed && !settings.iosHintDismissed && <div className="safety-banner" role="status"><Share size={20} aria-hidden="true" /><span>ဒေတာ မပျောက်စေရန် Share မှ Add to Home Screen ကို ရွေးပါ။</span><button className="icon-button" aria-label="သတိပေးချက်ပိတ်မည်" title="ပိတ်မည်" onClick={() => setSettings(previous => ({ ...previous, iosHintDismissed: true }))}><X size={18} /></button></div>}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route
          path="/category/:categoryId/item/:itemId"
          element={<CounterPage />}
        />
        <Route path="/combo/:comboId" element={<ComboCounterPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <footer className="site-footer">
        စိတ်၏ ငြိမ်းချမ်းခြင်းသည် ကောင်းချီးတစ်ပါးဖြစ်သည်။
      </footer>
      <nav className="mobile-nav" aria-label="အဓိက လမ်းညွှန်">
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              isActive ? "mobile-nav-link active" : "mobile-nav-link"
            }
          >
            <Icon size={21} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      {!settings.onboardingComplete && <div className="modal-backdrop onboarding-backdrop"><div className="modal-panel onboarding-panel" role="dialog" aria-modal="true" aria-labelledby="onboarding-title"><currentStep.icon size={32} aria-hidden="true" /><p className="onboarding-progress">{number(onboardingStep + 1)} / {number(onboarding.length)}</p><h2 id="onboarding-title">{currentStep.title}</h2><p>{currentStep.text}</p><div className="onboarding-actions"><button className="button-outline" onClick={advanceOnboarding}>ကျော်မည်</button><button className="button-primary" autoFocus onClick={advanceOnboarding}>{onboardingStep === onboarding.length - 1 ? "စတင်မည်" : "ရှေ့သို့"}</button></div></div></div>}
    </div>
  );
}
export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <Layout />
      </AppProvider>
    </HashRouter>
  );
}
