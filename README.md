# SudoVerse 🧩

[![CI Code Quality](https://github.com/rafadono/sudoverse/actions/workflows/ci.yml/badge.svg)](https://github.com/rafadono/sudoverse/actions/workflows/ci.yml)
[![Build Apps](https://github.com/rafadono/sudoverse/actions/workflows/build-apps.yml/badge.svg)](https://github.com/rafadono/sudoverse/actions/workflows/build-apps.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Support on Ko-fi](https://img.shields.io/badge/Support%20on-Ko--fi-ff5e5b?logo=ko-fi&logoColor=white)](https://ko-fi.com)
[![TypeScript](https://img.shields.io/badge/Core%20Engine-TypeScript-3178c6)](https://www.typescriptlang.org/)
[![Tauri](https://img.shields.io/badge/Desktop%20Shell-Tauri%20%2F%20Rust-24c8db)](https://tauri.app/)

Unified, multi-platform Sudoku game with a shared engine for **Web (installable PWA)**, **Mobile (Android)**, and **Desktop (Linux & Windows)**.

---

## 🌟 Key Features

- **TypeScript Core Engine**: Game rules, backtracking solver, procedural puzzle generator, and rule validators are 100% TypeScript, shared byte-for-byte across every client, in `@sudoku/core`.
- **8 Game Variants**: Native support for Classic, Diagonal (X), Killer, Hyper (Windoku), Jigsaw (Irregular), Sandwich, Thermo, and Arrow Sudokus.
- **Dynamic Internationalization (i18n)**: Full English and Spanish localization, translating UI buttons, status messages, and diagnostics dynamically.
- **Cross-Platform Ready**:
  - **Web Client (PWA)**: Responsive React + Vite application, installable from the browser (offline-capable via service worker) on Debian, Ubuntu, Fedora, Arch, Windows, and macOS.
  - **Mobile Client**: Expo + React Native application compiling natively to Android.
  - **Desktop Client**: [Tauri](https://tauri.app/) (Rust) native wrapper around the same web UI — small, fast binaries using the OS's system WebView instead of bundling a browser.
    - **Linux**: `.AppImage`, `.deb`, `.rpm`, plus store packaging for **Flathub** and the **Snap Store** (see `apps/desktop/flatpak/` and `apps/desktop/snap/`).
    - **Windows**: NSIS/MSI installer, distributed directly (no Microsoft Store).
- **Monetization & Community Support**: Integrated **Ko-fi** button for voluntary donations and community support.

---

## ☕ Support the Project (Ko-fi)

If you enjoy playing SudoVerse and want to support its open-source development, consider buying a coffee on Ko-fi:

👉 **[Support SudoVerse on Ko-fi](https://ko-fi.com)**

---

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js** v22 or higher (v20 reached end-of-life; CI builds with 22)
- **npm** v10 or higher

### 2. Install Dependencies

```bash
npm install
```

### 3. Run in Development

- **Web App (React + Vite PWA):**

  ```bash
  npm run dev:web
  ```

  Open [http://localhost:5173](http://localhost:5173) in your browser.

- **Mobile App (Android/Expo):**

  ```bash
  npm run dev:mobile
  ```

- **Desktop App (Tauri, requires Rust — see `npm run setup:system`):**

  ```bash
  npm run dev:desktop
  ```

---

## 📂 Project Structure

- **`packages/core`**: Logic engine (rules validator, solver, generator, i18n).
- **`apps/web`**: React-based Web client & PWA.
- **`apps/mobile`**: Expo-based mobile client (Android).
- **`apps/desktop`**: Tauri (Rust) native desktop wrapper for Linux & Windows.
- **`scripts/`**: Monorepo TypeScript automation scripts (`scripts/build.ts`).

---

## 📚 Documentation

For technical guides, system setup, and distribution manuals:

**[Technical Reference Guide (docs/reference.md)](./docs/reference.md)**
