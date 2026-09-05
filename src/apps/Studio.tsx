import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Play,
  RotateCcw,
  Download,
  Sparkles,
  Smartphone,
  Monitor,
  Code2,
  FileCode2,
  Palette,
  Terminal,
  Trash2,
  SplitSquareVertical,
  Maximize2,
  Zap
} from 'lucide-react'

interface ProjectTemplate {
  id: string
  name: string
  desc: string
  html: string
  css: string
  js: string
}

const TEMPLATES: ProjectTemplate[] = [
  {
    id: 'neon-particles',
    name: 'Neon Galaxy Particles',
    desc: 'Interactive glowing particle system with physics and mouse gravity',
    html: `<div class="container">
  <h1>स्याउ Particle Engine</h1>
  <p>Move your mouse or touch to attract cosmic stardust!</p>
  <canvas id="canvas"></canvas>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #090a10;
  color: #fff;
  font-family: -apple-system, system-ui, sans-serif;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.container {
  position: absolute;
  top: 24px;
  text-align: center;
  z-index: 10;
  pointer-events: none;
}
h1 {
  font-size: 26px;
  background: linear-gradient(135deg, #E8829B, #7EDDD6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 6px;
}
p {
  color: rgba(255,255,255,0.6);
  font-size: 13px;
}
canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, #141729 0%, #06070a 100%);
}`,
    js: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let W = canvas.width = window.innerWidth;
let H = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
});

const mouse = { x: W / 2, y: H / 2, down: false };
window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('touchmove', (e) => { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; });

const colors = ['#E8829B', '#7EDDD6', '#FBBF24', '#8B5CF6', '#34D399'];
const particles = [];

for (let i = 0; i < 120; i++) {
  particles.push({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    radius: Math.random() * 2.5 + 1.2,
    color: colors[Math.floor(Math.random() * colors.length)]
  });
}

function loop() {
  ctx.fillStyle = 'rgba(6, 7, 10, 0.2)';
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => {
    const dx = mouse.x - p.x;
    const dy = mouse.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 220) {
      p.vx += (dx / dist) * 0.2;
      p.vy += (dy / dist) * 0.2;
    }

    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.98;
    p.vy *= 0.98;

    if (p.x < 0) p.x = W;
    if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H;
    if (p.y > H) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = p.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  requestAnimationFrame(loop);
}

console.log('स्याउ Particle Engine Initialized!');
loop();`
  },
  {
    id: 'cyber-pong',
    name: 'Cyber Pong Retro Arcade',
    desc: 'Classic paddle game with dynamic score tracking and retro neon graphics',
    html: `<div class="game-box">
  <div class="score-board">
    <span>PLAYER: <strong id="pScore">0</strong></span>
    <span>CPU: <strong id="cScore">0</strong></span>
  </div>
  <canvas id="pong"></canvas>
  <div class="hint">Use Mouse / Touch Up-Down to Move Paddle</div>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #0b0d14;
  color: #fff;
  font-family: monospace;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  overflow: hidden;
}
.game-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.score-board {
  display: flex;
  gap: 40px;
  font-size: 16px;
  letter-spacing: 2px;
  color: #7EDDD6;
}
canvas {
  background: #111422;
  border: 2px solid rgba(232,130,155,0.4);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.7), 0 0 20px rgba(232,130,155,0.2);
}
.hint {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
}`,
    js: `const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');
canvas.width = 480;
canvas.height = 300;

let pScore = 0, cScore = 0;
const pElem = document.getElementById('pScore');
const cElem = document.getElementById('cScore');

const paddleH = 60, paddleW = 10;
let playerY = canvas.height / 2 - paddleH / 2;
let cpuY = canvas.height / 2 - paddleH / 2;

let ball = { x: 240, y: 150, vx: 4, vy: 3, r: 6 };

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  playerY = e.clientY - rect.top - paddleH / 2;
});

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.vx = (Math.random() > 0.5 ? 4 : -4);
  ball.vy = (Math.random() - 0.5) * 6;
}

