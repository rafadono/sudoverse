# SudoVerse - Technical Reference Guide

This consolidated guide provides technical details, application architecture, automation scripts, system requirements, cross-platform feasibility, and monetization strategy.

---

## 1. Technical Architecture

The project is structured as an NPM monorepo with the following architecture:

### Project Layers

1. **`packages/core`** (Shared Core)
   - Contains the pure business logic and the Sudoku game engine.
   - Official Sudoku rule validator (row, column, 3x3 grid).
   - Validators for 8 variants: Diagonals, Killer Cages, Hyper quadrants, Jigsaw (irregular regions), Sandwich (border sums), Thermo (progressive increments), and Arrow (arrow sums).
   - Optimized recursive backtracking solver.
   - Dynamic and unified generator for all variants and difficulties.

2. **`apps/web`** (React + Vite Web Application)
   - Responsive, installable PWA (manifest + service worker via `vite-plugin-pwa`).
   - Puzzle generation runs in a dedicated Web Worker (`src/workers/`) so it never
     blocks the main thread — this also applies unchanged inside the Tauri
     desktop shell, since its WebView supports Web Workers like any browser.
   - Components memoized (`React.memo`) and app logic split into hooks
     (`src/hooks/`) to avoid re-rendering the board on every timer tick.

3. **`apps/mobile`** (React Native + Expo Mobile Application)
   - Mobile application compiling natively to Android using the shared rules and
     logic engine from core.
   - Mirrors the web client's architecture: a memoized board component
     (`src/components/`), extracted hooks (`src/hooks/`), the same
     `puzzlePoolManager` for pre-generated puzzles, and persistent best times
     via `AsyncStorage` (no Web Worker equivalent — React Native has no
     browser Worker API).

4. **`apps/desktop`** (Tauri Native Desktop Wrapper)
   - Wraps the built `apps/web` bundle in a Rust/Tauri shell using the OS's system WebView (WebView2 on Windows, WebKitGTK on Linux) instead of bundling a browser.
   - `src-tauri/`: Rust project + `tauri.conf.json` (window, bundle targets: AppImage/deb/rpm/NSIS/MSI).
   - `flatpak/`: Flathub manifest, desktop entry, and AppStream metainfo.
   - `snap/`: Snapcraft manifest for the Snap Store.

---

## 2. Automation and Compilation

We have a series of cross-platform scripts within the `scripts/` directory to facilitate development and deployment tasks:

### Script List

- **`bootstrap`**: Configures the environment and installs monorepo dependencies (`npm install`).
- **`build-web`**: Compiles the responsive web application (`apps/web/dist`).
- **`build-android`**: Compiles and generates the release APK file for Android.
- **`build-desktop`**: Compiles native Tauri bundles for the host OS (AppImage/deb/rpm on Linux, NSIS/MSI on Windows).
- **`build-all`**: Runs the complete monorepo compilation sequence (web, optionally Android/desktop via `--with-android`/`--with-desktop`).
- **`lint`** / **`lint:fix`**: Runs ESLint (`eslint.config.js`) across every workspace.
- **`typecheck`** / **`test`** / **`format`** / **`format:check`**: `tsc --noEmit` per workspace, Vitest, and Prettier, respectively.

Flatpak (`apps/desktop/flatpak/io.github.rafadono.SudoVerse.yml`) and Snap
(`apps/desktop/snap/snapcraft.yaml`) packages are built independently with
`flatpak-builder` / `snapcraft` respectively — see `apps/desktop/README.md`.

### Quick Commands (NPM)

| Action                   | Windows (PowerShell)    | Linux / macOS (Bash)    |
| :----------------------- | :---------------------- | :---------------------- |
| **Install Dependencies** | `npm run bootstrap`     | `npm run bootstrap`     |
| **Compile Web**          | `npm run build:web`     | `npm run build:web`     |
| **Compile Android**      | `npm run build:android` | `npm run build:android` |
| **Compile Desktop**      | `npm run build:desktop` | `npm run build:desktop` |
| **Compile All**          | `npm run build:all`     | `npm run build:all`     |

---

## 3. Development Environment Configuration

`npm run setup:system` installs, per host OS, everything needed to build every
target including the Tauri desktop app: Node.js, the Rust toolchain, Android
SDK/JDK, and native Tauri build dependencies (WebKitGTK + friends on Linux via
`flatpak`/`flatpak-builder`/`snap`; WebView2 Runtime + Visual Studio Build
Tools on Windows).

System installation and configuration scripts are located at:

- Linux: `scripts/setup/linux/*.sh`
- Windows: `scripts/setup/win/*.ps1`

### Running System Configuration

- **Windows:** `npm run setup:system`
- **Linux:** `sudo npm run setup:system`
- **macOS:** `npm run setup:system`

---

## 4. Continuous Integration (GitHub Actions)

Two workflows run on every push to `main` (and on pull requests, for the first one):

