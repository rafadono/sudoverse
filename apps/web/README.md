# SudoVerse Web Application

Responsive React + Vite web client for **SudoVerse**, sharing logic and rules verification with the native mobile app via `@sudoku/core`.

## Features
- Fully responsive layout matching desktop, tablet, and mobile browsers.
- Progressive Web App (PWA) capabilities for offline gameplay and browser installation.
- Dynamic English and Spanish localization.
- Keyboard navigation and cell selection.

## Running Locally

1. Install dependencies from the monorepo root:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev:web
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build Production Bundle

```bash
npm run build:web
```
This compiles the output into the `dist/` directory.
