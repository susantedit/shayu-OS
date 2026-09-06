# स्याउ OS (SyauOS)

A client-side web desktop environment built with React 19, TypeScript, and Vite.
Named **स्याउ** (*Syau*, meaning "Apple" in Nepali), the project blends desktop operating system conventions with native Nepali cultural identity, Devanagari typography, and Bikram Sambat (BS) calendar integration.

Built by **Kantaraj Luitel (Susant)** for the [Hack Club Stardance](https://stardance.hackclub.com/projects/56644) showcase.

---

## A Note From the Builder

When I first started this project, I thought I could build everything with AI prompts. But as time went on, I realized that when I depended too much on generated code, the project became bloated, buggy, and completely disconnected from what I actually knew. 

So I stepped back and rebuilt the project so I could truly understand every piece. I watched tutorials, read documentation, and wrote the logic myself: debugging mouse drag physics, mobile touch viewports, and building the Bikram Sambat calendar converter from scratch. 

I did use AI for initial exploration and syntax help when stuck, but this project taught me that real engineering means taking ownership of your code. SyauOS is something I learned by researching, experimenting, breaking, and fixing with my own hands.

---

## Why I Built This

I wanted to understand how operating systems handle windowing, multi-tasking, and application state in a browser environment, while giving it a distinct identity instead of cloning a generic macOS or Windows theme. SyauOS integrates:
- Native Devanagari typography (`Noto Sans Devanagari`) paired with `Space Grotesk`.
- Real-time Gregorian (AD) to Nepali Bikram Sambat (BS) date conversion displaying years, months, and days in native numerals (e.g., २०८३ भाद्र १६).
- A custom window manager with focus elevation, z-index stacks, dragging physics, maximizing, and multi-workspace support.

---

## Architecture & How It Works

### 1. Window Manager (`src/store/desktopStore.ts`, `src/components/Window.tsx`)
- **State Management**: Zustand manages active window IDs, open app lists, z-index counters, minimized/maximized flags, and multi-workspace assignments.
- **60fps Drag & Resize**: During mouse drag, coordinates update the DOM element directly (`style.left`, `style.top`) rather than re-rendering the React tree on every pointer event. Final coordinates are synced back into Zustand on `mouseup`.
- **Focus Elevation**: Clicking anywhere on an unfocused window elevates its `zIndex` to `nextZIndex + 1` and updates `activeWindowId`.
- **Multi-Workspace**: Supports 4 independent virtual desktops. Switching workspaces filters active windows without unmounting background app state.

### 2. Bikram Sambat Calendar Engine (`src/utils/nepaliCalendar.ts`)
- Pure TypeScript implementation of the Bikram Sambat calendar system.
- Converts standard Gregorian `Date` objects to BS year, month (`बैशाख` through `चैत`), and day.
- Formats dates into Devanagari numerals (`०-९`) dynamically without hardcoded strings.
- Verified with 5 dedicated unit tests for historical and future date transitions.

### 3. Desktop Shell (`src/components/`)
- **TopBar**: Live Nepali date, digital clock, battery/wifi/sound indicators, and quick control center.
- **Dock**: Floating macOS-style application launcher with magnification and running indicators.
- **SystemUI**: Toast notification dispatcher, audio click synthesizer (Web Audio API), and shortcut handlers (Cmd+K / Ctrl+K Spotlight search).
- **Widgets**: Expandable desktop sidebar with clock, calendar, and quick toggles.

---

## Built-in Applications

| App | Description | Key Tech |
|---|---|---|
| **Devlogs** | Interactive developer notes documenting real bugs, fixes, and architecture choices | Local state, theme toggling |
| **Notes** | Persistent markdown/text scratchpad with word count and autosave | LocalStorage |
| **Calculator** | Clean desktop calculator with keyboard input support | JavaScript math evaluation |
| **Browser** | In-OS web portal with curated developer bookmarks and external launch | HTML iframe + sandbox |
| **Capture** | Screen recording tool with microphone audio and photo booth mode | `navigator.mediaDevices` |
| **Terminal** | Custom `syau-sh` terminal with commands (`help`, `neofetch`, `date`, `clear`, `apps`) | Command parser |
| **Music Player** | Spotify Web Player hub with curated coding playlists | Embedded iframe |
| **Settings** | System customization (dark/light mode, accent color, widget toggles) | Zustand store |
| **Studio** | Live HTML/CSS/JavaScript interactive scratchpad runner | Sandboxed iframe |
| **Store** | Curated catalog of installable web utilities and mini-apps | App registry |
| **Gallery** | Image viewer showcasing desktop wallpapers and photos | Modal lightbox |
| **About Me** | Builder portfolio detailing certifications and Hack Club projects | Vector layout |

---

## Tech Stack

- **Framework**: React 19
- **Language**: TypeScript (strict type checking enabled)
- **Bundler**: Vite 8
- **State Management**: Zustand
- **Motion**: Framer Motion
- **Icons**: Lucide React (vector SVG, zero emojis across the entire codebase)
- **Styling**: Tailwind CSS + CSS Custom Properties (Tokens)
- **Testing**: Node.js native test runner (`node:test`, `node:assert`)

---

## Running Locally

```bash
# Clone the repository
git clone https://github.com/susantedit/shayu-OS.git
cd shayu-OS

# Install dependencies
npm install

# Run the development server
npm run dev

# Run unit test suite (10 tests)
npm test

# Build production bundle
npm run build
```

---

## Testing & Quality Assurance

SyauOS includes automated unit tests running on Node's native test runner (`node --test`):
- `src/utils/nepaliCalendar.test.ts`: Validates Arabic-to-Devanagari digit conversion, 12-month array ordering, leap/month-day transitions, and Bikram Sambat date calculations.
- `src/store/desktopStore.test.ts`: Validates window boot state, window creation, focus z-index elevation, minimize/maximize toggling, multi-workspace isolation, and clean window closing.

```
✔ DesktopStore boots and opens a window
✔ DesktopStore focusWindow increases zIndex and sets activeWindowId
✔ DesktopStore minimize and maximize behavior
✔ DesktopStore workspace management and filtering
✔ DesktopStore closeWindow cleans up window and active state
✔ toDevanagariDigits converts standard digits to Devanagari numerals
✔ NEPALI_MONTHS contains all 12 Bikram Sambat months in order
✔ getNepaliDateBS converts known Gregorian date 2023-04-14 to 2080 Baishakh 1
✔ getNepaliDateBS converts known Gregorian date 2024-04-13 to 2081 Baishakh 1
✔ getNepaliDateBS accurately advances months and days in BS year 2080
ℹ tests 10, pass 10, fail 0
```

---

## Known Limitations

1. **Iframe Security Policies**: Most popular websites (Google, GitHub, Wikipedia) send the `X-Frame-Options: SAMEORIGIN` or `DENY` HTTP response header. Browsers block these from rendering inside SyauOS's Browser iframe. When blocked, the browser UI displays an explicit security explanation with an "Open in New Tab" fallback.
2. **Single-Threaded Browser Environment**: All windows run inside the same React JavaScript execution context. A heavy script running inside the Studio playground or an app shares the main browser thread.
3. **Screen Recording Permissions**: The Capture app relies on the browser's `getDisplayMedia` API, which requires user permission and is restricted on some mobile browsers.

---

## Honest AI Declaration

I want to be completely transparent about how this project was built and where AI was involved:

### The Scaffolding Phase:
When I first started this project, I used AI prompts to scaffold out many of the apps and generate layout boilerplates. That led to a massive initial codebase, which included a lot of code I didn't write by hand (like heavy canvas particle demos, placeholder store apps, and an AI chat assistant hooked up to Gemini 1.5 Flash).

### The Rewrite & Human Ownership (<30% AI):
Following review feedback from Hack Club Shipwright @Shreerang, I audited the repository to cut the fluff and ensure the project reflects my own work:
1. **Excised All External AI & Cloud APIs**:
   - Completely deleted Google Gemini 1.5 Flash REST calls, API key inputs, and voice synthesis.
   - Converted Meo (`src/components/MeoAssistant.tsx`) into a simple, 100% offline desktop command runner and shortcut indexer.
2. **Stripped Over 5,000 Lines of AI Boilerplate**:
   - Deleted pre-baked canvas particle scripts from `Studio.tsx` (cut from 1,000+ lines down to a clean 180-line scratchpad).
   - Pruned fake template mockups and unused placeholder apps.
   - Cleaned up bloated CSS filters and cursor trail scripts.
3. **What I Hand-Engineered and Understand**:
   - **Bikram Sambat (BS) Nepali Calendar**: Wrote the algorithmic Gregorian-to-BS date calculation and dynamic Devanagari digit formatting (`src/utils/nepaliCalendar.ts`) verified by 5 unit tests.
   - **Window Manager**: Diagnosed and rewrote window dragging, z-index focus stacking, pointer boundary slipping, and multi-workspace window filtering (`src/store/desktopStore.ts`, `src/components/Window.tsx`) verified by 5 unit tests.
   - **Shell & Tools**: Built the custom terminal parser (`Terminal.tsx`), clean calculator evaluation, persistent notes, and responsive mobile adaptations.
   - **Devlogs**: Documented every bug, mobile breakpoint glitch, and refactor in plain English in `src/apps/Devlogs.tsx`.

---

## License

MIT © [Kantaraj Luitel (Susant)](https://github.com/susantedit)
