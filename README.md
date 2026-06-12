# SudoVerse Monorepo

Unified, multi-platform Sudoku platform with a shared rules and logic engine, available for **Web**, **Android (Mobile)**, and **Desktop (Windows/Linux)**.

## Key Features

- **Shared Core Engine**: Business logic, solvers, generators, and validators are packed in a single TypeScript package (`@sudoku/core`).
- **8 Game Variants**: Native support for Classic, Diagonal (X), Killer, Hyper (Windoku), Jigsaw (Irregular), Sandwich, Thermo, and Arrow Sudokus.
- **Dynamic Internationalization (i18n)**: Full English and Spanish localization, translating UI buttons, labels, and even board diagnostics dynamically.
- **Cross-Platform**:
  - **Web Client**: Responsive React + Vite application (configured as a PWA).
  - **Mobile Client**: Expo + React Native application compiling natively to Android.
  - **Desktop Client**: Tauri wrapper packaging the web app for native Windows and Linux builds.

---

## Quick Start

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js** v20 or higher
- **npm** v10 or higher

### 2. Install Dependencies
Install all monorepo dependencies from the root directory:
```bash
npm install
```

### 3. Run in Development

- **Web App (React + Vite):**
  ```bash
  npm run dev:web
  ```
  Open [http://localhost:5173](http://localhost:5173).

- **Mobile App (Android/Expo):**
  ```bash
  npm run dev:mobile
  ```

- **Desktop App (Tauri wrapper):**
  ```bash
  npm run dev:desktop
  ```

---

## Project Structure

The monorepo is divided into the following workspaces:

- **`packages/core`**: The logic layer (rules validator, recursive backtracking solver, and procedural generator).
- **`packages/ui`**: Shared UI design components.
- **`apps/web`**: React-based web client and PWA.
- **`apps/mobile`**: Expo-based mobile client.
- **`apps/desktop`**: Tauri desktop client wrapper.
- **`scripts/`**: Development environment configuration and compiler scripts.

---

## Documentation

For technical guides, system configurations, and compilation targets, see:

**[Technical Reference Guide (docs/reference.md)](./docs/reference.md)**
