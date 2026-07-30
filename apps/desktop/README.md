# SudoVerse Desktop Application

Native desktop wrapper for **SudoVerse** built using **Tauri** and **Rust**. It packages the React web application for standalone Windows and Linux desktop environments.

## Features

- Low memory footprint utilizing the system WebView (WebView2 on Windows, WebKitGTK on Linux).
- Standalone compilation binaries: `.exe`/`.msi` (NSIS/MSI, no Microsoft Store) on Windows, `.AppImage`, `.deb`, `.rpm` on Linux.
- Store-ready packaging for Linux: `flatpak/` manifest (Flathub) and `snap/snapcraft.yaml` (Snap Store).

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
