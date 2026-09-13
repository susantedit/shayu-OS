export const NEPALI_MONTHS = [
  'बैशाख',
  'जेठ',
  'असार',
  'साउन',
  'भाद्र',
  'असोज',
  'कार्तिक',
  'मंसिर',
  'पौष',
  'माघ',
  'फागुन',
  'चैत',
] as const

export const NEPALI_MONTHS_EN = [
  'Baishakh', 'Jestha', 'Ashadh', 'Shrawan',
  'Bhadra', 'Ashwin', 'Kartik', 'Mangsir',
  'Poush', 'Magh', 'Falgun', 'Chaitra'
] as const

export const NEPALI_DAYS_SHORT = [
  'आइत', 'सोम', 'मङ्गल', 'बुध', 'बिही', 'शुक्र', 'शनि'
] as const

export const NEPALI_DAYS_FULL = [
  'आइतबार', 'सोमबार', 'मङ्गलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'
] as const

export const NEPALI_SEASONS = [
  { name: 'वसन्त (Spring)', months: [11, 12] },
  { name: 'ग्रीष्म (Summer)', months: [1, 2] },
  { name: 'वर्षा (Monsoon)', months: [3, 4] },
  { name: 'शरद (Autumn)', months: [5, 6] },
  { name: 'हेमन्त (Pre-Winter)', months: [7, 8] },
  { name: 'शिशिर (Winter)', months: [9, 10] },
]

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']

export function toDevanagariDigits(num: number | string): string {
  return String(num).replace(/[0-9]/g, digit => DEVANAGARI_DIGITS[parseInt(digit, 10)])
}

export function fromDevanagariDigits(str: string): string {
  let res = ''
  for (const ch of str) {
    const idx = DEVANAGARI_DIGITS.indexOf(ch)
    res += idx !== -1 ? idx : ch
  }
  return res
}

export interface BSYearData {
  bsYear: number
  adStart: { year: number; month: number; day: number }
  daysInMonth: number[]
}

export const BS_CALENDAR_DATA: BSYearData[] = [
  {
    bsYear: 2075,
    adStart: { year: 2018, month: 4, day: 14 },
    daysInMonth: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  },
  {
    bsYear: 2076,
    adStart: { year: 2019, month: 4, day: 14 },
    daysInMonth: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  },
  {
    bsYear: 2077,
    adStart: { year: 2020, month: 4, day: 13 },
    daysInMonth: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  },
  {
    bsYear: 2078,
    adStart: { year: 2021, month: 4, day: 14 },
    daysInMonth: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  },
  {
    bsYear: 2079,
    adStart: { year: 2022, month: 4, day: 14 },
    daysInMonth: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  },
  {
    bsYear: 2080,
    adStart: { year: 2023, month: 4, day: 14 },
    daysInMonth: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  },
  {
    bsYear: 2081,
    adStart: { year: 2024, month: 4, day: 13 },
    daysInMonth: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  },
  {
    bsYear: 2082,
    adStart: { year: 2025, month: 4, day: 14 },
    daysInMonth: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  },
  {
    bsYear: 2083,
    adStart: { year: 2026, month: 4, day: 14 },
    daysInMonth: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  },
  {
    bsYear: 2084,
    adStart: { year: 2027, month: 4, day: 14 },
    daysInMonth: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  },
  {
    bsYear: 2085,
    adStart: { year: 2028, month: 4, day: 13 },
    daysInMonth: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  },
  {
    bsYear: 2086,
    adStart: { year: 2029, month: 4, day: 14 },
    daysInMonth: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  },
  {
    bsYear: 2087,
    adStart: { year: 2030, month: 4, day: 14 },
    daysInMonth: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  },
  {
    bsYear: 2088,
    adStart: { year: 2031, month: 4, day: 14 },
    daysInMonth: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  },
  {
    bsYear: 2089,
    adStart: { year: 2032, month: 4, day: 13 },
    daysInMonth: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  },
  {
    bsYear: 2090,
    adStart: { year: 2033, month: 4, day: 14 },
    daysInMonth: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  },
]

export interface NepaliDateResult {
  bsYear: number
  bsMonth: number
  bsDay: number
  monthName: string
  monthNameEn: string
  dayOfWeek: number
  dayName: string
  dayNameEn: string
  seasonName: string
  formattedBS: string
  formattedShort: string
}

