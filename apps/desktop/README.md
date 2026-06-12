# SudoVerse Desktop Application

Native desktop wrapper for **SudoVerse** built using **Tauri** and **Rust**. It packages the React web application for standalone Windows and Linux desktop environments.

## Features

- Low memory footprint utilizing the system WebView.
- Standalone compilation binaries (`.exe` on Windows, `.AppImage`, `.deb`, `.rpm` on Linux).
- Flatpak compilation base included.

## Development

1. Install dependencies from the monorepo root:
   ```bash
   npm install
   ```
2. Run Tauri in development mode:
   ```bash
   npm run dev:desktop
   ```

## Build Native Binaries

```bash
npm --workspace @sudoku/desktop run tauri:build
```

The compiled bundles will be generated inside the `src-tauri/target/release/bundle/` directory.
