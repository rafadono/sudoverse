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

2. **`packages/ui`** (Shared UI)
   - Designed to house reusable UI/design components.

3. **`apps/web`** (React + Vite Web Application)
   - Responsive web application optimized for desktop and mobile. Uses the shared core and SVG vector renderings for overlays.

4. **`apps/mobile`** (React Native + Expo Mobile Application)
   - Mobile application compiling natively to Android using the shared rules and logic engine from core, rendering visual inline indicators.

5. **`apps/desktop`** (Tauri Wrapper Desktop Application)
   - Packages the `apps/web` frontend using Rust and Tauri WebView2/WebKitGTK.

---

## 2. Automation and Compilation

We have a series of cross-platform scripts within the `scripts/` directory to facilitate development and deployment tasks:

### Script List

- **`bootstrap`**: Configures the environment and installs monorepo dependencies (`npm install`).
- **`build-web`**: Compiles the responsive web application (`apps/web/dist`).
- **`build-desktop`**: Compiles native desktop packages (Tauri) for Linux or Windows based on the host operating system.
- **`build-android`**: Compiles and generates the release APK file for Android.
- **`build-flatpak`**: Packages and installs the desktop application in Flatpak format.
- **`build-all`**: Runs the complete monorepo compilation sequence.

### Quick Commands (NPM)

| Action                   | Windows (PowerShell)    | Linux / macOS (Bash)       |
| :----------------------- | :---------------------- | :------------------------- |
| **Install Dependencies** | `npm run bootstrap`     | `npm run bootstrap:sh`     |
| **Compile Web**          | `npm run build:web`     | `npm run build:web`        |
| **Compile Desktop**      | `npm run build:desktop` | `npm run build:desktop:sh` |
| **Compile Android**      | `npm run build:android` | `npm run build:android:sh` |
| **Compile Flatpak**      | `npm run build:flatpak` | `npm run build:flatpak:sh` |
| **Compile All**          | `npm run build:all`     | `npm run build:all:sh`     |

---

## 3. Development Environment Configuration

System installation and configuration scripts are located at:

- Linux: `scripts/setup/linux/*.sh`
- Windows: `scripts/setup/win/*.ps1`

### Running System Configuration

- **Windows:** `npm run setup:windows`
- **Linux:** `sudo npm run setup:linux`
- **macOS:** `npm run setup:macos`

---

## 4. Game Variants and Mechanics

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

## 5. Monetization Strategy

Recommended business model: **Freemium**

1. **Mobile Platform (Android):**
   - AdMob integration (banner ads and rewarded ads to grant extra hints).
   - One-time In-App Purchase to remove ads permanently.
   - Special level packs and pro variants.

2. **Web Platform (PWA):**
   - Stripe for monthly/annual Premium subscriptions providing coaching and advanced statistics.

3. **Desktop Platform (Steam / Itch.io):**
   - One-time premium purchase (no ads by default) with themed DLCs and advanced variants.

---

## 6. Procedural Generation Algorithms and High Scores System

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
- **Mobile App:** Maintains a persistent cache in memory per session, displaying the best times achieved by the user on the mobile board based on the selected variant and difficulty level.
