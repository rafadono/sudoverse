# SudoVerse Mobile Application

Native Android application built using **Expo** and **React Native**, sharing the same rules, solver, and generator core engine from `@sudoku/core`.

## Features
- Native performance and gesture cell inputs.
- Shared TypeScript engine ensuring consistent variant validators.
- Multi-language support (English/Spanish).
- Session-based persistence for personal records and times.

## Running Locally

1. Install dependencies from the monorepo root:
   ```bash
   npm install
   ```
2. Start the Expo development server:
   ```bash
   npm run dev:mobile
   ```
3. Press `a` to open in an Android Emulator or scan the QR code with the Expo Go app.

## Build APK Release

```bash
npm --workspace @sudoku/mobile run build:apk
```
This performs a local prebuild and compiles the native release APK.