function update() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y < ball.r || ball.y > canvas.height - ball.r) ball.vy *= -1;

  // CPU AI
  cpuY += (ball.y - (cpuY + paddleH / 2)) * 0.08;

  // Player collision
  if (ball.x - ball.r < 20 && ball.y > playerY && ball.y < playerY + paddleH) {
    ball.vx = Math.abs(ball.vx) + 0.3;
    ball.vy += (ball.y - (playerY + paddleH / 2)) * 0.15;
  }

  // CPU collision
  if (ball.x + ball.r > canvas.width - 20 && ball.y > cpuY && ball.y < cpuY + paddleH) {
    ball.vx = -Math.abs(ball.vx) - 0.3;
  }

  // Scores
  if (ball.x < 0) {
    cScore++;
    cElem.innerText = cScore;
    resetBall();
  }
  if (ball.x > canvas.width) {
    pScore++;
    pElem.innerText = pScore;
    resetBall();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Net
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Player Paddle
  ctx.fillStyle = '#E8829B';
  ctx.fillRect(10, playerY, paddleW, paddleH);

  // CPU Paddle
  ctx.fillStyle = '#7EDDD6';
  ctx.fillRect(canvas.width - 20, cpuY, paddleW, paddleH);

  // Ball
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

console.log('Cyber Pong Ready!');
gameLoop();`
  },
  {
    id: 'glass-card',
    name: '3D Holographic Card',
    desc: 'Ultra-luxurious Apple glassmorphism card with mouse tilt dynamics',
    html: `<div class="card-wrap">
  <div class="card" id="card">
    <div class="badge">SYAU OS 2026</div>
    <h2>स्याउ Studio</h2>
    <p>Ultra-fluid reactive computing powered by Nepali craftsmanship.</p>
    <div class="meta">
      <span>Rating: 4.98</span>
      <span>Zero Latency</span>
    </div>
    <button onclick="alert('Meow! Welcome to स्याउ Studio!')">Launch Project</button>
  </div>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #0a0c16;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  perspective: 1000px;
}
.card-wrap {
  transform-style: preserve-3d;
}
.card {
  width: 320px;
  padding: 32px 28px;
  background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 24px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2);
  color: #fff;
  transition: transform 0.1s ease-out;
}
.badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(232,130,155,0.2);
  color: #E8829B;
  border: 1px solid rgba(232,130,155,0.4);
  margin-bottom: 16px;
}
h2 {
  font-size: 24px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #fff, #B8C4D0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
p {
  font-size: 13px;
  color: rgba(255,255,255,0.65);
  line-height: 1.5;
  margin-bottom: 20px;
}
.meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #7EDDD6;
  margin-bottom: 24px;
}
button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #E8829B, #D4789C);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(232,130,155,0.4);
  transition: opacity 0.2s;
}
button:hover {
  opacity: 0.9;
}`,
    js: `const card = document.getElementById('card');

window.addEventListener('mousemove', (e) => {
  const x = (window.innerWidth / 2 - e.clientX) / 15;
  const y = (window.innerHeight / 2 - e.clientY) / -15;
  card.style.transform = \`rotateY(\${x}deg) rotateX(\${y}deg)\`;
});

console.log('3D Holographic Card Mounted!');`
  }
]

const generateCombinedDoc = (html: string, css: string, js: string) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
${css}
  </style>