- **`ci.yml`** ("CI Code Quality"): typecheck → lint (ESLint) → tests (Vitest)
  → on `push`, auto-formats with Prettier and commits the result; on
  `pull_request`, only checks formatting instead of committing to someone
  else's branch.
- **`build-apps.yml`** ("Build Apps"): builds every distributable artifact —
  `web` (Vite build), `desktop-linux` (AppImage/.deb/.rpm), `desktop-windows`
  (NSIS/MSI), `desktop-snap` (Snap Store package), `desktop-flatpak` (Flathub
  package), and `android-apk` (release APK).

### Caching and known limitations

- `desktop-linux`/`desktop-windows` cache the Cargo registry and `target/` via
  `Swatinem/rust-cache`; `android-apk` caches Gradle via
  `gradle/actions/setup-gradle`. A cache miss (e.g. after a `Cargo.lock`
  change) still means a full cold compile.
- `desktop-snap` builds with `SNAPCRAFT_BUILD_ENVIRONMENT: host` (directly on
  the runner, skipping snapcraft's default LXD container) and
  `tauri build --no-bundle` (the snap only needs the compiled binary, not the
  AppImage/deb/rpm bundles Tauri would otherwise also produce — and download
  ~300MB of linuxdeploy tooling for), with its own Rust/`target` cache keyed
  on `Cargo.lock`.
- `desktop-flatpak` is `continue-on-error: true` and will keep failing until
  Cargo's dependencies are vendored for flatpak-builder's network-disabled
  build sandbox — see the TODO comment in
  `apps/desktop/flatpak/io.github.rafadono.SudoVerse.yml` for the exact
  one-time command to generate that.

---

## 5. Game Variants and Mechanics

The Sudoku engine natively supports 8 variants:

1. **Classic:** Standard 9x9 rules with traditional quadrants.
2. **Diagonal (Sudoku X):** Both main diagonals contain digits 1 through 9 without repetitions.
3. **Killer Sudoku:** Board divided into cages with target sums. No repeating numbers are allowed within the same cage, and the sum must match the target.
4. **Hyper Sudoku (Windoku):** Adds 4 shaded 3x3 subgrids at fixed coordinates (rows/columns 1-3 and 5-7).
5. **Jigsaw (Irregular):** Traditional 3x3 subgrids are replaced by irregular interconnected shapes generated dynamically using a flood-fill seed expansion algorithm.
6. **Sandwich Sudoku:** Outer clues dictate the sum of the numbers sandwiched between the cells containing the `1` and the `9` in each row/column.
7. **Thermo Sudoku:** Thermometer shapes on the grid where values must strictly increase from the bulb to the tip.
8. **Arrow Sudoku:** Cells forming arrows whose digits must sum up exactly to the value in the starting circle.

---

## 6. Monetization Strategy

Recommended business model: **Freemium**

1. **Mobile Platform (Android):**
   - AdMob integration (banner ads and rewarded ads to grant extra hints).
   - One-time In-App Purchase to remove ads permanently.
   - Special level packs and pro variants.

2. **Web Platform (PWA):**
   - Stripe for monthly/annual Premium subscriptions providing coaching and advanced statistics.

---

## 7. Procedural Generation Algorithms and High Scores System

To achieve infinite replayability, the project uses mathematical algorithms at runtime:

### Generator Algorithms

1. **Jigsaw Irregular Partitioning (Flood-Fill):**
   - The generator seeds 9 random cells on the board.
   - In each iteration, it concurrently expands the boundaries of each region to empty adjacent cells.
   - If the algorithm detects a block or if any region does not reach exactly 9 cells, it discards the map and performs a complete backtrack, ensuring a connected and balanced irregular partition.

2. **Thermometers (Thermo Progression):**
   - The algorithm selects a starting point (bulb) and expands the path in a random direction (up, down, left, right), ensuring that the destination cell value in the solution matrix is strictly greater than the current cell ($V_{next} > V_{current}$). This generates logically valid thermometers on the solution.

3. **Arrows (Arrow DFS):**
   - Selects a cell with a high value ($\ge 3$) for the circle.
   - Applies a Depth-First Search (DFS) to find a contiguous path of cells (length 2 to 3) whose values in the solution sum up exactly to the value in the circle.

4. **Killer Cages:**
   - procedurally groups neighboring cells into cages of 2 to 3 elements, ensuring no duplicate digits exist in each cage, and accumulating the corresponding sums.

### High Scores System (Best Times)

- **Web App:** Persistent storage in the browser using `localStorage` with the naming scheme `sudoku-record-${variant}-${difficulty}`. Upon solving a board without conflicts, the timer stops and compares the time in seconds. If it is lower than the previous record, it updates in memory and disk, displaying a **New personal record** badge.
- **Mobile App:** Persistent storage on-device via `AsyncStorage` with the same naming scheme `sudoku-record-${variant}-${difficulty}`, displaying the best times achieved by the user based on the selected variant and difficulty level.
