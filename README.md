# VGRECORD

<p align="center">
  <svg width="180" height="180" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4F46E5"/>
        <stop offset="50%" stop-color="#7C3AED"/>
        <stop offset="100%" stop-color="#DB2777"/>
      </linearGradient>
      <linearGradient id="vGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#E0E7FF"/>
      </linearGradient>
      <linearGradient id="recDot" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FF3366"/>
        <stop offset="100%" stop-color="#E11D48"/>
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#312E81" flood-opacity="0.5"/>
      </filter>
      <filter id="vShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.35"/>
      </filter>
    </defs>
    <rect x="48" y="48" width="928" height="928" rx="240" fill="url(#bgGrad)" filter="url(#shadow)"/>
    <rect x="52" y="52" width="920" height="920" rx="236" stroke="rgba(255,255,255,0.25)" stroke-width="8"/>
    <circle cx="512" cy="512" r="340" stroke="rgba(255, 255, 255, 0.18)" stroke-width="28" stroke-dasharray="60 40"/>
    <circle cx="512" cy="512" r="240" stroke="rgba(255, 255, 255, 0.12)" stroke-width="16"/>
    <path d="M304 360L512 704L720 360" stroke="url(#vGrad)" stroke-width="76" stroke-linecap="round" stroke-linejoin="round" filter="url(#vShadow)"/>
    <circle cx="512" cy="450" r="70" fill="url(#recDot)"/>
    <circle cx="512" cy="450" r="92" stroke="#FFFFFF" stroke-width="18" stroke-opacity="0.85"/>
  </svg>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Windows%20%7C%20macOS%20%7C%20Linux-111827?style=for-the-badge" alt="Windows macOS Linux" />
  <img src="https://img.shields.io/badge/100%25%20Free%20%26%20Login--Free-10B981?style=for-the-badge" alt="Login-Free" />
  <img src="https://img.shields.io/badge/Offline%20First-6366F1?style=for-the-badge" alt="Offline First" />
</p>

### Create studio-quality screen recordings and demo videos in seconds.
**VGRECORD** is a high-performance, **100% login-free**, offline-first screen recording and post-production video editing studio. Built with hardware-accelerated capture and dynamic PixiJS composition tools, VGRECORD makes it effortless to record screen walkthroughs, tutorial videos, and product presentations without cloud subscriptions or forced accounts.

---

## 🌟 Key Highlights & Swiss Army Knife Suite

### 🛠️ The Swiss Army Knife Toolset
- **🔍 Focus Spotlight & Laser Pointer**: Dim surrounding areas with a focused bright circle, activate a neon glowing laser pointer, or engage a circular magnifying lens over cursor hot-spots.
- **🔲 Privacy Redaction & Blur Masks**: Place draggable and resizable blur/pixelate boxes over credentials, passwords, API tokens, and emails.
- **⏱️ Auto Chapter Markers & YouTube Timestamps**: Pin timeline timestamps and copy formatted chapters (`00:00 Intro`, `01:25 Setup`) to clipboard with 1 click.
- **🎙️ Studio Voice AI DSP & Vocal Enhancer**: Real-time Web Audio high-pass rumble filter (80Hz), clarity presence boost (3.5kHz), and broadcast dynamics leveling.
- **📜 Presenter Studio Teleprompter**: Floating draggable script prompter with variable scroll speeds (1x–5x), mirror mode, and spacebar pause/resume.

### ⚡ Smart Silence & Dead-Air Auto-Cutter (AI Jump-Cut)
- One-click dead-air removal: scans speech transcription cues and audio pauses to automatically trim empty silence (>600ms).
- Split-merges active dialogue sections into clean, modern YouTube/TikTok-style jump cuts.

### ⌨️ Live Animated Keystroke Visualizer
- Real-time keyboard shortcut badge overlays (*e.g., `Ctrl + Shift + S`, `Alt + Tab`, `Cmd + C`*).
- Displays sleek glassmorphic keycaps directly over video playback with customizable fade timers.

### 📸 4K Frame Snapshot & Cover Thumbnail Grabber
- Instant one-click frame capture from composite canvas shaders, wallpapers, webcam bubbles, and annotations.
- Automatically exports crystal-clear `.png` image files (`VGRECORD-snapshot-*.png`) directly from the preview bar.

### 🔊 Procedural Click & Keyboard Typing Sound Synthesizer
- Built-in Web Audio synthesis engine with 5 click profiles (*Modern, Mechanical, Crisp Pop, Sharp Snap, Heavy Thud*).
- Interactive volume and playback rate tuning with live audio preview testing.

### 🎯 Auto-Zoom & Smart Cursor Smoothing
- Automatically detects user focus and cursor hotspots to generate smooth, cinematic camera pans and zooms.
- Configurable cursor magnification, inertia smoothing, sway, and click-bounce animations.

### 🎥 Dynamic Webcam Bubble Overlays
- Floating webcam bubble with customizable corner radius, shadow glow, sizing, and mirroring.
- Zoom-reactive framing so your webcam automatically stays balanced during zoomed screen actions.

### 🎨 Studio Mesh Gradients & Wallpapers
- Curated collection of high-resolution studio wallpapers and modern mesh gradients (*Cyber Violet, Neon Aura, Dark OLED, Frosted Glass, Radiant Sunbeam, Matrix Terminal*).
- Adjustable background blur, padding, drop shadows, and aspect ratio framing.

### 🚀 Zero Logins / 100% Local & Private
- No cloud account, sign-up screen, or remote token required.
- Everything runs locally on your machine with full offline support.

---

## 📦 System Requirements

| Platform | Minimum Requirement | Notes |
|---|---|---|
| **Windows** | Windows 10 (Build 19041+) / Windows 11 | Hardware-accelerated Windows Graphics Capture (WGC) & WASAPI audio. |
| **macOS** | macOS 14.0+ (Sonoma / Sequoia) | Native ScreenCaptureKit audio and display capture. |
| **Linux** | Modern 64-bit distros | Electron capture with PipeWire audio support. |

---

## 🛠️ Development & Building

### Prerequisites
- **Node.js**: v18.0+ / v20.0+
- **Package Manager**: `npm`

### Quick Start
```bash
# Clone the repository
git clone https://github.com/VG31OP/VGRECORD.git
cd VGRECORD

# Install dependencies
npm install

# Run the development environment
npm run dev
```

### Build Windows Binaries
```bash
# Generate branding icons
npm run generate:icons

# Build unpacked standalone and NSIS installer
npm run build:win
```
The resulting executables will be output to:
- **Standalone Portable App**: `release/win-unpacked/VGRECORD.exe`
- **Windows Installer**: `release/VGRECORD-windows-x64.exe`

---

## 📝 License
VGRECORD is open-source under the AGPL-3.0 License.
