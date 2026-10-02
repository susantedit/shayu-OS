import { useState, useMemo, useCallback, useEffect } from 'react'
import { RotateCcw, HelpCircle, Users, Bot, Trophy, Info, Volume2, VolumeX } from 'lucide-react'
import './BaghChal.css'

type Piece = 'T' | 'G' | null // T = Tiger, G = Goat, null = Empty

// The 5x5 Bagh-Chal board coordinates: r in 0..4, c in 0..4
export type Coord = [number, number]

// Helper: check if a point is valid
export function isValidPoint(r: number, c: number): boolean {
  return r >= 0 && r < 5 && c >= 0 && c < 5
}

// In Bagh-Chal, diagonals exist only at points where (r + c) is even
export function hasDiagonal(r: number, c: number): boolean {
  return (r + c) % 2 === 0
}

// Get all directly connected neighbors for a coordinate
export function getNeighbors(r: number, c: number): Coord[] {
  const neighbors: Coord[] = []
  // Orthogonal neighbors
  const orth: Coord[] = [
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1],
  ]
  for (const [nr, nc] of orth) {
    if (isValidPoint(nr, nc)) neighbors.push([nr, nc])
  }

  // Diagonal neighbors (only if current point has diagonal lines)
  if (hasDiagonal(r, c)) {
    const diag: Coord[] = [
      [r - 1, c - 1],
      [r - 1, c + 1],
      [r + 1, c - 1],
      [r + 1, c + 1],
    ]
    for (const [nr, nc] of diag) {
      if (isValidPoint(nr, nc) && hasDiagonal(nr, nc)) {
        neighbors.push([nr, nc])
      }
    }
  }

  return neighbors
}

// Check if there is a straight-line jump move for a tiger
export interface TigerJump {
  target: Coord
  captured: Coord
}

export function getTigerJumps(board: Piece[][], r: number, c: number): TigerJump[] {
  const jumps: TigerJump[] = []
  const neighbors = getNeighbors(r, c)

  for (const [midR, midC] of neighbors) {
    // There must be a goat on the intermediate spot
    if (board[midR][midC] === 'G') {
      const dr = midR - r
      const dc = midC - c
      const destR = r + 2 * dr
      const destC = c + 2 * dc

      if (isValidPoint(destR, destC) && board[destR][destC] === null) {
        // If jumping diagonally, make sure diagonal path is valid
        if (dr !== 0 && dc !== 0) {
          if (hasDiagonal(r, c) && hasDiagonal(destR, destC)) {
            jumps.push({ target: [destR, destC], captured: [midR, midC] })
          }
        } else {
          jumps.push({ target: [destR, destC], captured: [midR, midC] })
        }
      }
    }
  }

  return jumps
}

// Sound synthesizer using Web Audio API
function playBoardSound(type: 'place' | 'move' | 'capture' | 'win') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    const now = ctx.currentTime
    if (type === 'place') {
      osc.frequency.setValueAtTime(320, now)
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.08)
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
      osc.start(now)
      osc.stop(now + 0.1)
    } else if (type === 'move') {
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(490, now + 0.06)
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
      osc.start(now)
      osc.stop(now + 0.08)
    } else if (type === 'capture') {
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(260, now)
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.18)
      gain.gain.setValueAtTime(0.18, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
      osc.start(now)
      osc.stop(now + 0.2)
    } else if (type === 'win') {
      const freqs = [523.25, 659.25, 783.99, 1046.5]
      freqs.forEach((f, i) => {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.connect(g)
        g.connect(ctx.destination)
        o.frequency.setValueAtTime(f, now + i * 0.08)
        g.gain.setValueAtTime(0.12, now + i * 0.08)
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3)
        o.start(now + i * 0.08)
        o.stop(now + i * 0.08 + 0.35)
      })
    }
  } catch {}
}