</head>
<body>
${html}
<script>
(function() {
  const _log = console.log;
  const _warn = console.warn;
  const _error = console.error;
  function send(type, args) {
    try {
      window.parent.postMessage({
        source: 'syau-sandbox',
        type: type,
        message: Array.from(args).map(function(a) { return typeof a === 'object' ? JSON.stringify(a) : String(a); }).join(' ')
      }, '*');
    } catch(e) {}
  }
  console.log = function() { send('log', arguments); _log.apply(console, arguments); };
  console.warn = function() { send('warn', arguments); _warn.apply(console, arguments); };
  console.error = function() { send('error', arguments); _error.apply(console, arguments); };
  window.onerror = function(msg, url, line) {
    send('error', ['Line ' + line + ': ' + msg]);
  };
})();
</script>
<script>
try {
${js}
} catch(err) {
  console.error(err && err.message ? err.message : String(err));
}
</script>
</body>
</html>`
}

type FileTab = 'html' | 'css' | 'js'

export default function Studio() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(TEMPLATES[0].id)
  const [activeTab, setActiveTab] = useState<FileTab>('html')
  const [htmlCode, setHtmlCode] = useState(TEMPLATES[0].html)
  const [cssCode, setCssCode] = useState(TEMPLATES[0].css)
  const [jsCode, setJsCode] = useState(TEMPLATES[0].js)
  const [previewSrcDoc, setPreviewSrcDoc] = useState(() => generateCombinedDoc(TEMPLATES[0].html, TEMPLATES[0].css, TEMPLATES[0].js))
  const [previewKey, setPreviewKey] = useState(0)
  const [autoRun, setAutoRun] = useState(true)
  const [logs, setLogs] = useState<{ type: 'log' | 'warn' | 'error'; text: string; time: string }[]>([])
  const [showConsole, setShowConsole] = useState(false)
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop')
  const [splitRatio, setSplitRatio] = useState<'split' | 'editor' | 'preview'>('split')
  const [aiGenerating, setAiGenerating] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const buildPreview = useCallback(() => {
    const doc = generateCombinedDoc(htmlCode, cssCode, jsCode)
    setPreviewSrcDoc(doc)
    setPreviewKey(k => k + 1)
  }, [htmlCode, cssCode, jsCode])

  // Handle postMessage logs from the iframe
  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data && e.data.source === 'syau-sandbox') {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        setLogs(prev => [...prev.slice(-40), { type: e.data.type, text: e.data.message, time }])
      }
    }
    window.addEventListener('message', handleMsg)
    return () => window.removeEventListener('message', handleMsg)
  }, [])

  // Auto-run trigger with 350ms debounce
  useEffect(() => {
    if (!autoRun) return
    const t = setTimeout(() => {
      buildPreview()
    }, 350)
    return () => clearTimeout(t)
  }, [htmlCode, cssCode, jsCode, autoRun, buildPreview])

  const handleTemplateChange = (tplId: string) => {
    const tpl = TEMPLATES.find(t => t.id === tplId)
    if (!tpl) return
    setSelectedTemplate(tpl.id)
    setHtmlCode(tpl.html)
    setCssCode(tpl.css)
    setJsCode(tpl.js)
    setLogs([])
    const doc = generateCombinedDoc(tpl.html, tpl.css, tpl.js)
    setPreviewSrcDoc(doc)
    setPreviewKey(k => k + 1)
  }

  const handleExportHtml = () => {
    const combined = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Syau Studio Export</title>
  <style>
    ${cssCode}
  </style>
</head>
<body>
  ${htmlCode}
  <script>
    ${jsCode}
  <\/script>
</body>
</html>`
    const blob = new Blob([combined], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `syau-project-${Date.now()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Support Tab key indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const val = textarea.value
      textarea.value = val.substring(0, start) + '  ' + val.substring(end)
      textarea.selectionStart = textarea.selectionEnd = start + 2
      if (activeTab === 'html') setHtmlCode(textarea.value)
      if (activeTab === 'css') setCssCode(textarea.value)
      if (activeTab === 'js') setJsCode(textarea.value)
    }
    // Ctrl+Enter or Cmd+Enter to Run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      buildPreview()
    }
  }

  const currentCode = activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode
  const handleCodeChange = (val: string) => {
    if (activeTab === 'html') setHtmlCode(val)
    if (activeTab === 'css') setCssCode(val)
    if (activeTab === 'js') setJsCode(val)
  }

  const lineCount = currentCode.split('\n').length

  const handleAiCodeAssistance = async () => {
    const groqKey = localStorage.getItem('syau-groq-key') || ''
    const geminiKey = localStorage.getItem('syau-gemini-key') || ''

    if (!groqKey && !geminiKey) {
      alert('Meow! Please add your Groq or Gemini API Key in Meo AI settings to use AI Code Generation!')
      window.dispatchEvent(new CustomEvent('meo-toggle'))
      return
    }

    setAiGenerating(true)
    const prompt = `You are an elite frontend engineer for Syau OS. 
Enhance the following JavaScript code to add a cool interactive animation, particle effect, or sound effect. 
Return ONLY clean JavaScript code without markdown backticks.

Current JS:
${jsCode}`

    try {
      if (groqKey) {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 800
          })
        })
        const data = await res.json()
        const code = data.choices?.[0]?.message?.content?.replace(/```javascript|```js|```/gi, '').trim()
        if (code) {
          setJsCode(code)
          setActiveTab('js')
          buildPreview()
        }
      } else if (geminiKey) {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] })
        })
        const data = await res.json()
        const code = data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/```javascript|```js|```/gi, '').trim()
        if (code) {
          setJsCode(code)
          setActiveTab('js')
          buildPreview()
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setAiGenerating(false)
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', width: '100%', height: '100%',
      background: '#0D0F1A', color: '#E2E8F0', overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px', background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.08)', gap: 8, flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: 'linear-gradient(135deg, #E8829B, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Code2 size={14} color="#FFF" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.3, color: '#FFF' }}>
                  Syau Studio
                </span>
                <span style={{
                  fontSize: 9.5, padding: '1px 6px', borderRadius: 5,
                  background: 'rgba(232,130,155,0.15)', border: '1px solid rgba(232,130,155,0.3)',
                  color: '#E8829B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4
                }}>
                  HTML • CSS • JS Only
                </span>
              </div>
            </div>
          </div>

          <select
            value={selectedTemplate}
            onChange={e => handleTemplateChange(e.target.value)}
            style={{
              padding: '5px 10px', borderRadius: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#FFF', fontSize: 12, outline: 'none', cursor: 'pointer'
            }}
          >
            {TEMPLATES.map(t => (
              <option key={t.id} value={t.id} style={{ background: '#121422', color: '#FFF' }}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', padding: 3, borderRadius: 10 }}>
          <button
            onClick={() => setActiveTab('html')}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 7,
              border: 'none', background: activeTab === 'html' ? 'rgba(232,130,155,0.25)' : 'transparent',
              color: activeTab === 'html' ? '#E8829B' : 'rgba(255,255,255,0.6)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer'
            }}
          >
            <FileCode2 size={13} />
            <span>index.html</span>
          </button>

          <button
            onClick={() => setActiveTab('css')}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 7,
              border: 'none', background: activeTab === 'css' ? 'rgba(126,221,214,0.25)' : 'transparent',
              color: activeTab === 'css' ? '#7EDDD6' : 'rgba(255,255,255,0.6)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer'
            }}
          >
            <Palette size={13} />
            <span>style.css</span>
          </button>

          <button
            onClick={() => setActiveTab('js')}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 7,
              border: 'none', background: activeTab === 'js' ? 'rgba(251,191,36,0.25)' : 'transparent',
              color: activeTab === 'js' ? '#FBBF24' : 'rgba(255,255,255,0.6)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer'
            }}
          >
            <Sparkles size={13} />
            <span>script.js</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: 2, borderRadius: 8, gap: 2 }}>
            <button
              onClick={() => setSplitRatio('split')}
              style={{
                padding: '4px 6px', borderRadius: 6, border: 'none',
                background: splitRatio === 'split' ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: splitRatio === 'split' ? '#FFF' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer'
              }}
              title="Split 50/50"
            >
              <SplitSquareVertical size={13} />
            </button>
            <button
              onClick={() => setSplitRatio('editor')}
              style={{
                padding: '4px 6px', borderRadius: 6, border: 'none',
                background: splitRatio === 'editor' ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: splitRatio === 'editor' ? '#FFF' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer'
              }}
              title="Editor Full"
            >
              <Code2 size={13} />
            </button>
            <button
              onClick={() => setSplitRatio('preview')}
              style={{
                padding: '4px 6px', borderRadius: 6, border: 'none',
                background: splitRatio === 'preview' ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: splitRatio === 'preview' ? '#FFF' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer'
              }}
              title="Preview Full"
            >
              <Maximize2 size={13} />
            </button>
          </div>

          <button
            onClick={() => setAutoRun(!autoRun)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 8px', borderRadius: 8,
              background: autoRun ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)',
              border: autoRun ? '1px solid rgba(52,211,153,0.35)' : '1px solid rgba(255,255,255,0.1)',
              color: autoRun ? '#34D399' : 'rgba(255,255,255,0.5)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer'
            }}
            title={autoRun ? 'Auto-Run: ON (Live debounced reloads)' : 'Auto-Run: OFF'}
          >
            {autoRun && <Zap size={11} />}
            <span>{autoRun ? 'Live' : 'Manual'}</span>
          </button>

          <button
            onClick={() => handleTemplateChange(selectedTemplate)}
            style={{
              padding: '5px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', cursor: 'pointer'
            }}
            title="Reset template code"
          >
            <RotateCcw size={13} />
          </button>

          <button
            onClick={handleAiCodeAssistance}
            disabled={aiGenerating}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8,
              background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.25))',
              border: '1px solid rgba(139,92,246,0.4)',
              color: '#F472B6', fontSize: 11, fontWeight: 600, cursor: 'pointer'
            }}
            title="Ask AI to enhance JS code"
          >
            <Sparkles size={12} />
            <span>{aiGenerating ? 'AI Magic...' : 'AI Enhance'}</span>
          </button>

          <button
            onClick={buildPreview}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 8,
              background: 'linear-gradient(135deg, #E8829B, #D4789C)',
              border: 'none', color: '#FFF', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(232,130,155,0.4)'
            }}
            title="Run Code (Ctrl+Enter)"
          >
            <Play size={12} fill="#FFF" />
            <span>Run</span>
          </button>

          <button
            onClick={handleExportHtml}
            style={{
              padding: '5px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', cursor: 'pointer'
            }}
            title="Export Standalone HTML file"
          >
            <Download size={13} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {(splitRatio === 'split' || splitRatio === 'editor') && (
          <div style={{
            flex: splitRatio === 'editor' ? 1 : 0.5,
            display: 'flex', flexDirection: 'column',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            background: '#090B14'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '4px 12px', background: 'rgba(0,0,0,0.2)', fontSize: 11, color: 'rgba(255,255,255,0.4)'
            }}>
              <span>{activeTab.toUpperCase()} (Pure Web: HTML / CSS / JS only) · {lineCount} lines</span>
              <span style={{ fontSize: 10 }}>Tab = 2 spaces</span>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
              <div style={{
                width: 38, padding: '12px 6px', textAlign: 'right',
                background: 'rgba(0,0,0,0.25)', color: 'rgba(255,255,255,0.2)',
                fontFamily: 'monospace', fontSize: 12, lineHeight: '20px',
                userSelect: 'none'
              }}>
                {Array.from({ length: Math.max(lineCount, 15) }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              <textarea
                ref={textareaRef}
                value={currentCode}
                onChange={e => handleCodeChange(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                style={{
                  flex: 1, padding: '12px 14px', background: 'transparent',
                  border: 'none', outline: 'none', color: '#F1F5F9',
                  fontFamily: '"Fira Code", "SF Mono", Menlo, Consolas, monospace',
                  fontSize: 12.5, lineHeight: '20px', resize: 'none',
                  whiteSpace: 'pre', tabSize: 2
                }}
              />
            </div>
          </div>
        )}

        {(splitRatio === 'split' || splitRatio === 'preview') && (
          <div style={{
            flex: splitRatio === 'preview' ? 1 : 0.5,
            display: 'flex', flexDirection: 'column',
            background: '#121424'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '6px 12px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#7EDDD6' }}>● LIVE PREVIEW</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Sandboxed</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => setViewportMode('desktop')}
                  style={{
                    padding: '3px 6px', borderRadius: 6,
                    background: viewportMode === 'desktop' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: 'none', color: viewportMode === 'desktop' ? '#FFF' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer'
                  }}
                  title="Desktop View"
                >
                  <Monitor size={13} />
                </button>
                <button
                  onClick={() => setViewportMode('mobile')}
                  style={{
                    padding: '3px 6px', borderRadius: 6,
                    background: viewportMode === 'mobile' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: 'none', color: viewportMode === 'mobile' ? '#FFF' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer'
                  }}
                  title="Mobile View (375px)"
                >
                  <Smartphone size={13} />
                </button>

                <button
                  onClick={() => setShowConsole(!showConsole)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6,
                    background: showConsole ? 'rgba(232,130,155,0.2)' : 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: showConsole ? '#E8829B' : 'rgba(255,255,255,0.6)',
                    fontSize: 11, cursor: 'pointer'
                  }}
                >
                  <Terminal size={11} />
                  <span>Console {logs.length > 0 && `(${logs.length})`}</span>
                </button>
              </div>
            </div>

            <div style={{
              flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
              background: '#0B0D18', overflow: 'hidden', padding: viewportMode === 'mobile' ? 16 : 0
            }}>
              <div style={{
                width: viewportMode === 'mobile' ? 375 : '100%',
                height: viewportMode === 'mobile' ? 620 : '100%',
                borderRadius: viewportMode === 'mobile' ? 24 : 0,
                boxShadow: viewportMode === 'mobile' ? '0 20px 50px rgba(0,0,0,0.8), 0 0 0 8px #1E2235' : 'none',
                overflow: 'hidden', background: '#FFF'
              }}>
                <iframe
                  key={previewKey}
                  title="syau-preview"
                  srcDoc={previewSrcDoc}
                  sandbox="allow-scripts allow-modals allow-same-origin allow-forms allow-popups"
                  style={{ width: '100%', height: '100%', border: 'none', background: '#0B0D18' }}
                />
              </div>
            </div>

            {showConsole && (
              <div style={{
                height: 140, background: '#080A10', borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden'
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '4px 10px', background: 'rgba(255,255,255,0.03)', fontSize: 11
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>CONSOLE OUTPUT</span>
                  <button
                    onClick={() => setLogs([])}
                    style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                    title="Clear console"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '6px 10px', fontFamily: 'monospace', fontSize: 11 }}>
                  {logs.length === 0 ? (
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>No console logs yet.</div>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} style={{
                        padding: '2px 0',
                        color: log.type === 'error' ? '#F87171' : log.type === 'warn' ? '#FBBF24' : '#94A3B8'
                      }}>
                        <span style={{ color: 'rgba(255,255,255,0.3)', marginRight: 6 }}>[{log.time}]</span>
                        <span>{log.text}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
