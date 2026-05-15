# Changelog

All notable changes to this project will be documented in this file.

## [2.0.1] - 2026-05-15

### ✨ Features
- **Google Forms Support**: Added full support for Google Forms (`docs.google.com/forms`). The Stash icon and Magic Fill button now appear in form fields, with intelligent context detection using `aria-labelledby`.
- **Iframe Injection**: Enabled content script injection into all frames, allowing the extension to work on career portals that embed application forms in iframes.
- **Improved Detection**: Refined field context detection to be more robust across modern web forms.

## [2.0.0] - 2026-05-11

### ✨ Features
- **Local-First Architecture**: Completely removed cloud-sync dependencies (Google Drive/OAuth) in favor of private, local-only storage using IndexedDB and Dexie.js.
- **Context-Aware Form Injection**: 
  - Mutual exclusivity logic: Smart Fill (Magic Button) appears on high-confidence fields, while the Stash Icon appears on general professional fields.
  - Expanded detection for thousands of company career portals (Workday, Greenhouse, Lever, etc.).
- **Job Tracker (Kanban)**: Integrated a drag-and-drop board to manage your application pipeline (Interested, Applied, Interview, Offer, Rejected).
- **Global Command Palette**: Instant access to all your professional links and text snippets via a keyboard-first interface.
- **Asset Management**: 
  - **Links**: Store and categorize portfolios, GitHub profiles, and social links.
  - **Snippets**: Save frequently used text like cover letter intros, bio summaries, or professional taglines.
- **System Settings**: Added local data management tools (Export/Import JSON) and data purging capabilities.

### 🛡️ Security & Privacy
- **Privacy First**: No telemetry, no tracking, and zero data uploads to external servers.
- **Silent Operation**: Audited and removed all console logging for a cleaner, production-ready environment.
- **Open Source**: Licensed under GPL-3.0.

### 🛠️ Tech Stack
- React 19 + TypeScript
- Vite 7 + @crxjs/vite-plugin
- Dexie.js (IndexedDB)
- GSAP (Fluid Animations)
- Lucide React (Icons)
