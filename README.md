<div align="center">

# स्याउ OS (Syau OS)

**A client-side web desktop environment built by Kantaraj Luitel (Susant)**

Built for the [Hack Club](https://hackclub.com) WebOS Jam

[![Created by Kantaraj Luitel](https://img.shields.io/badge/Creator-Kantaraj_Luitel_(Susant)-8B5CF6?style=flat-square&logo=github)](https://github.com/susantedit)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vite.dev)

</div>

---

## About the Creator

**Kantaraj Luitel (Susant)** — Developer, cybersecurity enthusiast, and builder from Nepal.
- **2nd Place** - Campfire Kathmandu 2026 (Hack Club)
- **Oracle Cloud Certified** Generative AI Professional & AI Foundations Associate
- **APIsec Certified Practitioner**
- [GitHub Profile](https://github.com/susantedit) | [LinkedIn](https://linkedin.com/in/kantaraj-luitel) | [Buy Me a Coffee](https://buymeacoffee.com/Susantedit)

---

## About स्याउ OS

**स्याउ OS** (Syau OS) is a web-based desktop environment that runs entirely in the browser. The name "स्याउ" (pronounced *Syau*) means "Apple" in Nepali, serving as a playful nod to macOS while spotlighting native Devanagari typography (**Noto Sans Devanagari**) paired with clean monospace and sans-serif typefaces.

---

## Features

### Window Management & Desktop
- **Windowing System**: Draggable and resizable windows with focus elevation (z-index handling), minimize, maximize, and close controls.
- **Dock**: Floating application dock with hover magnification, active app indicators, and responsive horizontal scrolling on mobile.
- **Top Bar**: System status bar featuring time, audio/wifi/battery indicators, logo menu, and live **Bikram Sambat (BS)** Nepali calendar dates.
- **Mobile Responsive**: Automatic window clamping and auto-maximize on mobile screens with touch-friendly controls.
- **Dual Themes**: Switch between Dark Mode and Light Mode with consistent CSS variables.

### Built-in Apps
- **Devlogs**: Built-in interactive devlog reader sharing the real building journey, challenges, and code cleanup.
- **Notes**: Simple text scratchpad with instant local storage saving and live word counter.
- **Calculator**: Clean calculator with keyboard support and basic operations.
- **Music Player**: Spotify Web Player integration featuring curated playlists (Nepali Classics, Lofi, Anime OSTs).
- **Terminal**: Browser shell (`syau-sh`) with utility commands (`neofetch`, `help`, `date`, `clear`).
- **Creator Profile**: Profile window highlighting certifications, projects, and contact links.
- **Gallery**: Lightbox photo gallery with thumbnail previews and zoom view.
- **Settings**: System customization for themes, accent colors, and desktop widgets.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + CSS Custom Properties |
| Typography | Noto Sans Devanagari + Space Grotesk + Inter |
| State Management | Zustand |
| Motion | Framer Motion |
| Icons | Lucide React |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/susantedit/shayu-OS.git
cd shayu-OS

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## AI Disclosure & Building Process

In the spirit of Hack Club's focus on learning and authentic engineering:

- **Initial Scaffolding**: I initially used AI assistance for brainstorming features, exploring window manager concepts, and scaffolding initial component templates.
- **Refactoring & Ownership**: Following feedback from Hack Club reviewers (Shreerang), I have been actively refactoring the codebase by hand:
  - Rewriting the devlogs in my authentic voice detailing the real bugs I encountered (window z-index bugs, mobile touch handling, iframe reloads).
  - De-vibing the CSS: replacing hyper-saturated neon glows and heavy blur with clean, intentional theme tokens.
  - Removing AI boilerplate comments and simplifying application logic across Notes, Calculator, Widgets, and Terminal.
  - Making frequent, incremental git commits documenting real iterative coding progress.

---

<div align="center">

**स्याउ OS (Syau OS)** — Created by Kantaraj Luitel (Susant), Nepal

</div>