const ENGLISH_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function getNepaliDateBS(adDate: Date = new Date()): NepaliDateResult {
  const targetTime = new Date(adDate.getFullYear(), adDate.getMonth(), adDate.getDate()).getTime()
  const dayOfWeek = adDate.getDay()

  for (let i = 0; i < BS_CALENDAR_DATA.length; i++) {
    const yearData = BS_CALENDAR_DATA[i]
    const yearStartDate = new Date(yearData.adStart.year, yearData.adStart.month - 1, yearData.adStart.day).getTime()

    const nextYearData = BS_CALENDAR_DATA[i + 1]
    const yearEndDate = nextYearData
      ? new Date(nextYearData.adStart.year, nextYearData.adStart.month - 1, nextYearData.adStart.day).getTime()
      : yearStartDate + 366 * 86400000

    if (targetTime >= yearStartDate && targetTime < yearEndDate) {
      let daysPassed = Math.round((targetTime - yearStartDate) / 86400000)
      let bsMonth = 1
      let bsDay = 1

      for (let m = 0; m < 12; m++) {
        const daysInMonth = yearData.daysInMonth[m]
        if (daysPassed < daysInMonth) {
          bsMonth = m + 1
          bsDay = daysPassed + 1
          break
        }
        daysPassed -= daysInMonth
      }

      const monthName = NEPALI_MONTHS[bsMonth - 1]
      const monthNameEn = NEPALI_MONTHS_EN[bsMonth - 1]
      const season = NEPALI_SEASONS.find(s => s.months.includes(bsMonth))?.name || ''
      const yearDevanagari = toDevanagariDigits(yearData.bsYear)
      const dayDevanagari = toDevanagariDigits(bsDay)

      return {
        bsYear: yearData.bsYear,
        bsMonth,
        bsDay,
        monthName,
        monthNameEn,
        dayOfWeek,
        dayName: NEPALI_DAYS_FULL[dayOfWeek],
        dayNameEn: ENGLISH_DAYS[dayOfWeek],
        seasonName: season,
        formattedBS: `${yearDevanagari} ${monthName} ${dayDevanagari}`,
        formattedShort: `${monthName} ${dayDevanagari}`,
      }
    }
  }

  const approxYear = adDate.getFullYear() + 57
  const monthIdx = (adDate.getMonth() + 8) % 12
  const approxDay = adDate.getDate()
  const monthName = NEPALI_MONTHS[monthIdx]
  return {
    bsYear: approxYear,
    bsMonth: monthIdx + 1,
    bsDay: approxDay,
    monthName,
    monthNameEn: NEPALI_MONTHS_EN[monthIdx],
    dayOfWeek,
    dayName: NEPALI_DAYS_FULL[dayOfWeek],
    dayNameEn: ENGLISH_DAYS[dayOfWeek],
    seasonName: '',
    formattedBS: `${toDevanagariDigits(approxYear)} ${monthName} ${toDevanagariDigits(approxDay)}`,
    formattedShort: `${monthName} ${toDevanagariDigits(approxDay)}`,
  }
}

export function convertBSToAD(bsYear: number, bsMonth: number, bsDay: number): Date | null {
  const yearData = BS_CALENDAR_DATA.find(y => y.bsYear === bsYear)
  if (!yearData) return null

  if (bsMonth < 1 || bsMonth > 12) return null
  const daysInMonth = yearData.daysInMonth[bsMonth - 1]
  if (bsDay < 1 || bsDay > daysInMonth) return null

  let daysFromStart = 0
  for (let m = 0; m < bsMonth - 1; m++) {
    daysFromStart += yearData.daysInMonth[m]
  }
  daysFromStart += (bsDay - 1)

  const startDate = new Date(yearData.adStart.year, yearData.adStart.month - 1, yearData.adStart.day)
  return new Date(startDate.getTime() + daysFromStart * 86400000)
}

export interface BSDayCell {
  day: number
  dayDevanagari: string
  adDate: Date
  isToday: boolean
  weekday: number
}

export function getBSMonthCalendar(bsYear: number, bsMonth: number): {
  totalDays: number
  startingWeekday: number
  cells: BSDayCell[]
  monthName: string
  monthNameEn: string
  yearDevanagari: string
} {
  const yearData = BS_CALENDAR_DATA.find(y => y.bsYear === bsYear) || BS_CALENDAR_DATA[5]
  const monthIdx = Math.max(0, Math.min(11, bsMonth - 1))
  const totalDays = yearData.daysInMonth[monthIdx]

  const firstDayAD = convertBSToAD(bsYear, bsMonth, 1) || new Date()
  const startingWeekday = firstDayAD.getDay()

  const today = new Date()
  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()

  const cells: BSDayCell[] = []
  for (let d = 1; d <= totalDays; d++) {
    const ad = convertBSToAD(bsYear, bsMonth, d) || new Date()
    const isToday = new Date(ad.getFullYear(), ad.getMonth(), ad.getDate()).getTime() === todayNormalized
    cells.push({
      day: d,
      dayDevanagari: toDevanagariDigits(d),
      adDate: ad,
      isToday,
      weekday: ad.getDay(),
    })
  }

  return {
    totalDays,
    startingWeekday,
    cells,
    monthName: NEPALI_MONTHS[monthIdx],
    monthNameEn: NEPALI_MONTHS_EN[monthIdx],
    yearDevanagari: toDevanagariDigits(bsYear),
  }
}

