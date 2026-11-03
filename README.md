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

## သတိပေးချက် သတ်မှတ်ရန်

- `.env.example` ပါ `VITE_ONESIGNAL_APP_ID` ကို OneSignal App ID ဖြင့် build environment သို့ ထည့်ပါ။ OneSignal တွင် Web Push ကို Custom Code အဖြစ် သတ်မှတ်ပြီး site URL ကို အသုံးပြုမည့် HTTPS origin နှင့် တူညီစေပါ။ Localhost စမ်းသပ်ရန် OneSignal app သီးခြားသုံးပါ။
- Dashboard တွင် အလိုအလျောက် permission prompt မဖွင့်ပါနှင့်။ နေ့စဉ် ၀၈:၀၀ နှင့် ၂၀:၀၀ (`Asia/Yangon`) အတွက် push message များကို သတ်မှတ်ပါ။ Launch URL ကို app ၏ Home URL (ဥပမာ `https://example.com/#/`၊ subpath ရှိလျှင် ထို path ပါဝင်ရမည်) အဖြစ် သတ်မှတ်ပါ။
- မနက်စာသား: “မင်္ဂလာပါ 🙏 ဒီနေ့ ပုတီးစိပ်ဖို့ အချိန်ရပါပြီ”။ ညနေစာသား: “ညနေစောင်းပါပြီ 🙏 ဒီနေ့ ပုတီးစိပ်ပြီးပြီလား”။ Push ပေးပို့ခြင်းနှင့် အချိန်ဇယားကို OneSignal က ဆောင်ရွက်သည်။
- iOS 16.4+ တွင် Safari မှ Add to Home Screen လုပ်ပြီးမှ push ခွင့်ပြုနိုင်သည်။ App ဖွင့်ထားစဉ် push မရနိုင်သော်လည်း သတိပေးချက်ဖွင့်ထားပြီး ထိုနေ့ စိပ်ထားခြင်းမရှိလျှင် သတ်မှတ်ချိန်၌ app အတွင်း ပြမည်။ နေ့စဉ် history ကို စက်၏ local date ဖြင့် စစ်သည်။
- PWA worker နှင့် OneSignal worker သည် သီးခြား scope များဖြစ်သည်။ OneSignal worker ကို `onesignal/OneSignalSDKWorker.js` မှ တူညီသော origin ပေါ်တွင် JavaScript အဖြစ် ပေးပို့ရမည်။ Dashboard message တွင် သီးခြား URL ထည့်လျှင် default Home URL ကို အစားထိုးမည်။

## ဖိုင်ဖွဲ့စည်းပုံ

```text
src/
  components/       category၊ item list၊ counter၊ chart၊ dialog
  data/             မူလ category၊ combo နှင့် settings
  hooks/            localStorage၊ counter၊ wake lock
  pages/            home၊ category၊ counter၊ stats၊ settings
  store/            React Context နှင့် data လုပ်ဆောင်ချက်များ
  utils/            date၊ JSON validation နှင့် export
  AppShell.tsx      routing နှင့် navigation
  types.ts          data types
  styles.css        Tailwind နှင့် responsive styles
```

## အချက်အလက်နှင့် ကန့်သတ်ချက်များ

