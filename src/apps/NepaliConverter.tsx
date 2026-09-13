import { useState, useMemo } from 'react'
import {
  Calendar as CalendarIcon, Scale, ArrowRightLeft, Coins,
  ChevronLeft, ChevronRight, RotateCcw, Info, Check, Copy
} from 'lucide-react'
import {
  getNepaliDateBS,
  convertBSToAD,
  getBSMonthCalendar,
  toDevanagariDigits,
  NEPALI_MONTHS,
  NEPALI_MONTHS_EN,
  NEPALI_DAYS_SHORT,
  NEPALI_DAYS_FULL,
  BS_CALENDAR_DATA,
  pahadToSqFt,
  sqFtToPahad,
  teraiToSqFt,
  sqFtToTerai,
  tolaToGrams,
  gramsToTola,
  LAND_CONSTANTS,
  WEIGHT_CONSTANTS,
} from '../utils/nepaliCalendar'

type ActiveTab = 'calendar' | 'converter' | 'land' | 'weight'

export default function NepaliConverter() {
  const [tab, setTab] = useState<ActiveTab>('calendar')
  const todayBS = useMemo(() => getNepaliDateBS(new Date()), [])
  const [selectedYear, setSelectedYear] = useState<number>(todayBS.bsYear)
  const [selectedMonth, setSelectedMonth] = useState<number>(todayBS.bsMonth)
  const [selectedDay, setSelectedDay] = useState<number>(todayBS.bsDay)
  const [copied, setCopied] = useState(false)

  const monthData = useMemo(() => {
    return getBSMonthCalendar(selectedYear, selectedMonth)
  }, [selectedYear, selectedMonth])

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      if (selectedYear > 2075) {
        setSelectedYear(y => y - 1)
        setSelectedMonth(12)
      }
    } else {
      setSelectedMonth(m => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      if (selectedYear < 2090) {
        setSelectedYear(y => y + 1)
        setSelectedMonth(1)
      }
    } else {
      setSelectedMonth(m => m + 1)
    }
  }

  const handleJumpToday = () => {
    setSelectedYear(todayBS.bsYear)
    setSelectedMonth(todayBS.bsMonth)
    setSelectedDay(todayBS.bsDay)
  }

  const selectedDateAD = useMemo(() => {
    return convertBSToAD(selectedYear, selectedMonth, selectedDay)
  }, [selectedYear, selectedMonth, selectedDay])

  const [convDirection, setConvDirection] = useState<'ad-to-bs' | 'bs-to-ad'>('ad-to-bs')
  const [inputAD, setInputAD] = useState(() => new Date().toISOString().split('T')[0])
  
  const [inputBSYear, setInputBSYear] = useState(todayBS.bsYear)
  const [inputBSMonth, setInputBSMonth] = useState(todayBS.bsMonth)
  const [inputBSDay, setInputBSDay] = useState(todayBS.bsDay)

  const convertedToBS = useMemo(() => {
    if (!inputAD) return null
    const [y, m, d] = inputAD.split('-').map(Number)
    return getNepaliDateBS(new Date(y, m - 1, d))
  }, [inputAD])

  const convertedToAD = useMemo(() => {
    const ad = convertBSToAD(inputBSYear, inputBSMonth, inputBSDay)
    if (!ad) return null
    return {
      date: ad,
      formatted: ad.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      iso: ad.toISOString().split('T')[0],
    }
  }, [inputBSYear, inputBSMonth, inputBSDay])

  const [totalSqFt, setTotalSqFt] = useState<number>(5476) 

  const pahadValues = useMemo(() => sqFtToPahad(totalSqFt), [totalSqFt])
  const teraiValues = useMemo(() => sqFtToTerai(totalSqFt), [totalSqFt])
  const sqMeters = (totalSqFt / LAND_CONSTANTS.SQFT_PER_SQMTR).toFixed(2)
  const acres = (totalSqFt / LAND_CONSTANTS.SQFT_PER_ACRE).toFixed(4)

  const handlePahadChange = (field: 'ropani' | 'aana' | 'paisa' | 'daam', val: number) => {
    const next = { ...pahadValues, [field]: Math.max(0, val) }
    setTotalSqFt(pahadToSqFt(next.ropani, next.aana, next.paisa, next.daam))
  }

  const handleTeraiChange = (field: 'bigha' | 'kattha' | 'dhur' | 'kanwa', val: number) => {
    const next = { ...teraiValues, [field]: Math.max(0, val) }
    setTotalSqFt(teraiToSqFt(next.bigha, next.kattha, next.dhur, next.kanwa))
  }


  const [totalGrams, setTotalGrams] = useState<number>(11.6638) 

  const tolaValues = useMemo(() => gramsToTola(totalGrams), [totalGrams])
  const totalPau = (totalGrams / WEIGHT_CONSTANTS.GRAMS_PER_PAU).toFixed(2)
  const totalDharni = (totalGrams / WEIGHT_CONSTANTS.GRAMS_PER_DHARNI).toFixed(3)
  const totalSher = (totalGrams / WEIGHT_CONSTANTS.GRAMS_PER_SHER).toFixed(3)
  const totalKg = (totalGrams / 1000).toFixed(4)

  const handleTolaChange = (field: 'tola' | 'lal', val: number) => {
    const next = { ...tolaValues, [field]: Math.max(0, val) }
    setTotalGrams(tolaToGrams(next.tola, next.lal))
  }

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="app-nepali-converter" style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)',
      fontSize: 13, userSelect: 'none', background: 'var(--color-bg-primary)',
    }}>
   
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: '1px solid var(--color-glass-border)',
        background: 'var(--color-glass-card)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #EF4444, #B91C1C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFFFFF', fontWeight: 700, fontSize: 13,
          }}>
            पा
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>नेपाली क्यालेन्डर र एकाइ रूपान्तरण</span>
              <span style={{ fontSize: 10, color: 'var(--color-sakura)', fontWeight: 600 }}>BS</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              Bikram Sambat Calendar & Traditional Unit Studio
            </div>
          </div>
        </div>

       
        <div style={{
          display: 'flex', gap: 4, background: 'rgba(0,0,0,0.15)',
          padding: 3, borderRadius: 8, border: '1px solid var(--color-border)',
        }}>
          {[
            { id: 'calendar', label: 'पात्रो (Calendar)', icon: CalendarIcon },
            { id: 'converter', label: 'मिति (Date)', icon: ArrowRightLeft },
            { id: 'land', label: 'जग्गा नाप (Land)', icon: Scale },
            { id: 'weight', label: 'तौल / सुन (Weight)', icon: Coins },
          ].map(t => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as ActiveTab)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 10px', borderRadius: 6, border: 'none',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  background: active ? 'var(--color-sakura)' : 'transparent',
                  color: active ? '#FFFFFF' : 'var(--color-text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={12} />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>

     
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {tab === 'calendar' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--color-glass-card)', padding: '10px 14px', borderRadius: 10,
              border: '1px solid var(--color-glass-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={handlePrevMonth}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 30, height: 30, borderRadius: 6, border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', cursor: 'pointer',
                  }}
                  title="अघिल्लो महिना"
                >
                  <ChevronLeft size={16} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                 
                  <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(Number(e.target.value))}
                    style={{
                      background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border)', borderRadius: 6, padding: '4px 8px',
                      fontSize: 13, fontWeight: 700, outline: 'none', cursor: 'pointer',
                    }}
                  >
                    {BS_CALENDAR_DATA.map(y => (
                      <option key={y.bsYear} value={y.bsYear}>
                        {toDevanagariDigits(y.bsYear)} ({y.bsYear})
                      </option>
                    ))}
                  </select>

                  
                  <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(Number(e.target.value))}
                    style={{
                      background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border)', borderRadius: 6, padding: '4px 8px',
                      fontSize: 13, fontWeight: 700, outline: 'none', cursor: 'pointer',
                    }}
                  >
                    {NEPALI_MONTHS.map((m, idx) => (
                      <option key={idx} value={idx + 1}>
                        {m} ({NEPALI_MONTHS_EN[idx]})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleNextMonth}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 30, height: 30, borderRadius: 6, border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', cursor: 'pointer',
                  }}
                  title="पछिल्लो महिना"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={handleJumpToday}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px',
                    borderRadius: 6, border: '1px solid var(--color-border)',
                    background: 'rgba(232,130,155,0.12)', color: 'var(--color-sakura)',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={11} />
                  <span>आज (Today)</span>
                </button>
              </div>
            </div>

            
            <div style={{
              background: 'var(--color-glass-card)', borderRadius: 12,
              border: '1px solid var(--color-glass-border)', padding: 14,
            }}>
              
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 6, textAlign: 'center', marginBottom: 8,
              }}>
                {NEPALI_DAYS_SHORT.map((day, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '6px 0', fontSize: 11, fontWeight: 700,
                      color: idx === 6 ? '#EF4444' : (idx === 0 ? '#FB923C' : 'var(--color-text-secondary)'),
                      background: 'rgba(255,255,255,0.03)', borderRadius: 6,
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 6,
              }}>
               
                {Array.from({ length: monthData.startingWeekday }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ height: 58, opacity: 0.15, borderRadius: 8, background: 'rgba(255,255,255,0.02)' }} />
                ))}

                
                {monthData.cells.map(cell => {
                  const isSelected = selectedDay === cell.day
                  const isSat = cell.weekday === 6
                  const isSun = cell.weekday === 0
                  return (
                    <div
                      key={cell.day}
                      onClick={() => setSelectedDay(cell.day)}
                      style={{
                        height: 58, padding: '5px 8px', borderRadius: 8, cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        border: isSelected
                          ? '1px solid var(--color-sakura)'
                          : (cell.isToday ? '1px solid var(--color-miku)' : '1px solid rgba(255,255,255,0.06)'),
                        background: isSelected
                          ? 'rgba(232,130,155,0.18)'
                          : (cell.isToday ? 'rgba(74,222,128,0.12)' : 'var(--color-bg-secondary)'),
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{
                          fontSize: 16, fontWeight: 700,
                          color: isSat ? '#EF4444' : (isSun ? '#FB923C' : 'var(--color-text-primary)'),
                        }}>
                          {cell.dayDevanagari}
                        </span>
                        <span style={{ fontSize: 9, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {cell.day}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 9, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          {cell.adDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        {cell.isToday && (
                          <span style={{ fontSize: 8, padding: '1px 4px', borderRadius: 4, background: 'var(--color-miku)', color: '#000', fontWeight: 700 }}>
                            आज
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

           
            {selectedDateAD && (
              <div style={{
                background: 'var(--color-glass-card)', borderRadius: 10, padding: 14,
                border: '1px solid var(--color-glass-border)', display: 'flex',
                alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
              }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-sakura)', fontWeight: 700, textTransform: 'uppercase' }}>
                    छानिएको मिति (Selected Date)
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 2 }}>
                    {toDevanagariDigits(selectedYear)} {monthData.monthName} {toDevanagariDigits(selectedDay)} गते, {NEPALI_DAYS_FULL[selectedDateAD.getDay()]}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                    Gregorian (AD): {selectedDateAD.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>

                <button
                  onClick={() => handleCopyText(`${toDevanagariDigits(selectedYear)} ${monthData.monthName} ${toDevanagariDigits(selectedDay)}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                    borderRadius: 6, border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {copied ? <Check size={12} style={{ color: '#4ADE80' }} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy BS Date'}</span>
                </button>
              </div>
            )}
          </div>
        )}


        {tab === 'converter' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setConvDirection('ad-to-bs')}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  background: convDirection === 'ad-to-bs' ? 'var(--color-sakura)' : 'var(--color-bg-secondary)',
                  color: convDirection === 'ad-to-bs' ? '#FFF' : 'var(--color-text-secondary)',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}
              >
                ईस्वी सन् (AD) ➔ विक्रम संवत् (BS)
              </button>
              <button
                onClick={() => setConvDirection('bs-to-ad')}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  background: convDirection === 'bs-to-ad' ? 'var(--color-sakura)' : 'var(--color-bg-secondary)',
                  color: convDirection === 'bs-to-ad' ? '#FFF' : 'var(--color-text-secondary)',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}
              >
                विक्रम संवत् (BS) ➔ ईस्वी सन् (AD)
              </button>
            </div>

            
            <div style={{
              background: 'var(--color-glass-card)', borderRadius: 12, padding: 18,
              border: '1px solid var(--color-glass-border)', display: 'flex', flexDirection: 'column', gap: 16,
            }}>
              {convDirection === 'ad-to-bs' ? (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
                    Select Gregorian Date (AD):
                  </label>
                  <input
                    type="date"
                    value={inputAD}
                    onChange={e => setInputAD(e.target.value)}
                    style={{
                      width: '100%', maxWidth: 300, background: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-primary)', border: '1px solid var(--color-border)',
                      borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none',
                    }}
                  />

                  {convertedToBS && (
                    <div style={{
                      marginTop: 20, padding: 16, borderRadius: 10,
                      background: 'rgba(232,130,155,0.08)', border: '1px solid rgba(232,130,155,0.25)',
                    }}>
                      <div style={{ fontSize: 11, color: 'var(--color-sakura)', fontWeight: 700 }}>
                        नेपाली मिति (Nepali Date):
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', marginTop: 4 }}>
                        {convertedToBS.formattedBS} गते
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 6 }}>
                        बार: <strong style={{ color: 'var(--color-text-primary)' }}>{convertedToBS.dayName}</strong> ({convertedToBS.dayNameEn})
                        {convertedToBS.seasonName && ` | ऋतु: ${convertedToBS.seasonName}`}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                        Transliteration: {convertedToBS.bsYear} {convertedToBS.monthNameEn} {convertedToBS.bsDay}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
                    Select Bikram Sambat Date (BS):
                  </label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 400 }}>
                    <select
                      value={inputBSYear}
                      onChange={e => setInputBSYear(Number(e.target.value))}
                      style={{
                        flex: 1, background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none',
                      }}
                    >
                      {BS_CALENDAR_DATA.map(y => (
                        <option key={y.bsYear} value={y.bsYear}>
                          {toDevanagariDigits(y.bsYear)} ({y.bsYear})
                        </option>
                      ))}
                    </select>

                    <select
                      value={inputBSMonth}
                      onChange={e => setInputBSMonth(Number(e.target.value))}
                      style={{
                        flex: 1.2, background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none',
                      }}
                    >
                      {NEPALI_MONTHS.map((m, idx) => (
                        <option key={idx} value={idx + 1}>
                          {m} ({NEPALI_MONTHS_EN[idx]})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min={1}
                      max={32}
                      value={inputBSDay}
                      onChange={e => setInputBSDay(Math.min(32, Math.max(1, Number(e.target.value))))}
                      style={{
                        width: 70, background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none',
                      }}
                    />
                  </div>

                  {convertedToAD && (
                    <div style={{
                      marginTop: 20, padding: 16, borderRadius: 10,
                      background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)',
                    }}>
                      <div style={{ fontSize: 11, color: '#4ADE80', fontWeight: 700 }}>
                        ईस्वी सन् मिति (Gregorian Date):
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)', marginTop: 4 }}>
                        {convertedToAD.formatted}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                        ISO Format: {convertedToAD.iso}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        
        {tab === 'land' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
           
            <div style={{
              background: 'linear-gradient(135deg, rgba(232,130,155,0.15), rgba(74,222,128,0.15))',
              borderRadius: 10, padding: '12px 16px', border: '1px solid var(--color-glass-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-sakura)' }}>
                  नेपाली जग्गा मापन रूपान्तरण (Synchronized Area)
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)', marginTop: 2 }}>
                  {totalSqFt.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 500 }}>वर्ग फिट (sq. ft)</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <div>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>वर्ग मिटर (sq. m)</span>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{sqMeters}</div>
                </div>
                <div>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>एकर (Acres)</span>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{acres}</div>
                </div>
              </div>
            </div>

            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              
              <div style={{
                background: 'var(--color-glass-card)', borderRadius: 12, padding: 16,
                border: '1px solid var(--color-glass-border)', display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)' }}>
                    पहाडी प्रणाली (Pahad / Kathmandu)
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>रोपनी - आना - पैसा - दाम</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                      रोपनी (Ropani)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={pahadValues.ropani}
                      onChange={e => handlePahadChange('ropani', Number(e.target.value))}
                      style={{
                        width: '100%', background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)', borderRadius: 6, padding: '6px 8px', fontSize: 13, outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                      आना (Aana - max 16)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={pahadValues.aana}
                      onChange={e => handlePahadChange('aana', Number(e.target.value))}
                      style={{
                        width: '100%', background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)', borderRadius: 6, padding: '6px 8px', fontSize: 13, outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                      पैसा (Paisa - max 4)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={pahadValues.paisa}
                      onChange={e => handlePahadChange('paisa', Number(e.target.value))}
                      style={{
                        width: '100%', background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)', borderRadius: 6, padding: '6px 8px', fontSize: 13, outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                      दाम (Daam - max 4)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={pahadValues.daam}
                      onChange={e => handlePahadChange('daam', Number(e.target.value))}
                      style={{
                        width: '100%', background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)', borderRadius: 6, padding: '6px 8px', fontSize: 13, outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: 11, color: 'var(--color-sakura)', fontWeight: 600, background: 'rgba(232,130,155,0.08)', padding: '6px 10px', borderRadius: 6 }}>
                  {pahadValues.ropani} रोपनी, {pahadValues.aana} आना, {pahadValues.paisa} पैसा, {pahadValues.daam} दाम
                </div>
              </div>

             
              <div style={{
                background: 'var(--color-glass-card)', borderRadius: 12, padding: 16,
                border: '1px solid var(--color-glass-border)', display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)' }}>
                    तराई प्रणाली (Terai Region)
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>बिघा - कट्ठा - धुर - कान्वा</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                      बिघा (Bigha)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={teraiValues.bigha}
                      onChange={e => handleTeraiChange('bigha', Number(e.target.value))}
                      style={{
                        width: '100%', background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)', borderRadius: 6, padding: '6px 8px', fontSize: 13, outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                      कट्ठा (Kattha - max 20)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={teraiValues.kattha}
                      onChange={e => handleTeraiChange('kattha', Number(e.target.value))}
                      style={{
                        width: '100%', background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)', borderRadius: 6, padding: '6px 8px', fontSize: 13, outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                      धुर (Dhur - max 20)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={teraiValues.dhur}
                      onChange={e => handleTeraiChange('dhur', Number(e.target.value))}
                      style={{
                        width: '100%', background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)', borderRadius: 6, padding: '6px 8px', fontSize: 13, outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                      कान्वा (Kanwa - max 16)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={teraiValues.kanwa}
                      onChange={e => handleTeraiChange('kanwa', Number(e.target.value))}
                      style={{
                        width: '100%', background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)', borderRadius: 6, padding: '6px 8px', fontSize: 13, outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: 11, color: '#4ADE80', fontWeight: 600, background: 'rgba(74,222,128,0.08)', padding: '6px 10px', borderRadius: 6 }}>
                  {teraiValues.bigha} बिघा, {teraiValues.kattha} कट्ठा, {teraiValues.dhur} धुर, {teraiValues.kanwa} कान्वा
                </div>
              </div>
            </div>

           
            <div style={{
              background: 'var(--color-bg-secondary)', borderRadius: 10, padding: '10px 14px',
              border: '1px solid var(--color-border)', fontSize: 11, color: 'var(--color-text-secondary)',
            }}>
              <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Info size={12} />
                <span>Reference Conversions:</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 6, marginTop: 6 }}>
                <div>• १ रोपनी = १६ आना = ६४ पैसा = २५६ दाम</div>
                <div>• १ रोपनी = ५,४७६ वर्ग फिट (५०८.७४ वर्ग मिटर)</div>
                <div>• १ बिघा = २० कट्ठा = ४०० धुर = ७२,९०० वर्ग फिट</div>
                <div>• १ बिघा = १३.३१ रोपनी | १ कट्ठा = १.६७ रोपनी</div>
              </div>
            </div>
          </div>
        )}

    
        {tab === 'weight' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{
              background: 'var(--color-glass-card)', borderRadius: 12, padding: 16,
              border: '1px solid var(--color-glass-border)', display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#FBBF24', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Coins size={14} />
                  <span>सुनचाँदी मापन (Gold & Silver Bullion)</span>
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>१ तोला = ११.६६३८ ग्राम</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                    तोला (Tola)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={tolaValues.tola}
                    onChange={e => handleTolaChange('tola', Number(e.target.value))}
                    style={{
                      width: '100%', background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border)', borderRadius: 6, padding: '6px 8px', fontSize: 13, outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                    लाल (Lal - max 100)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={tolaValues.lal}
                    onChange={e => handleTolaChange('lal', Number(e.target.value))}
                    style={{
                      width: '100%', background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border)', borderRadius: 6, padding: '6px 8px', fontSize: 13, outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                    ग्राम (Grams)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={Number(totalGrams.toFixed(3))}
                    onChange={e => setTotalGrams(Math.max(0, Number(e.target.value)))}
                    style={{
                      width: '100%', background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border)', borderRadius: 6, padding: '6px 8px', fontSize: 13, outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                    १० ग्राम एकाइ (10g Units)
                  </label>
                  <div style={{
                    background: 'var(--color-bg-secondary)', padding: '6px 8px', borderRadius: 6,
                    border: '1px solid var(--color-border)', fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)',
                  }}>
                    {(totalGrams / 10).toFixed(3)}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#FBBF24', fontWeight: 600, background: 'rgba(251,191,36,0.08)', padding: '8px 12px', borderRadius: 8 }}>
                कुल: {tolaValues.tola} तोला, {tolaValues.lal} लाल = {totalGrams.toFixed(3)} ग्राम ({totalKg} कि.ग्रा.)
              </div>
            </div>
            <div style={{
              background: 'var(--color-glass-card)', borderRadius: 12, padding: 16,
              border: '1px solid var(--color-glass-border)', display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)' }}>
                  परम्परागत खाद्यान्न तौल (Traditional Grain & Grocery)
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>धार्नी, पाउ, सेर</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                <div style={{ background: 'var(--color-bg-secondary)', padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>धार्नी (Dharni = 2.4kg)</span>
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{totalDharni}</div>
                </div>

                <div style={{ background: 'var(--color-bg-secondary)', padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>पाउ (Pau = 200g)</span>
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{totalPau}</div>
                </div>

                <div style={{ background: 'var(--color-bg-secondary)', padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>सेर (Sher = 933g)</span>
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{totalSher}</div>
                </div>

                <div style={{ background: 'var(--color-bg-secondary)', padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>किलोग्राम (Kg)</span>
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{totalKg} kg</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
