export function dateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function shiftDay(date: Date, days: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  result.setDate(result.getDate() + days)
  return result
}

let burmeseNumerals = true
export const setBurmeseNumerals = (enabled: boolean) => { burmeseNumerals = enabled }
export const localizeDigits = (text: string) => text.replace(/[0-9၀-၉]/g, digit => {
  const index = '၀၁၂၃၄၅၆၇၈၉'.indexOf(digit)
  const value = index < 0 ? Number(digit) : index
  return burmeseNumerals ? '၀၁၂၃၄၅၆၇၈၉'[value] : String(value)
})
export const number = (value: number) => {
  const formatted = new Intl.NumberFormat('en-US').format(value)
  return burmeseNumerals ? formatted.replace(/[0-9]/g, digit => '၀၁၂၃၄၅၆၇၈၉'[Number(digit)]) : formatted
}