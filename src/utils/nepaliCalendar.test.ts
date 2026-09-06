import test from 'node:test'
import assert from 'node:assert/strict'
import { toDevanagariDigits, getNepaliDateBS, NEPALI_MONTHS } from './nepaliCalendar.ts'

test('toDevanagariDigits converts standard digits to Devanagari numerals', () => {
  assert.equal(toDevanagariDigits(0), '०')
  assert.equal(toDevanagariDigits(12345), '१२३४५')
  assert.equal(toDevanagariDigits(2083), '२०८३')
  assert.equal(toDevanagariDigits('Date: 2083/05/16'), 'Date: २०८३/०५/१६')
})

test('NEPALI_MONTHS contains all 12 Bikram Sambat months in order', () => {
  assert.equal(NEPALI_MONTHS.length, 12)
  assert.equal(NEPALI_MONTHS[0], 'बैशाख')
  assert.equal(NEPALI_MONTHS[4], 'भाद्र')
  assert.equal(NEPALI_MONTHS[11], 'चैत')
})

test('getNepaliDateBS converts known Gregorian date 2023-04-14 to 2080 Baishakh 1', () => {
  const date = new Date(2023, 3, 14) // April 14, 2023
  const result = getNepaliDateBS(date)

  assert.equal(result.bsYear, 2080)
  assert.equal(result.bsMonth, 1)
  assert.equal(result.bsDay, 1)
  assert.equal(result.monthName, 'बैशाख')
  assert.equal(result.formattedBS, '२०८० बैशाख १')
  assert.equal(result.formattedShort, 'बैशाख १')
})

test('getNepaliDateBS converts known Gregorian date 2024-04-13 to 2081 Baishakh 1', () => {
  const date = new Date(2024, 3, 13) // April 13, 2024
  const result = getNepaliDateBS(date)

  assert.equal(result.bsYear, 2081)
  assert.equal(result.bsMonth, 1)
  assert.equal(result.bsDay, 1)
  assert.equal(result.monthName, 'बैशाख')
  assert.equal(result.formattedBS, '२०८१ बैशाख १')
})

test('getNepaliDateBS accurately advances months and days in BS year 2080', () => {
  // Baishakh 2080 has 31 days. Day 32 from start is Jestha 1 (2023-05-15)
  const date = new Date(2023, 4, 15) // May 15, 2023
  const result = getNepaliDateBS(date)

  assert.equal(result.bsYear, 2080)
  assert.equal(result.bsMonth, 2)
  assert.equal(result.bsDay, 1)
  assert.equal(result.monthName, 'जेठ')
  assert.equal(result.formattedBS, '२०८० जेठ १')
})