export default function BaghChal() {
  // Initialize board: 4 Tigers in corners
  const createInitialBoard = (): Piece[][] => {
    const b: Piece[][] = Array(5).fill(null).map(() => Array(5).fill(null))
    b[0][0] = 'T'
    b[0][4] = 'T'
    b[4][0] = 'T'
    b[4][4] = 'T'
    return b
  }

  const [board, setBoard] = useState<Piece[][]>(createInitialBoard)
  const [turn, setTurn] = useState<'G' | 'T'>('G')
  const [goatsToPlace, setGoatsToPlace] = useState<number>(20)
  const [capturedGoats, setCapturedGoats] = useState<number>(0)
  const [selectedPiece, setSelectedPiece] = useState<Coord | null>(null)
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>('pvp')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showRules, setShowRules] = useState(false)
  const [lastMove, setLastMove] = useState<{ from?: Coord; to: Coord } | null>(null)

  const triggerSound = useCallback((t: 'place' | 'move' | 'capture' | 'win') => {
    if (soundEnabled) playBoardSound(t)
  }, [soundEnabled])

  // Count trapped tigers
  const trappedTigersCount = useMemo(() => {
    let trapped = 0
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (board[r][c] === 'T') {
          const emptyNeighbors = getNeighbors(r, c).filter(([nr, nc]) => board[nr][nc] === null)
          const jumps = getTigerJumps(board, r, c)
          if (emptyNeighbors.length === 0 && jumps.length === 0) {
            trapped++
          }
        }
      }
    }
    return trapped
  }, [board])

  // Check victory condition
  const winner = useMemo(() => {
    if (capturedGoats >= 5) return 'T' // Tigers win
    if (trappedTigersCount === 4) return 'G' // Goats win
    return null
  }, [capturedGoats, trappedTigersCount])

  useEffect(() => {
    if (winner) triggerSound('win')
  }, [winner, triggerSound])

  // Valid destinations for selected piece
  const validDestinations = useMemo<Coord[]>(() => {
    if (!selectedPiece || winner) return []
    const [r, c] = selectedPiece
    const piece = board[r][c]

    if (piece === 'T') {
      const normalMoves = getNeighbors(r, c).filter(([nr, nc]) => board[nr][nc] === null)
      const jumps = getTigerJumps(board, r, c).map(j => j.target)
      return [...normalMoves, ...jumps]
    } else if (piece === 'G') {
      if (goatsToPlace > 0) return []
      return getNeighbors(r, c).filter(([nr, nc]) => board[nr][nc] === null)
    }

    return []
  }, [selectedPiece, board, goatsToPlace, winner])

  // Handle cell click
  const handleCellClick = (r: number, c: number) => {
    if (winner) return

    // Placement Phase: Goat player places goat on empty point
    if (turn === 'G' && goatsToPlace > 0) {
      if (board[r][c] === null) {
        const nextBoard = board.map(row => [...row])
        nextBoard[r][c] = 'G'
        setBoard(nextBoard)
        setGoatsToPlace(g => g - 1)
        setTurn('T')
        setLastMove({ to: [r, c] })
        triggerSound('place')
      }
      return
    }

    // Selecting piece of the active player
    const clickedPiece = board[r][c]
    if (clickedPiece === turn) {
      if (turn === 'G' && goatsToPlace > 0) return
      setSelectedPiece([r, c])
      return
    }

    // Moving selected piece to target coordinate
    if (selectedPiece) {
      const isDestinationValid = validDestinations.some(([vr, vc]) => vr === r && vc === c)
      if (isDestinationValid) {
        const [sr, sc] = selectedPiece
        const movingPiece = board[sr][sc]
        const nextBoard = board.map(row => [...row])
        nextBoard[sr][sc] = null
        nextBoard[r][c] = movingPiece

        let captured = false
        if (movingPiece === 'T') {
          const dr = r - sr
          const dc = c - sc
          if (Math.abs(dr) === 2 || Math.abs(dc) === 2) {
            const midR = sr + dr / 2
            const midC = sc + dc / 2
            if (nextBoard[midR][midC] === 'G') {
              nextBoard[midR][midC] = null
              setCapturedGoats(cg => cg + 1)
              captured = true
            }
          }
        }

        setBoard(nextBoard)
        setSelectedPiece(null)
        setLastMove({ from: [sr, sc], to: [r, c] })
        setTurn(turn === 'G' ? 'T' : 'G')

        if (captured) {
          triggerSound('capture')
        } else {
          triggerSound('move')
        }
      } else {
        setSelectedPiece(null)
      }
    }
  }

  // Simple Tiger AI for solo mode
  useEffect(() => {
    if (gameMode !== 'ai' || turn !== 'T' || winner) return

    const timer = setTimeout(() => {
      const tigerMoves: Array<{
        from: Coord
        to: Coord
        isJump: boolean
        mid?: Coord
      }> = []

      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (board[r][c] === 'T') {
            const jumps = getTigerJumps(board, r, c)
            for (const j of jumps) {
              tigerMoves.push({ from: [r, c], to: j.target, isJump: true, mid: j.captured })
            }
            const normal = getNeighbors(r, c).filter(([nr, nc]) => board[nr][nc] === null)
            for (const n of normal) {
              tigerMoves.push({ from: [r, c], to: n, isJump: false })
            }
          }
        }
      }

      if (tigerMoves.length === 0) return

      const jumps = tigerMoves.filter(m => m.isJump)
      const chosenMove = jumps.length > 0
        ? jumps[Math.floor(Math.random() * jumps.length)]
        : tigerMoves[Math.floor(Math.random() * tigerMoves.length)]

      const nextBoard = board.map(row => [...row])
      const [fr, fc] = chosenMove.from
      const [tr, tc] = chosenMove.to
      nextBoard[fr][fc] = null
      nextBoard[tr][tc] = 'T'

      if (chosenMove.isJump && chosenMove.mid) {
        const [mr, mc] = chosenMove.mid
        nextBoard[mr][mc] = null
        setCapturedGoats(cg => cg + 1)
        triggerSound('capture')
      } else {
        triggerSound('move')
      }

      setBoard(nextBoard)
      setLastMove({ from: [fr, fc], to: [tr, tc] })
      setTurn('G')
    }, 450)

    return () => clearTimeout(timer)
  }, [gameMode, turn, board, winner, triggerSound])

  const restartGame = () => {
    setBoard(createInitialBoard())
    setTurn('G')
    setGoatsToPlace(20)
    setCapturedGoats(0)
    setSelectedPiece(null)
    setLastMove(null)
    triggerSound('place')
  }

  const PADDING = 40
  const STEP = 80
  const getPixelCoord = (r: number, c: number) => ({
    x: PADDING + c * STEP,
    y: PADDING + r * STEP,
  })

  return (
    <div className="baghchal-container">
      {/* App Top Toolbar */}
      <div className="baghchal-toolbar">
        <div className="baghchal-title-group">
          <div className="baghchal-badge font-syau">बाघचाल</div>
          <div className="baghchal-sub">Bagh-Chal • Traditional Nepalese Strategy Board Game</div>
        </div>

        <div className="baghchal-actions">
          {/* Mode Switcher */}
          <div className="baghchal-mode-pill">
            <button
              onClick={() => { setGameMode('pvp'); restartGame() }}
              className={`baghchal-mode-btn ${gameMode === 'pvp' ? 'active' : ''}`}
              title="Two Players (Pass and Play)"
            >
              <Users size={14} />
              <span>Pass & Play</span>
            </button>
            <button
              onClick={() => { setGameMode('ai'); restartGame() }}
              className={`baghchal-mode-btn ${gameMode === 'ai' ? 'active' : ''}`}
              title="Play as Goats against Tiger Bot"
            >
              <Bot size={14} />
              <span>Vs Computer</span>
            </button>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="baghchal-icon-btn"
            title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            onClick={() => setShowRules(true)}
            className="baghchal-icon-btn"
            title="How to Play"
          >
            <HelpCircle size={16} />
          </button>

          <button
            onClick={restartGame}
            className="baghchal-btn baghchal-btn-secondary"
            title="Restart Game"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="baghchal-stage">
        {/* Left Side: Score & Status Panel */}
        <div className="baghchal-side-panel">
          {/* Status Alert Banner */}
          <div className={`baghchal-status-banner ${winner ? 'winner-banner' : ''}`}>
            {winner === 'T' && (
              <div className="baghchal-banner-content">
                <Trophy size={18} className="text-tiger" />
                <div>
                  <strong>बाघ विजयी (Tigers Win)</strong>
                  <p>Tigers captured 5 goats.</p>
                </div>
              </div>
            )}
            {winner === 'G' && (
              <div className="baghchal-banner-content">
                <Trophy size={18} className="text-goat" />
                <div>
                  <strong>बाख्रा विजयी (Goats Win)</strong>
                  <p>All 4 tigers are completely trapped.</p>
                </div>
              </div>
            )}
            {!winner && (
              <div className="baghchal-banner-content">
                {turn === 'G' ? (
                  <>
                    <div className="turn-indicator-dot goat-dot" />
                    <div>
                      <strong>बाख्राको पालो (Goats Turn)</strong>
                      <p>
                        {goatsToPlace > 0
                          ? `Place goat on an empty intersection (${goatsToPlace} remaining)`
                          : 'Move a goat to an adjacent intersection'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="turn-indicator-dot tiger-dot" />
                    <div>
                      <strong>बाघको पालो (Tigers Turn)</strong>
                      <p>Move tiger or jump over a goat to capture</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="baghchal-stats-grid">
            {/* Goats Card */}
            <div className="baghchal-stat-card goat-card">
              <div className="stat-card-header">
                <div className="piece-icon-circle goat-circle">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="7" />
                    <path d="M12 9v6M9 12h6" />
                  </svg>
                </div>
                <div>
                  <div className="stat-title">बाख्रा (Goats)</div>
                  <div className="stat-sub">Defense & Trap</div>
                </div>
              </div>

              <div className="stat-row">
                <span>To Place:</span>
                <strong>{goatsToPlace} / 20</strong>
              </div>
              <div className="stat-row">
                <span>On Board:</span>
                <strong>{20 - goatsToPlace - capturedGoats}</strong>
              </div>
              <div className="stat-row">
                <span>Captured:</span>
                <strong className={capturedGoats >= 4 ? 'danger-text' : ''}>
                  {capturedGoats} / 5 (Loss at 5)
                </strong>
              </div>
            </div>

            {/* Tigers Card */}
            <div className="baghchal-stat-card tiger-card">
              <div className="stat-card-header">
                <div className="piece-icon-circle tiger-circle">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="4" width="16" height="16" rx="4" />
                    <circle cx="9" cy="9" r="1.5" fill="currentColor" />
                    <circle cx="15" cy="9" r="1.5" fill="currentColor" />
                    <path d="M9 16c1.5 1 4.5 1 6 0" />
                  </svg>
                </div>
                <div>
                  <div className="stat-title">बाघ (Tigers)</div>
                  <div className="stat-sub">Hunters & Jumpers</div>
                </div>
              </div>

              <div className="stat-row">
                <span>Total Tigers:</span>
                <strong>4</strong>
              </div>
              <div className="stat-row">
                <span>Trapped:</span>
                <strong className={trappedTigersCount >= 3 ? 'danger-text' : ''}>
                  {trappedTigersCount} / 4 (Trap 4 to Win)
                </strong>
              </div>
              <div className="stat-row">
                <span>Kills:</span>
                <strong>{capturedGoats}</strong>
              </div>
            </div>
          </div>

          {/* Quick Cultural Fact */}
          <div className="baghchal-lore-box">
            <Info size={14} className="lore-icon" />
            <p>
              Bagh-Chal is Nepal&apos;s ancient national game. It requires careful geometry: goats must coordinate in clusters to hem in tigers, while tigers look for alignment gaps to jump and hunt.
            </p>
          </div>
        </div>

        {/* Center: The Board */}
        <div className="baghchal-board-wrapper">
          <svg
            viewBox="0 0 400 400"
            className="baghchal-svg-board"
          >
            <defs>
              <filter id="piece-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="rgba(0,0,0,0.4)" />
              </filter>
            </defs>

            {/* Board Background */}
            <rect x="10" y="10" width="380" height="380" rx="16" className="board-mat" />
            <rect x="36" y="36" width="328" height="328" rx="8" className="board-border" />

            {/* 1. Grid Lines (Horizontal & Vertical) */}
            {Array.from({ length: 5 }).map((_, i) => (
              <g key={`lines-${i}`}>
                {/* Horizontal line */}
                <line
                  x1={PADDING}
                  y1={PADDING + i * STEP}
                  x2={PADDING + 4 * STEP}
                  y2={PADDING + i * STEP}
                  className="board-line"
                />
                {/* Vertical line */}
                <line
                  x1={PADDING + i * STEP}
                  y1={PADDING}
                  x2={PADDING + i * STEP}
                  y2={PADDING + 4 * STEP}
                  className="board-line"
                />
              </g>
            ))}

            {/* 2. Traditional Diagonal Lines */}
            <line x1={PADDING} y1={PADDING} x2={PADDING + 4 * STEP} y2={PADDING + 4 * STEP} className="board-line" />
            <line x1={PADDING + 4 * STEP} y1={PADDING} x2={PADDING} y2={PADDING + 4 * STEP} className="board-line" />

            {/* Diamond connecting middle of outer edges */}
            <polygon
              points={`
                ${PADDING + 2 * STEP},${PADDING}
                ${PADDING + 4 * STEP},${PADDING + 2 * STEP}
                ${PADDING + 2 * STEP},${PADDING + 4 * STEP}
                ${PADDING},${PADDING + 2 * STEP}
              `}
              className="board-diamond"
            />

            {/* Corner to mid-diamonds */}
            <line x1={PADDING} y1={PADDING + 2 * STEP} x2={PADDING + 2 * STEP} y2={PADDING} className="board-line" />
            <line x1={PADDING + 2 * STEP} y1={PADDING} x2={PADDING + 4 * STEP} y2={PADDING + 2 * STEP} className="board-line" />
            <line x1={PADDING + 4 * STEP} y1={PADDING + 2 * STEP} x2={PADDING + 2 * STEP} y2={PADDING + 4 * STEP} className="board-line" />
            <line x1={PADDING + 2 * STEP} y1={PADDING + 4 * STEP} x2={PADDING} y2={PADDING + 2 * STEP} className="board-line" />

            {/* 3. Intersection Points & Valid Destination Highlights */}
            {Array.from({ length: 5 }).map((_, r) =>
              Array.from({ length: 5 }).map((_, c) => {
                const { x, y } = getPixelCoord(r, c)
                const isValidDest = validDestinations.some(([vr, vc]) => vr === r && vc === c)
                const isSelected = selectedPiece && selectedPiece[0] === r && selectedPiece[1] === c
                const isLastMoveTarget = lastMove && lastMove.to[0] === r && lastMove.to[1] === c

                return (
                  <g key={`pt-${r}-${c}`}>
                    <circle cx={x} cy={y} r="3.5" className="board-dot" />

                    {isValidDest && (
                      <circle
                        cx={x}
                        cy={y}
                        r="18"
                        className="dest-indicator-ring animate-pulse"
                      />
                    )}

                    {isLastMoveTarget && (
                      <circle
                        cx={x}
                        cy={y}
                        r="17"
                        className="last-move-ring"
                      />
                    )}

                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r="19"
                        className="selected-piece-ring"
                      />
                    )}
                  </g>
                )
              })
            )}

            {/* 4. Board Pieces (Tigers & Goats) */}
            {Array.from({ length: 5 }).map((_, r) =>
              Array.from({ length: 5 }).map((_, c) => {
                const piece = board[r][c]
                const { x, y } = getPixelCoord(r, c)
                const isSelected = selectedPiece && selectedPiece[0] === r && selectedPiece[1] === c

                return (
                  <g
                    key={`piece-${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle cx={x} cy={y} r="22" fill="transparent" />

                    {/* Tiger Piece */}
                    {piece === 'T' && (
                      <g
                        transform={`translate(${x - 17}, ${y - 17})`}
                        filter="url(#piece-shadow)"
                        className={`tiger-token ${isSelected ? 'is-selected' : ''}`}
                      >
                        <circle cx="17" cy="17" r="16" className="tiger-disc" />
                        <path
                          d="M10 11a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v5a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6v-5z"
                          fill="white"
                          opacity="0.9"
                          transform="translate(-2, -1) scale(1.1)"
                        />
                        <polygon points="12,12 15,17 9,17" fill="#C2410C" />
                        <polygon points="22,12 25,17 19,17" fill="#C2410C" />
                        <circle cx="13" cy="16" r="1.5" fill="#18181B" />
                        <circle cx="21" cy="16" r="1.5" fill="#18181B" />
                        <ellipse cx="17" cy="21" rx="2.5" ry="1.8" fill="#18181B" />
                      </g>
                    )}

                    {/* Goat Piece */}
                    {piece === 'G' && (
                      <g
                        transform={`translate(${x - 15}, ${y - 15})`}
                        filter="url(#piece-shadow)"
                        className={`goat-token ${isSelected ? 'is-selected' : ''}`}
                      >
                        <circle cx="15" cy="15" r="14" className="goat-disc" />
                        <circle cx="15" cy="15" r="7" fill="white" opacity="0.95" />
                        <path d="M11 11l-3-4M19 11l3-4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="13" cy="14" r="1.2" fill="#0369A1" />
                        <circle cx="17" cy="14" r="1.2" fill="#0369A1" />
                        <ellipse cx="15" cy="17" rx="1.5" ry="1" fill="#0369A1" />
                      </g>
                    )}
                  </g>
                )
              })
            )}
          </svg>
        </div>
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div className="baghchal-modal-overlay" onClick={() => setShowRules(false)}>
          <div className="baghchal-modal" onClick={e => e.stopPropagation()}>
            <div className="baghchal-modal-header">
              <div className="modal-title font-syau">बाघचालका नियमहरू (Bagh-Chal Rules)</div>
              <button onClick={() => setShowRules(false)} className="baghchal-icon-btn">
                ✕
              </button>
            </div>
            <div className="baghchal-modal-body">
              <p>
                <strong>Bagh-Chal (बाघचाल)</strong> is the ancient, strategic two-player board game of Nepal played on a 5x5 grid with diagonal paths.
              </p>

              <h4>1. The Pieces</h4>
              <ul>
                <li><strong>4 Tigers (बाघ):</strong> Start at the four corners of the board.</li>
                <li><strong>20 Goats (बाख्रा):</strong> Enter the board one by one on the Goat player&apos;s turns.</li>
              </ul>

              <h4>2. Phase 1: Placement (पसारण)</h4>
              <ul>
                <li>Goats start first. On each turn, the Goat player places 1 goat on any empty intersection.</li>
                <li>Goats cannot move until all 20 goats have been placed.</li>
                <li>Tigers can move to any connected empty adjacent intersection, OR jump over an adjacent goat into an empty space directly beyond it to <strong>capture</strong> and remove that goat.</li>
              </ul>

              <h4>3. Phase 2: Movement (चाल)</h4>
              <ul>
                <li>Once all 20 goats are on the board, goats can move along lines to adjacent empty spaces.</li>
                <li>Tigers continue to move or jump-capture.</li>
              </ul>

              <h4>4. Winning Conditions</h4>
              <ul>
                <li><strong>Tigers Win:</strong> If they capture 5 goats.</li>
                <li><strong>Goats Win:</strong> If they successfully surround and block all 4 tigers so none can make any legal move.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
