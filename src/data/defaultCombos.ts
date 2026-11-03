import type { Combo } from '../types'

export const defaultCombos: Combo[] = [{ id: 'combo-saranagon-guna-paccaya', name: 'သရဏဂုံ + ဂုဏ်တော် + ၂၄ ပစ္စည်း', steps: [
  ...Array.from({ length: 3 }, (_, index) => ({ itemId: `combo-saranagon-${index + 1}`, repeat: 1 })),
  ...Array.from({ length: 9 }, (_, index) => ({ itemId: `combo-guna9-${index + 1}`, repeat: 1 })),
  ...Array.from({ length: 24 }, (_, index) => ({ itemId: `combo-paccaya-${index + 1}`, repeat: 1 })),
] }]