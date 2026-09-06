/**
 * Nepali Bikram Sambat (BS) Calendar Utility
 * 
 * Provides dynamic conversion from Gregorian (AD) dates to Nepali Bikram Sambat (BS),
 * formatting with native Devanagari typography.
 * Created for स्याउOS (SyauOS).
 */

export const NEPALI_MONTHS = [
  'बैशाख', // Baishakh (1)
  'जेठ',   // Jestha (2)
  'असार',  // Ashadh (3)
  'साउन',  // Shrawan (4)
  'भाद्र',  // Bhadra (5)
  'असोज',  // Ashwin (6)
  'कार्तिक',// Kartik (7)
  'मंसिर',  // Mangsir (8)
  'पौष',   // Poush (9)
  'माघ',   // Magh (10)
  'फागुन',  // Falgun (11)
  'चैत',   // Chaitra (12)
] as const

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']

/**
 * Converts any standard Arabic numeral to Devanagari numerals (०-९).
 */
export function toDevanagariDigits(num: number | string): string {
  return String(num).replace(/[0-9]/g, digit => DEVANAGARI_DIGITS[parseInt(digit, 10)])
}

/**
 * Days in Nepali months for reference years 2080-2086 BS.
 * Each entry maps a BS year to an array of 12 numbers representing days in each month.
 */
interface BSYearData {
  bsYear: number
  adStart: { year: number; month: number; day: number } // Corresponds to Baishakh 1
  daysInMonth: number[]
}

const BS_CALENDAR_DATA: BSYearData[] = [
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
]

export interface NepaliDateResult {
  bsYear: number
  bsMonth: number // 1 to 12
  bsDay: number   // 1 to 32
  monthName: string
  formattedBS: string      // e.g. "२०८३ भाद्र २०"
  formattedShort: string   // e.g. "भाद्र २०"
}

/**
 * Converts a Gregorian Date into a Nepali Bikram Sambat Date.
 */
export function getNepaliDateBS(adDate: Date = new Date()): NepaliDateResult {
  const targetTime = new Date(adDate.getFullYear(), adDate.getMonth(), adDate.getDate()).getTime()

  // Find the appropriate BS calendar year
  for (let i = 0; i < BS_CALENDAR_DATA.length; i++) {
    const yearData = BS_CALENDAR_DATA[i]
    const yearStartDate = new Date(yearData.adStart.year, yearData.adStart.month - 1, yearData.adStart.day).getTime()

    // Next year start or end of current
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
      const yearDevanagari = toDevanagariDigits(yearData.bsYear)
      const dayDevanagari = toDevanagariDigits(bsDay)

      return {
        bsYear: yearData.bsYear,
        bsMonth,
        bsDay,
        monthName,
        formattedBS: `${yearDevanagari} ${monthName} ${dayDevanagari}`,
        formattedShort: `${monthName} ${dayDevanagari}`,
      }
    }
  }

  // Fallback approximate conversion for dates outside the lookup range
  const approxYear = adDate.getFullYear() + 57
  const monthIdx = (adDate.getMonth() + 8) % 12
  const approxDay = adDate.getDate()
  const monthName = NEPALI_MONTHS[monthIdx]
  return {
    bsYear: approxYear,
    bsMonth: monthIdx + 1,
    bsDay: approxDay,
    monthName,
    formattedBS: `${toDevanagariDigits(approxYear)} ${monthName} ${toDevanagariDigits(approxDay)}`,
    formattedShort: `${monthName} ${toDevanagariDigits(approxDay)}`,
  }
}
