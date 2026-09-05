import { useState, useEffect } from 'react'

export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [prev, setPrev] = useState<number | null>(null)
  const [operator, setOperator] = useState<string | null>(null)
  const [startNewNumber, setStartNewNumber] = useState(true)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') inputDigit(e.key)
      else if (e.key === '.') inputDigit('.')
      else if (e.key === '+') applyOperator('+')
      else if (e.key === '-') applyOperator('-')
      else if (e.key === '*') applyOperator('*')
      else if (e.key === '/') { e.preventDefault(); applyOperator('/') }
      else if (e.key === 'Enter' || e.key === '=') evaluate()
      else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') resetCalculator()
      else if (e.key === '%') percent()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [display, prev, operator, startNewNumber])

  const inputDigit = (digit: string) => {
    if (startNewNumber) {
      setDisplay(digit === '.' ? '0.' : digit)
      setStartNewNumber(false)
    } else {
      if (digit === '.' && display.includes('.')) return
      setDisplay(display + digit)
    }
  }

  const compute = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b
      case '-': return a - b
      case '*': return a * b
      case '/': return b === 0 ? 0 : a / b
      default: return b
    }
  }

  const applyOperator = (nextOp: string) => {
    const current = parseFloat(display)
    if (prev !== null && operator && !startNewNumber) {
      const result = compute(prev, current, operator)
      setDisplay(String(result))
      setPrev(result)
    } else {
      setPrev(current)
    }
    setOperator(nextOp)
    setStartNewNumber(true)
  }

  const evaluate = () => {
    if (prev === null || !operator) return
    const current = parseFloat(display)
    const result = compute(prev, current, operator)
    setDisplay(String(result))
    setPrev(null)
    setOperator(null)
    setStartNewNumber(true)
  }

  const resetCalculator = () => {
    setDisplay('0')
    setPrev(null)
    setOperator(null)
    setStartNewNumber(true)
  }

  const percent = () => {
    setDisplay(String(parseFloat(display) / 100))
  }

  const toggleSign = () => {
    setDisplay(String(-parseFloat(display)))
  }

  const buttons = [
    { label: 'AC', action: resetCalculator, className: '' },
    { label: '+/-', action: toggleSign, className: '' },
    { label: '%', action: percent, className: '' },
    { label: '/', action: () => applyOperator('/'), className: 'op' },
    { label: '7', action: () => inputDigit('7'), className: '' },
    { label: '8', action: () => inputDigit('8'), className: '' },
    { label: '9', action: () => inputDigit('9'), className: '' },
    { label: '*', action: () => applyOperator('*'), className: 'op' },
    { label: '4', action: () => inputDigit('4'), className: '' },
    { label: '5', action: () => inputDigit('5'), className: '' },
    { label: '6', action: () => inputDigit('6'), className: '' },
    { label: '-', action: () => applyOperator('-'), className: 'op' },
    { label: '1', action: () => inputDigit('1'), className: '' },
    { label: '2', action: () => inputDigit('2'), className: '' },
    { label: '3', action: () => inputDigit('3'), className: '' },
    { label: '+', action: () => applyOperator('+'), className: 'op' },
    { label: '0', action: () => inputDigit('0'), className: '' },
    { label: '.', action: () => inputDigit('.'), className: '' },
    { label: '=', action: evaluate, className: 'equals' },
  ]

  return (
    <div className="app-calc">
      <div className="app-calc-display">
        {display.length > 12 ? parseFloat(display).toExponential(6) : display}
      </div>
      <div className="app-calc-grid">
        {buttons.map((btn, i) => (
          <button
            key={i}
            className={`app-calc-btn ${btn.className}`}
            onClick={btn.action}
          >
            {btn.label === '*' ? '×' : btn.label === '/' ? '÷' : btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}
