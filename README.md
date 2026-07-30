# SudoVerse 🧩

[![Support on Ko-fi](https://img.shields.io/badge/Support%20on-Ko--fi-ff5e5b?logo=ko-fi&logoColor=white)](https://ko-fi.com)
[![TypeScript](https://img.shields.io/badge/Language-100%25%20TypeScript-3178c6)](https://www.typescriptlang.org/)

Unified, multi-platform Sudoku game with a shared engine for **Web**, **Mobile (Android)**, and **Linux Ecosystem (Debian, Ubuntu, Fedora, Flathub & Snap Store)**.

---

## 🌟 Key Features

- **Pure TypeScript Monorepo**: 100% written in TypeScript without external complex binary dependencies.
- **Shared Core Engine**: Core rules, backtracking solver, procedural puzzle generator, and rule validators encapsulated in `@sudoku/core`.
- **8 Game Variants**: Native support for Classic, Diagonal (X), Killer, Hyper (Windoku), Jigsaw (Irregular), Sandwich, Thermo, and Arrow Sudokus.
- **Dynamic Internationalization (i18n)**: Full English and Spanish localization, translating UI buttons, status messages, and diagnostics dynamically.
- **Linux & Cross-Platform Stores Ready**:
  - **Web Client (PWA)**: Responsive React + Vite application ready for browser install on Debian, Ubuntu, Fedora, Arch, Windows, and macOS.
  - **Linux Distribution & Stores**: Easily publishable to **Flathub**, **Snap Store**, and Linux package managers via Web/PWA or Electron wrappers (100% TS).
  - **Mobile Client**: Expo + React Native application compiling natively to Android.
- **Monetization & Community Support**: Integrated **Ko-fi** button for voluntary donations and community support.

---

## ☕ Support the Project (Ko-fi)

If you enjoy playing SudoVerse and want to support its open-source development, consider buying a coffee on Ko-fi:

👉 **[Support SudoVerse on Ko-fi](https://ko-fi.com)**

---

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js** v20 or higher
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

---

## 📂 Project Structure

- **`packages/core`**: Logic engine (rules validator, solver, generator, i18n).
- **`packages/ui`**: Shared UI design components.
- **`apps/web`**: React-based Web client & PWA.
- **`apps/mobile`**: Expo-based mobile client (Android).
- **`scripts/`**: Monorepo TypeScript automation scripts (`scripts/build.ts`).

---

## 📚 Documentation

For technical guides, system setup, and distribution manuals:

**[Technical Reference Guide (docs/reference.md)](./docs/reference.md)**
