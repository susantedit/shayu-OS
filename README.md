# स्याउ OS (SyauOS)

A handcrafted web desktop environment inspired by macOS, built with Nepali cultural identity, authentic tools, and pure client-side engineering.

"स्याउ" (Syau) means "Apple" in Nepali. SyauOS is my personal take on what a desktop operating system feels like when built for the web with genuine care, local Nepali utilities, and handcrafted CSS.

---

## What Makes SyauOS Unique

### 1. Distinctive Nepali Culture & Utilities
- **बाघचाल (Bagh-Chal - Tigers & Goats)**: Full native implementation of Nepal's traditional 5x5 strategic board game with 4 corner tigers, 20 goats, jump-capture detection, and pass-and-play or vs-computer modes.
- **Nepali Patro & Calendar Engine (नेपाली पात्रो)**: Full Bikram Sambat (BS) calendar engine with month length tables from 2000 BS to 2090 BS, AD/BS date conversion, and holiday recognition.
- **Traditional Land Measurement Converter**: Real conversion formulas between Pahad units (Ropani, Aana, Paisa, Daam), Terai units (Bigha, Kattha, Dhur), and Square Feet.
- **Syau Type (स्याउ टाइप)**: Live phonetic Romanized-to-Devanagari typing engine (e.g. typing `namaste sathi` live-converts to `नमस्ते साथी`) with one-click copy and direct export to Notes.

### 2. Handcrafted CSS & Window Manager
- **100% Handwritten Stylesheet**: Clean vanilla CSS with custom properties (`:root`, light/dark themes), custom scrollbars, frosted glass topbar, and responsive rules for mobile phones using `100dvh`. Zero Tailwind CSS or framework wrappers.
- **macOS Windowing Physics**: Realistic titlebar chrome with traffic light controls (close, minimize, maximize), global dragging handlers, smooth window elevation, and multi-workspace support.
- **Dock with Magnification**: Floating dock with magnification on hover, active app dots, and smooth spring transitions.

### 3. Client-Side & 100% Offline
- **Syau Focus Audio**: Handcrafted ambient sound synthesizer built directly with the browser's Web Audio API (Kathmandu monsoon rain, Himalayan campfire crackle, river stream, binaural theta focus frequencies).
- **Zero AI Chatbots & Zero API Keys**: Every app runs locally in the browser with localStorage persistence.
- **Strict No-Emoji Rule**: Clean vector iconography powered by Lucide React and custom SVG graphics across the entire UI.

---

## Core Applications

| App | Description | Key Architecture |
|---|---|---|
| **बाघचाल (Bagh-Chal)** | Nepal's traditional strategy board game (4 Tigers vs 20 Goats) | 5x5 board geometry, jump-capture algorithm & AI |
| **नेपाली पात्रो (Calendar & Units)** | Bikram Sambat calendar with AD/BS converter and traditional land/gold units | Algorithmic lookup tables & conversion math |
| **स्याउ टाइप (Syau Type)** | Real-time phonetic Romanized to Devanagari transliteration engine | Custom phonetic parser & rule engine |
| **स्याउ साउन्ड (Focus Audio)** | Ambient focus audio mixer (rain, campfire, stream, binaural beats) | Web Audio API procedural synthesis |
| **Terminal (`syau-sh`)** | Interactive terminal with `neofetch`, `matrix`, `cowsay`, process manager (`ps`/`kill`), and review notes | Command tokenizer & state manager |
| **Devlogs** | Engineering journal documenting layout bugs, mobile viewports, and Hack Club feedback | Local state & Markdown reader |
| **Notes** | Persistent markdown/text scratchpad with auto-save | LocalStorage |
| **Calculator** | Desktop calculator supporting mouse and keyboard operations | Arithmetic parser |
| **Music Player** | Curated playlist hub featuring Nepali classics and coding soundscapes | Embedded player deck |
| **Gallery** | Wallpaper manager and photo viewer with lightbox controls | Lightbox modal & wallpaper dispatcher |
| **Settings** | Desktop theme (Dark/Light), accent colors, custom cursor toggles, and dock positioning | Zustand store |
| **About Me** | Builder portfolio detailing certifications and Hack Club projects | Vector layout |

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **State Management**: Zustand
- **Motion**: Framer Motion
- **Styling**: Handcrafted CSS with CSS Custom Properties (Variables)
- **Icons**: Lucide React & Custom SVG elements (Strictly Zero Emojis)
- **Audio**: Web Audio API (Procedural synthesis)

---

## Running Locally

```bash
git clone https://github.com/susantedit/shayu-OS.git
cd shayu-OS
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to explore SyauOS.

---

## Author
**Kantaraj Luitel (Susant)**  
High School Developer & Cybersecurity Enthusiast from Nepal  
2nd Place Winner - Hack Club Campfire Kathmandu 2026