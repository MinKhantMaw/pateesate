import type { Category, Settings } from '../types'

export const defaultCategories: Category[] = [
  { id: 'buddha', name: 'ဘုရားဂုဏ်တော် ၉ ပါး', mode: 'sequence', items: [
    { id: 'buddha-1', name: 'အရဟံ', description: 'ကိလေသာအပေါင်းမှ ကင်းဝေးတော်မူသော မြတ်စွာဘုရား' },
    { id: 'buddha-2', name: 'သမ္မာသမ္ဗုဒ္ဓေါ', description: 'သစ္စာလေးပါးကို ကိုယ်တော်တိုင် မှန်စွာသိမြင်တော်မူသော' },
    { id: 'buddha-3', name: 'ဝိဇ္ဇာစရဏသမ္ပန္နော', description: 'အသိပညာနှင့် အကျင့်တရားတို့ ပြည့်စုံတော်မူသော' },
    { id: 'buddha-4', name: 'သုဂတော', description: 'ကောင်းသောစကားကို ဆိုတော်မူသော' },
    { id: 'buddha-5', name: 'လောကဝိဒူ', description: 'လောကသုံးပါးကို သိမြင်တော်မူသော' },
    { id: 'buddha-6', name: 'အနုတ္တရော ပုရိသဒမ္မသာရထိ', description: 'ဆုံးမထိုက်သူတို့ကို အတုမရှိ ဆုံးမတော်မူသော' },
    { id: 'buddha-7', name: 'သတ္ထာ ဒေဝမနုဿာနံ', description: 'နတ်လူတို့၏ ဆရာဖြစ်တော်မူသော' },
    { id: 'buddha-8', name: 'ဗုဒ္ဓေါ', description: 'သစ္စာလေးပါးကို သိတော်မူ၍ သိစေတော်မူသော' },
    { id: 'buddha-9', name: 'ဘဂဝါ', description: 'ဘုန်းဂုဏ်တော်နှင့် ပြည့်စုံတော်မူသော' },
  ] },
  { id: 'dhamma', name: 'တရားဂုဏ်တော် ၆ ပါး', mode: 'sequence', items: [
    { id: 'dhamma-1', name: 'သွာက္ခာတော' }, { id: 'dhamma-2', name: 'သန္ဒိဋ္ဌိကော' },
    { id: 'dhamma-3', name: 'အကာလိကော' }, { id: 'dhamma-4', name: 'ဧဟိပဿိကော' },
    { id: 'dhamma-5', name: 'ဩပနေယျိကော' }, { id: 'dhamma-6', name: 'ပစ္စတ္တံ ဝေဒိတဗ္ဗော ဝိညူဟီတိ' },
  ] },
  { id: 'sangha', name: 'သံဃာဂုဏ်တော် ၉ ပါး', mode: 'sequence', items: [
    { id: 'sangha-1', name: 'သုပ္ပဋိပန္နော' }, { id: 'sangha-2', name: 'ဥဇုပဋိပန္နော' },
    { id: 'sangha-3', name: 'ညာယပဋိပန္နော' }, { id: 'sangha-4', name: 'သာမီစိပဋိပန္နော' },
    { id: 'sangha-5', name: 'အာဟုနေယျော' }, { id: 'sangha-6', name: 'ပါဟုနေယျော' },
    { id: 'sangha-7', name: 'ဒက္ခိဏေယျော' }, { id: 'sangha-8', name: 'အဉ္ဇလိကရဏီယော' },
    { id: 'sangha-9', name: 'အနုတ္တရံ ပုညက္ခေတ္တံ လောကဿ' },
  ] },
  { id: 'metta', name: 'မေတ္တာပို့ခြင်း', mode: 'sequence', items: [
    { id: 'metta-1', name: 'ဘေးရန်ကင်းပါစေ' }, { id: 'metta-2', name: 'စိတ်ချမ်းသာပါစေ' },
    { id: 'metta-3', name: 'ကိုယ်ကျန်းမာပါစေ' }, { id: 'metta-4', name: 'ဆင်းရဲကင်းပါစေ' },
    { id: 'metta-5', name: 'သတ္တဝါအားလုံး ချမ်းသာကြပါစေ' },
  ] },
  // { id: 'custom', name: 'ကိုယ်ပိုင်', mode: 'sequence', items: [] },
  { id: 'combo', name: 'သရဏဂုံ + ဂုဏ်တော် + ၂၄ ပစ္စည်း အကျဉ်း', mode: 'sequence', items: [
    ...['ဗုဒ္ဓံ သရဏံ ဂစ္ဆာမိ', 'ဓမ္မံ သရဏံ ဂစ္ဆာမိ', 'သံဃံ သရဏံ ဂစ္ဆာမိ'].map((name, index) => ({ id: `combo-saranagon-${index + 1}`, name })),
    ...['အရဟံ', 'သမ္မာသမ္ဗုဒ္ဓေါ', 'ဝိဇ္ဇာစရဏသမ္ပန္နော', 'သုဂတော', 'လောကဝိဒူ', 'အနုတ္တရော ပုရိသဒမ္မသာရထိ', 'သတ္ထာ ဒေဝမနုဿာနံ', 'ဗုဒ္ဓေါ', 'ဘဂဝါ'].map((name, index) => ({ id: `combo-guna9-${index + 1}`, name })),
    ...['ဟေတုပစ္စယော', 'အာရမ္မဏပစ္စယော', 'အဓိပတိပစ္စယော', 'အနန္တရပစ္စယော', 'သမနန္တရပစ္စယော', 'သဟဇာတပစ္စယော', 'အညမညပစ္စယော', 'နိဿယပစ္စယော', 'ဥပနိဿယပစ္စယော', 'ပုရေဇာတပစ္စယော', 'ပစ္ဆာဇာတပစ္စယော', 'အာသေဝနပစ္စယော', 'ကမ္မပစ္စယော', 'ဝိပါကပစ္စယော', 'အာဟာရပစ္စယော', 'ဣန္ဒြိယပစ္စယော', 'ဈာနပစ္စယော', 'မဂ္ဂပစ္စယော', 'သမ္ပယုတ္တပစ္စယော', 'ဝိပ္ပယုတ္တပစ္စယော', 'အတ္ထိပစ္စယော', 'နတ္ထိပစ္စယော', 'ဝိဂတပစ္စယော', 'အဝိဂတပစ္စယော'].map((name, index) => ({ id: `combo-paccaya-${index + 1}`, name })),
  ] },
]

export const defaultSettings: Settings = { theme: 'light', vibration: true, sound: false, defaultTarget: 108, beadsPerRound: 108, goalRounds: 9 }

