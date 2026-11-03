import { BarChart3, CircleDot, Settings } from 'lucide-react'
import { HashRouter, NavLink, Route, Routes } from 'react-router-dom'
import { AppProvider } from './store/AppContext'
import { useApp } from './store/AppContextValue'
import { Home } from './pages/Home'
import { CategoryPage } from './pages/CategoryPage'
import { CounterPage } from './pages/CounterPage'
import { StatsPage } from './pages/StatsPage'
import { SettingsPage } from './pages/SettingsPage'

function Layout() {
  const { storageError } = useApp()
  const navigation = [{ to: '/', label: 'ပုတီးစိပ်', icon: CircleDot }, { to: '/stats', label: 'မှတ်တမ်း', icon: BarChart3 }, { to: '/settings', label: 'ဆက်တင်', icon: Settings }]
  return <div className="app-shell"><header className="site-header"><div className="header-inner"><NavLink to="/" className="brand"><span className="brand-icon"><CircleDot size={22} /></span><span><strong>ပုတီးစိပ်</strong><small>နေ့စဉ်ကုသိုလ်</small></span></NavLink><nav className="desktop-nav" aria-label="အဓိက လမ်းညွှန်">{navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><Icon size={18} />{label}</NavLink>)}</nav><span className="header-blessing">စိတ်ချမ်းသာ ကိုယ်ကျန်းမာပါစေ</span></div></header>
    {storageError && <div className="storage-warning" role="alert">မှတ်တမ်း သိမ်းဆည်း၍ မရနိုင်ပါ သို့မဟုတ် သိမ်းထားသော အချက်အလက် ပျက်နေပါသည်။ ဘရောက်ဇာ သိုလှောင်မှုကို စစ်ဆေးပြီး မှတ်တမ်းကို ထုတ်ယူထားပါ။</div>}
    <Routes><Route path="/" element={<Home />} /><Route path="/category/:categoryId" element={<CategoryPage />} /><Route path="/category/:categoryId/item/:itemId" element={<CounterPage />} /><Route path="/stats" element={<StatsPage />} /><Route path="/settings" element={<SettingsPage />} /><Route path="*" element={<Home />} /></Routes>
    <footer className="site-footer">စိတ်၏ ငြိမ်းချမ်းခြင်းသည် ကောင်းချီးတစ်ပါးဖြစ်သည်။</footer><nav className="mobile-nav" aria-label="အဓိက လမ်းညွှန်">{navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'mobile-nav-link active' : 'mobile-nav-link'}><Icon size={21} /><span>{label}</span></NavLink>)}</nav></div>
}
export default function App() { return <HashRouter><AppProvider><Layout /></AppProvider></HashRouter> }