- Data ကို browser ၏ `pawtiza:categories`, `pawtiza:combos`, `pawtiza:counts`, `pawtiza:history`, `pawtiza:goalHistory`, `pawtiza:groupRounds`, `pawtiza:settings`, `pawtiza:session` နှင့် `pawtiza:version` keys တွင်သာ သိမ်းသည်။ Storage schema version ၇ သို့ အဆင့်မြှင့်ရာတွင် ယခင် data နှင့် session များကို ထိန်းသိမ်းသည်။ Export ဖိုင်၏ version သည် ၆ ဖြစ်ပြီး version ၁ မှ ၅ အထိ ဖိုင်ဟောင်းများကိုလည်း import လုပ်နိုင်သည်။
- မူလ combo သည် သရဏဂုံ ၃ ခု၊ ဂုဏ်တော် ၉ ပါးနှင့် ၂၄ ပစ္စည်းကို အဆင့် ၃၆ ဆင့် တစ်ဆက်တည်း စိပ်သည်။ အုပ်စုခေါင်းစဉ်များမပြဘဲ လက်ရှိအပိုင်းကို progress bar အောက်တွင် ပြသည်။ မူလ combo သို့ ပြန်ယူလျှင် စုစုပေါင်း count၊ history နှင့် ပတ်ရေများ မပျက်ပါ။
- ယခင် combo စာသားများ၏ item ID များကို ဆက်သုံးသဖြင့် count နှင့် history မပျောက်ပါ။ မပြင်ထားသော ယခင် ၁၂ ဆင့် combo ကို မူလ ၃၆ ဆင့် combo ဖြင့် အစားထိုးပြီး ပြင်ထားသော combo ကို ဆက်လက်ထားရှိသည်။ ယခင် combo ၏ ပတ်ရေမှတ်တမ်းကို မဖျက်ဘဲ သီးခြားထားသည်။
- အုပ်စုပါ category တွင် အုပ်စုအလိုက် စုစုပေါင်းကို ပြပြီး စိပ်နေစဉ် ရှေ့စာသားနှင့် နောက်စာသားသို့ ပြောင်းနိုင်သည်။ အုပ်စုရှိ စာသားတစ်ခုစီ၏ အရေအတွက်ကို အခြား category များနှင့် သီးခြားသိမ်းသည်။
- စိပ်သည့်ပုံစံအားလုံးတွင် စိပ်သည့်အကြိမ်ရေအလိုက် ပတ်ရေတွက်သည်။ မူလသတ်မှတ်ချက်မှာ တစ်ပတ် ၁၀၈ ကြိမ်နှင့် ရည်မှန်းချက် ၉ ပတ်ဖြစ်ပြီး ဆက်တင်နှင့် စိပ်နေစဉ် ပြောင်းနိုင်သည်။ စာသားရွှေ့ခြင်းက ပတ်ရေတွက်ပုံကို မပြောင်းပါ။ ရည်မှန်းချက်ပြည့်သည့်ရက်နှင့် အကြိမ်ရေကို မှတ်တမ်းတွင်ပြပြီး refresh လုပ်လျှင် ပြည့်ကြောင်းပြသချက်နှင့် လက်ရှိနေရာကို ဆက်လက်ထားရှိသည်။ စိပ်နေစဉ် သတ်မှတ်ချက်ပြောင်းပါက လက်ရှိအကြိမ်ကို ပြန်စပြီး စုစုပေါင်းမှတ်တမ်းများကို ထိန်းသိမ်းသည်။
- ပုတီးစေ့အရောင်နှင့် အလင်းကို ဆက်တင်တွင် ပြောင်းနိုင်သည်။ တစ်ပတ်လျှင် ၁၀၈ ကြိမ်ထက်ပိုပါက စိပ်ပြီးသည့်အချိုးအတိုင်း ပုတီးစေ့ ၁၀၈ စေ့ပေါ်တွင် ပြသည်။
- သိမ်းဆည်းမှုကို ၃၅၀ မီလီစက္ကန့် debounce လုပ်ပြီး tab ဖျောက်ခြင်း၊ ပိတ်ခြင်းတွင် flush လုပ်သည်။ Browser သို့မဟုတ် စက် ရုတ်တရက်ပျက်ခြင်းတွင် နောက်ဆုံးပြောင်းလဲမှုများ ဆုံးရှုံးနိုင်သည်။
- Storage ပြည့်ခြင်း သို့မဟုတ် private mode တွင် storage မရခြင်းဖြစ်လျှင် သတိပေးပြီး memory ထဲတွင် ဆက်လက်အသုံးပြုနိုင်သော်လည်း ပြန်ဖွင့်လျှင် အချက်အလက်ပျောက်နိုင်သည်။ JSON export ဖြင့် backup ယူထားပါ။
- ပျက်နေသော JSON ကို မဖတ်နိုင်ပါက မူလတန်ဖိုးဖြင့် စတင်ပြီး သတိပေးမည်။ အဆိုပါ key ကို မပြောင်းလဲမီ မူရင်းပျက်နေသော data ကို အလိုအလျောက် ထပ်မရေးပါ။ မှားယွင်းသော import ဖိုင်ကို ပယ်ချသည်။
- Category သို့မဟုတ် item ဖျက်လျှင် count နှင့် history မပျက်ပါ။ ဖျက်ထားသော စာသားဟု statistics တွင် ပြမည်။ Session reset သို့မဟုတ် target ပြောင်းခြင်းသည် total နှင့် history ကို မဖျက်ပါ။
- အပတ်ကို တနင်္လာနေ့မှ တနင်္ဂနွေနေ့အထိ တွက်ပြီး streak ကို ယနေ့ သို့မဟုတ် မနေ့ကမှ ဆက်တိုက်စိပ်ထားသော ရက်များဖြင့် တွက်သည်။ နေ့စွဲများသည် စက်၏ local time အပေါ် မူတည်သည်။
- Backup မရှိဘဲ browser data ရှင်းလင်းခြင်း၊ site storage ဖျက်ခြင်း သို့မဟုတ် အခြား browser/device သုံးခြင်းတွင် မှတ်တမ်းကို မရနိုင်ပါ။ Export/import ဖြင့် မိမိကိုယ်တိုင် လွှဲပြောင်းပါ။
- စိပ်သည့်မျက်နှာပြင်၏ အောက်ပိုင်းကို နှိပ်၍ စိပ်နိုင်ပြီး reset မလုပ်မီ အတည်ပြုချက်တောင်းသည်။ Wake lock ကို မူလဖွင့်ထားပြီး ဆက်တင်တွင် ပိတ်နိုင်သည်။
- အကြိုက်ဆုံးစာသားများ၊ နောက်ဆုံးစိပ်နေရာ၊ ညပုံစံ၊ မြန်မာဂဏန်းနှင့် စာလုံးအရွယ်အစားကို စက်တွင် သိမ်းထားသည်။ ရက် ၃၀ တစ်ကြိမ် backup သတိပေးမည်။ Export ကို စတင်သည့်အချိန်ကို မှတ်ထားသော်လည်း browser တွင် ဖိုင်တကယ်သိမ်းပြီးကြောင်း မစစ်နိုင်ပါ။
