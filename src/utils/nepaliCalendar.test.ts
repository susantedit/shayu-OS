import test from 'node:test'
import assert from 'node:assert/strict'
import {
  toDevanagariDigits,
  fromDevanagariDigits,
  getNepaliDateBS,
  convertBSToAD,
  getBSMonthCalendar,
  pahadToSqFt,
  sqFtToPahad,
  teraiToSqFt,
  sqFtToTerai,
  tolaToGrams,
  gramsToTola,
  NEPALI_MONTHS
} from './nepaliCalendar.ts'

test('toDevanagariDigits converts standard digits to Devanagari numerals', () => {
  assert.equal(toDevanagariDigits(0), '०')
  assert.equal(toDevanagariDigits(12345), '१२३४५')
  assert.equal(toDevanagariDigits(2083), '२०८३')
  assert.equal(toDevanagariDigits('Date: 2083/05/16'), 'Date: २०८३/०५/१६')
})

test('fromDevanagariDigits converts Devanagari numerals to Arabic digits', () => {
  assert.equal(fromDevanagariDigits('२०८३'), '2083')
  assert.equal(fromDevanagariDigits('१२३४५'), '12345')
})

test('NEPALI_MONTHS contains all 12 Bikram Sambat months in order', () => {
  assert.equal(NEPALI_MONTHS.length, 12)
  assert.equal(NEPALI_MONTHS[0], 'बैशाख')
  assert.equal(NEPALI_MONTHS[4], 'भाद्र')
  assert.equal(NEPALI_MONTHS[11], 'चैत')
})

test('getNepaliDateBS converts known Gregorian date 2023-04-14 to 2080 Baishakh 1', () => {
  const date = new Date(2023, 3, 14)
  const result = getNepaliDateBS(date)

  assert.equal(result.bsYear, 2080)
  assert.equal(result.bsMonth, 1)
  assert.equal(result.bsDay, 1)
  assert.equal(result.monthName, 'बैशाख')
  assert.equal(result.formattedBS, '२०८० बैशाख १')
  assert.equal(result.formattedShort, 'बैशाख १')
})

test('convertBSToAD converts 2080 Baishakh 1 back to 2023-04-14', () => {
  const ad = convertBSToAD(2080, 1, 1)
  assert.ok(ad)
  assert.equal(ad.getFullYear(), 2023)
  assert.equal(ad.getMonth(), 3)
  assert.equal(ad.getDate(), 14)
})

test('getBSMonthCalendar generates month matrix with correct day counts', () => {
  const cal = getBSMonthCalendar(2080, 1)
  assert.equal(cal.totalDays, 31)
  assert.equal(cal.cells.length, 31)
  assert.equal(cal.monthName, 'बैशाख')
  assert.equal(cal.yearDevanagari, '२०८०')
})

test('Traditional Nepali Land Measurement conversions', () => {
  const sqFt = pahadToSqFt(1, 0, 0, 0)
  assert.equal(sqFt, 5476)

  const pahad = sqFtToPahad(5476)
  assert.equal(pahad.ropani, 1)
  assert.equal(pahad.aana, 0)
  assert.equal(pahad.paisa, 0)
  assert.equal(pahad.daam, 0)

  const bighaSqFt = teraiToSqFt(1, 0, 0, 0)
  assert.equal(bighaSqFt, 72900)

  const terai = sqFtToTerai(72900)
  assert.equal(terai.bigha, 1)
  assert.equal(terai.kattha, 0)
  assert.equal(terai.dhur, 0)
})

test('Traditional Nepali Gold & Weight conversions', () => {
  const grams = tolaToGrams(1, 0)
  assert.ok(Math.abs(grams - 11.6638) < 0.001)

  const tolaResult = gramsToTola(11.6638)
  assert.equal(tolaResult.tola, 1)
  assert.ok(Math.abs(tolaResult.lal) < 0.05)
})
