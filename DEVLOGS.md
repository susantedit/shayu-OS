# स्याउ OS (Syau OS) - Development Log

## Devlog #1: The Complete Journey of Building स्याउ OS
**Date:** August 31, 2026 | **Version:** v1.0.0-release | **Author:** Kantaraj Luitel (Susant)

### 🚀 Part 1: Core Architecture & Draggable Window Manager
- Built Zustand store for window stack and isolated z-index focus management.
- Implemented Framer Motion drag bounds clamping, 8-direction resizing, maximizing, and minimizing.
- Created 4 virtual workspace desktops accessible via keyboard shortcuts (`Ctrl + 1..4`).

### 🎨 Part 2: स्याउ OS Branding, Bilingual Typography & Theme Engine
- Configured bilingual typography system:
  - **स्याउ**: Noto Sans Devanagari (SemiBold 600)
  - **OS**: Space Grotesk (Bold 700)
  - **UI / Apps**: Inter (Regular 400, Medium 500, SemiBold 600)
- Integrated custom `syauOS.png` logo asset across TopBar, BootScreen, and System UI.
- Built live Dark Mode & Light (White) Mode theme engine with CSS variable token mapping.

### ✨ Part 3: Creator Profile, Devlogs, Nepali BS Calendar & Drive Gallery
- Built native **Creator Profile App** for Kantaraj Luitel (Susant) with certs, tech stack, and Buy Me a Coffee link.
- Created native **Devlog Viewer App** (`Devlogs.tsx`) with search and status timeline.
- Added live Bikram Sambat (BS) Nepali calendar date badge in TopBar (`२०८३ भाद्र १६`).
- Integrated Google Drive photo gallery with 33 photos, hover tooltips, and file manager.
- Verified password-free zero barrier lock screen access for all reviewers and users.
