---
description: Strict rule forbidding emoji usage across the entire project, UI, components, and responses. Always use SVG or Lucide icons instead.
always_on: true
---

# Strict No-Emoji Policy

## Core Principle
- **NEVER use emojis anywhere** in the application codebase, UI components, HTML, CSS, strings, notifications, badges, or assistant responses.
- Always use **Lucide React icons**, **custom SVG icons**, or clean, professional typographic text.

## Rules & Requirements
1. **No Unicode Emojis**: Do not render or hardcode unicode emojis (e.g., 🍎, 🚀, 🔥, ⚡, 💻, ⚙️, etc.) in any React components, templates, or markdown files.
2. **Icons First**: For visual indicators, status badges, buttons, toolbars, and menus, always import and use vector icons (e.g., `lucide-react` or clean `<svg>` paths).
3. **Data / JSON / Configs**: Ensure configuration files, mock data, and system logs do not use emojis as iconography or status indicators.
