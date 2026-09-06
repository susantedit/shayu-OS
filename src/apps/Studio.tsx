import { useState, useRef, useEffect } from 'react'
import { Play, RotateCcw, Download, FileCode, Palette, Terminal, Eye } from 'lucide-react'

type TabType = 'html' | 'css' | 'js'

const DEFAULT_CODE = {
  html: `<div class="box">
  <h2>स्याउ Studio Playground</h2>
  <p>Type your HTML, CSS, and JavaScript here.</p>
  <button id="demo-btn">Interactive Test</button>
  <div id="output"></div>
</div>`,
  css: `body {
  margin: 0;
  padding: 24px;
  background: #0f111a;
  color: #e2e8f0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  box-sizing: border-box;
}

.box {
  background: #181b2a;
  border: 1px solid #2d334d;
  border-radius: 12px;
  padding: 24px 28px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}

h2 {
  margin-top: 0;
  color: #e8829b;
  font-size: 20px;
}

p {
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.5;
}

button {
  background: #7eddd6;
  color: #0f111a;
  border: none;
  padding: 8px 16px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 12px;
}

button:hover {
  opacity: 0.9;
}

#output {
  margin-top: 14px;
  font-size: 13px;
  color: #38bdf8;
  font-family: monospace;
}`,
  js: `const btn = document.getElementById('demo-btn');
const output = document.getElementById('output');
let count = 0;

btn.addEventListener('click', () => {
  count++;
  output.textContent = 'Button clicked ' + count + ' time' + (count === 1 ? '' : 's') + '!';
});`,
}

export default function Studio() {
  const [activeTab, setActiveTab] = useState<TabType>('html')
  const [html, setHtml] = useState(() => localStorage.getItem('syau-studio-html') || DEFAULT_CODE.html)
  const [css, setCss] = useState(() => localStorage.getItem('syau-studio-css') || DEFAULT_CODE.css)
  const [js, setJs] = useState(() => localStorage.getItem('syau-studio-js') || DEFAULT_CODE.js)
  const [srcDoc, setSrcDoc] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const buildDoc = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>${js}<\/script>
</body>
</html>`
  }

  // Initial render & sync
  useEffect(() => {
    setSrcDoc(buildDoc())
  }, [])

  const handleRun = () => {
    localStorage.setItem('syau-studio-html', html)
    localStorage.setItem('syau-studio-css', css)
    localStorage.setItem('syau-studio-js', js)
    setSrcDoc(buildDoc())
  }

  const handleReset = () => {
    setHtml(DEFAULT_CODE.html)
    setCss(DEFAULT_CODE.css)
    setJs(DEFAULT_CODE.js)
    localStorage.removeItem('syau-studio-html')
    localStorage.removeItem('syau-studio-css')
    localStorage.removeItem('syau-studio-js')
    setSrcDoc(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${DEFAULT_CODE.css}</style>
</head>
<body>
  ${DEFAULT_CODE.html}
  <script>${DEFAULT_CODE.js}<\/script>
</body>
</html>`)
  }

  const handleExport = () => {
    const fullHtml = buildDoc()
    const blob = new Blob([fullHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'syau-studio-project.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0e1017', color: '#e2e8f0', overflow: 'hidden' }}>
      {/* Top Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px', borderBottom: '1px solid #1e2333', background: '#131622',
      }}>
        {/* Language Tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setActiveTab('html')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: activeTab === 'html' ? '#1e2438' : 'transparent',
              border: activeTab === 'html' ? '1px solid #3b4261' : '1px solid transparent',
              color: activeTab === 'html' ? '#e8829b' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <FileCode size={14} /> HTML
          </button>
          <button
            onClick={() => setActiveTab('css')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: activeTab === 'css' ? '#1e2438' : 'transparent',
              border: activeTab === 'css' ? '1px solid #3b4261' : '1px solid transparent',
              color: activeTab === 'css' ? '#7eddd6' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <Palette size={14} /> CSS
          </button>
          <button
            onClick={() => setActiveTab('js')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: activeTab === 'js' ? '#1e2438' : 'transparent',
              border: activeTab === 'js' ? '1px solid #3b4261' : '1px solid transparent',
              color: activeTab === 'js' ? '#fbbf24' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <Terminal size={14} /> JavaScript
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={handleRun}
            title="Run Code"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: '#7eddd6', color: '#090a10', border: 'none', cursor: 'pointer',
            }}
          >
            <Play size={13} /> Run
          </button>
          <button
            onClick={handleReset}
            title="Reset to Default"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
              background: '#1e2438', color: '#cbd5e1', border: '1px solid #333a54', cursor: 'pointer',
            }}
          >
            <RotateCcw size={13} /> Reset
          </button>
          <button
            onClick={handleExport}
            title="Export HTML"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
              background: '#1e2438', color: '#cbd5e1', border: '1px solid #333a54', cursor: 'pointer',
            }}
          >
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* Main Workspace (Editor + Live Preview Split) */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Editor Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #1e2333' }}>
          <textarea
            value={activeTab === 'html' ? html : activeTab === 'css' ? css : js}
            onChange={(e) => {
              const val = e.target.value
              if (activeTab === 'html') setHtml(val)
              else if (activeTab === 'css') setCss(val)
              else setJs(val)
            }}
            placeholder={`Enter ${activeTab.toUpperCase()} code here...`}
            spellCheck={false}
            style={{
              flex: 1, width: '100%', padding: '16px', background: '#0a0c12',
              color: '#f1f5f9', border: 'none', outline: 'none', resize: 'none',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: 13, lineHeight: 1.6, boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Live Preview Pane */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
          <div style={{
            padding: '4px 10px', background: '#131622', borderBottom: '1px solid #1e2333',
            fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <Eye size={12} /> Live Preview
          </div>
          <iframe
            ref={iframeRef}
            srcDoc={srcDoc}
            title="Studio Preview"
            sandbox="allow-scripts allow-modals"
            style={{ flex: 1, width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </div>
    </div>
  )
}