export const LAND_CONSTANTS = {
  SQFT_PER_ROPANI: 5476,
  SQFT_PER_AANA: 342.25,
  SQFT_PER_PAISA: 85.5625,
  SQFT_PER_DAAM: 21.390625,

  SQFT_PER_BIGHA: 72900,
  SQFT_PER_KATTHA: 3645,
  SQFT_PER_DHUR: 182.25,
  SQFT_PER_KANWA: 11.390625,

  SQFT_PER_SQMTR: 10.7639,
  SQFT_PER_ACRE: 43560,
}

export function pahadToSqFt(ropani: number, aana: number, paisa: number, daam: number): number {
  return (
    (ropani || 0) * LAND_CONSTANTS.SQFT_PER_ROPANI +
    (aana || 0) * LAND_CONSTANTS.SQFT_PER_AANA +
    (paisa || 0) * LAND_CONSTANTS.SQFT_PER_PAISA +
    (daam || 0) * LAND_CONSTANTS.SQFT_PER_DAAM
  )
}

export function sqFtToPahad(sqFt: number): { ropani: number; aana: number; paisa: number; daam: number } {
  let rem = Math.max(0, sqFt)
  const ropani = Math.floor(rem / LAND_CONSTANTS.SQFT_PER_ROPANI)
  rem %= LAND_CONSTANTS.SQFT_PER_ROPANI

  const aana = Math.floor(rem / LAND_CONSTANTS.SQFT_PER_AANA)
  rem %= LAND_CONSTANTS.SQFT_PER_AANA

  const paisa = Math.floor(rem / LAND_CONSTANTS.SQFT_PER_PAISA)
  rem %= LAND_CONSTANTS.SQFT_PER_PAISA

  const daam = Number((rem / LAND_CONSTANTS.SQFT_PER_DAAM).toFixed(2))

  return { ropani, aana, paisa, daam }
}

export function teraiToSqFt(bigha: number, kattha: number, dhur: number, kanwa: number = 0): number {
  return (
    (bigha || 0) * LAND_CONSTANTS.SQFT_PER_BIGHA +
    (kattha || 0) * LAND_CONSTANTS.SQFT_PER_KATTHA +
    (dhur || 0) * LAND_CONSTANTS.SQFT_PER_DHUR +
    (kanwa || 0) * LAND_CONSTANTS.SQFT_PER_KANWA
  )
}

export function sqFtToTerai(sqFt: number): { bigha: number; kattha: number; dhur: number; kanwa: number } {
  let rem = Math.max(0, sqFt)
  const bigha = Math.floor(rem / LAND_CONSTANTS.SQFT_PER_BIGHA)
  rem %= LAND_CONSTANTS.SQFT_PER_BIGHA

  const kattha = Math.floor(rem / LAND_CONSTANTS.SQFT_PER_KATTHA)
  rem %= LAND_CONSTANTS.SQFT_PER_KATTHA

  const dhur = Math.floor(rem / LAND_CONSTANTS.SQFT_PER_DHUR)
  rem %= LAND_CONSTANTS.SQFT_PER_DHUR

  const kanwa = Number((rem / LAND_CONSTANTS.SQFT_PER_KANWA).toFixed(2))

  return { bigha, kattha, dhur, kanwa }
}

export const WEIGHT_CONSTANTS = {
  GRAMS_PER_TOLA: 11.6638,
  LAL_PER_TOLA: 100,
  GRAMS_PER_PAU: 200,
  PAU_PER_DHARNI: 12,
  GRAMS_PER_DHARNI: 2400,
  GRAMS_PER_SHER: 933.1,
}

export function tolaToGrams(tola: number, lal: number = 0): number {
  const totalTola = (tola || 0) + (lal || 0) / WEIGHT_CONSTANTS.LAL_PER_TOLA
  return totalTola * WEIGHT_CONSTANTS.GRAMS_PER_TOLA
}

export function gramsToTola(grams: number): { tola: number; lal: number } {
  const totalTola = Math.max(0, grams) / WEIGHT_CONSTANTS.GRAMS_PER_TOLA
  const tola = Math.floor(totalTola)
  const lal = Number(((totalTola - tola) * WEIGHT_CONSTANTS.LAL_PER_TOLA).toFixed(2))
  return { tola, lal }
}
