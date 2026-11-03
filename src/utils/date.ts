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

export const number = (value: number) => new Intl.NumberFormat('en-US').format(value).replace(/[0-9]/g, digit => '၀၁၂၃၄၅၆၇၈၉'[Number(digit)])