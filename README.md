# ပုတီးစိပ်

မြန်မာဘာသာဖြင့် ပုတီးစိပ်ပြီး မှတ်တမ်းတင်နိုင်သော frontend-only application ဖြစ်သည်။ React 18၊ TypeScript၊ Vite၊ Tailwind CSS နှင့် React Context ကို အသုံးပြုထားသည်။ Server သို့မဟုတ် account မလိုပါ။

## စတင်အသုံးပြုရန်

Node.js 22.12+ (သို့မဟုတ် Vite က ပံ့ပိုးသော ပိုမိုသစ်သည့် version) နှင့် npm လိုအပ်သည်။

```bash
npm install
npm run dev
```

Terminal တွင် ပြထားသော local URL ကို browser ဖြင့် ဖွင့်ပါ။ Production build စစ်ရန် `npm run build`၊ build ကို local တွင်ကြည့်ရန် `npm run preview` ကို သုံးပါ။ Build ရလဒ်မှာ `dist/` ဖြစ်သည်။

## Deploy လုပ်ရန်

- **Vercel:** repository ကို import လုပ်ပြီး framework ကို Vite၊ build command ကို `npm run build`၊ output directory ကို `dist` သတ်မှတ်ပါ။
- **Netlify:** repository ကိုချိတ်ပြီး build command ကို `npm run build`၊ publish directory ကို `dist` သတ်မှတ်ပါ။
- **GitHub Pages:** GitHub Actions ဖြင့် `npm ci`၊ `npm run build` လုပ်ပြီး `dist/` ကို Pages artifact အဖြစ် upload/deploy လုပ်ပါ။ Repository settings တွင် Pages source ကို GitHub Actions ရွေးပါ။

HashRouter နှင့် relative asset paths သုံးထားသောကြောင့် static hosting နှင့် repository subpath တွင် rewrite rule မလိုပါ။ Wake lock၊ vibration နှင့် browser API အချို့အတွက် HTTPS သို့မဟုတ် localhost လိုအပ်နိုင်သည်။ Noto Sans Myanmar ကို Google Fonts မှရယူပြီး မရလျှင် စက်တွင်ရှိသော Pyidaungsu/အခြား Myanmar font သုံးသည်။

## ဖိုင်ဖွဲ့စည်းပုံ

```text
src/
  components/       category၊ item list၊ counter၊ chart၊ dialog
  data/             မူလ category နှင့် settings
  hooks/            localStorage၊ counter၊ wake lock
  pages/            home၊ category၊ counter၊ stats၊ settings
  store/            React Context နှင့် data လုပ်ဆောင်ချက်များ
  utils/            date၊ JSON validation နှင့် export
  AppShell.tsx      routing နှင့် navigation
  types.ts          data types
  styles.css        Tailwind နှင့် responsive styles
```

## အချက်အလက်နှင့် ကန့်သတ်ချက်များ

- Data ကို browser ၏ `pawtiza:categories`, `pawtiza:counts`, `pawtiza:history`, `pawtiza:settings`, `pawtiza:session` နှင့် `pawtiza:version` keys တွင်သာ သိမ်းသည်။ လက်ရှိ schema version သည် ၁ ဖြစ်ပြီး import လုပ်ရာတွင် version နှင့် ပုံစံကို စစ်ဆေးသည်။
- သိမ်းဆည်းမှုကို ၃၅၀ မီလီစက္ကန့် debounce လုပ်ပြီး tab ဖျောက်ခြင်း၊ ပိတ်ခြင်းတွင် flush လုပ်သည်။ Browser သို့မဟုတ် စက် ရုတ်တရက်ပျက်ခြင်းတွင် နောက်ဆုံးပြောင်းလဲမှုများ ဆုံးရှုံးနိုင်သည်။
- Storage ပြည့်ခြင်း သို့မဟုတ် private mode တွင် storage မရခြင်းဖြစ်လျှင် သတိပေးပြီး memory ထဲတွင် ဆက်လက်အသုံးပြုနိုင်သော်လည်း ပြန်ဖွင့်လျှင် အချက်အလက်ပျောက်နိုင်သည်။ JSON export ဖြင့် backup ယူထားပါ။
- ပျက်နေသော JSON ကို မဖတ်နိုင်ပါက မူလတန်ဖိုးဖြင့် စတင်ပြီး သတိပေးမည်။ အဆိုပါ key ကို မပြောင်းလဲမီ မူရင်းပျက်နေသော data ကို အလိုအလျောက် ထပ်မရေးပါ။ မှားယွင်းသော import ဖိုင်ကို ပယ်ချသည်။
- Category သို့မဟုတ် item ဖျက်လျှင် count နှင့် history မပျက်ပါ။ ဖျက်ထားသော စာသားဟု statistics တွင် ပြမည်။ Session reset သို့မဟုတ် target ပြောင်းခြင်းသည် total နှင့် history ကို မဖျက်ပါ။
- အပတ်ကို တနင်္လာနေ့မှ တနင်္ဂနွေနေ့အထိ တွက်ပြီး streak ကို ယနေ့ သို့မဟုတ် မနေ့ကမှ ဆက်တိုက်စိပ်ထားသော ရက်များဖြင့် တွက်သည်။ နေ့စွဲများသည် စက်၏ local time အပေါ် မူတည်သည်။
- Backup မရှိဘဲ browser data ရှင်းလင်းခြင်း၊ site storage ဖျက်ခြင်း သို့မဟုတ် အခြား browser/device သုံးခြင်းတွင် မှတ်တမ်းကို မရနိုင်ပါ။ Export/import ဖြင့် မိမိကိုယ်တိုင် လွှဲပြောင်းပါ။
