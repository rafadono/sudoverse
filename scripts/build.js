const childProcess = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

function run(cmd, dir = projectRoot, env = {}) {
  console.log(`> Running: ${cmd}`);
  childProcess.execSync(cmd, {
    cwd: dir,
    stdio: 'inherit',
    env: { ...process.env, ...env }
  });
}

const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  printHelp();
  process.exit(0);
}

switch (command) {
  case 'bootstrap': {
    const skipInstall = args.includes('--skip-install');
    if (!skipInstall) {
      console.log('Installing npm dependencies...');
      run('npm install');
    }
    console.log('Bootstrap completed.');
    break;
  }
  case 'web': {
    console.log('Compiling web application...');
    run('npm --workspace @sudoku/web run build');
    console.log('Build web completed.');
    break;
  }
  case 'desktop': {
    console.log('Compiling desktop application (Tauri wrapper)...');
    run('npm --workspace @sudoku/web run build');
    run('npm --workspace @sudoku/desktop run tauri:build');
    console.log('Build desktop completed.');
    break;
  }
  case 'android': {
    console.log('Compiling android application (Expo native prebuild & gradle build)...');
    const mobileDir = path.join(projectRoot, 'apps', 'mobile');
    run('npx expo prebuild --platform android', mobileDir, { CI: '1' });
    const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
    run(`${gradlew} assembleRelease`, path.join(mobileDir, 'android'));
    console.log('Build android completed.');
    break;
  }
  case 'flatpak': {
    console.log('Building Flatpak wrapper...');
    try {
      childProcess.execSync('flatpak-builder --version', { stdio: 'ignore' });
    } catch (e) {
      console.error('Error: flatpak-builder is not installed on the system.');
      process.exit(1);
    }
    const ymlPath = 'apps/desktop/flatpak/com.sudokuvariant.app.yml';
    run(`flatpak-builder build-dir ${ymlPath} --force-clean`);
    run(`flatpak-builder --user --install --force-clean build-dir ${ymlPath}`);
    console.log('Flatpak build and installation completed.');
    break;
  }
  case 'setup-system': {
    console.log('Configuring development environment setup dependencies...');
    const psArgs = [];
    const shArgs = [];

    args.slice(1).forEach(arg => {
      if (arg === '--skip-project-deps') {
        psArgs.push('-SkipProjectDeps');
        shArgs.push('--skip-project-deps');
      } else if (arg === '--skip-android') {
        psArgs.push('-SkipAndroid');
        shArgs.push('--skip-android');
      } else if (arg === '--skip-windows-build-tools') {
        psArgs.push('-SkipWindowsBuildTools');
      } else {
        psArgs.push(arg);
        shArgs.push(arg);
      }
    });

    if (process.platform === 'win32') {
      run(`powershell -ExecutionPolicy Bypass -File scripts/setup/windows.ps1 ${psArgs.join(' ')}`);
    } else if (process.platform === 'darwin') {
      run(`bash scripts/setup/macos.sh ${shArgs.join(' ')}`);
    } else {
      run(`bash scripts/setup/linux.sh ${shArgs.join(' ')}`);
    }
    console.log('System setup completed.');
    break;
  }
  case 'all': {
    console.log('Building all workspaces...');
    run('npm install');
    run('npm --workspace @sudoku/web run build');
    run('npm --workspace @sudoku/desktop run tauri:build');

    if (args.includes('--with-android')) {
      const mobileDir = path.join(projectRoot, 'apps', 'mobile');
      run('npx expo prebuild --platform android', mobileDir, { CI: '1' });
      const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
      run(`${gradlew} assembleRelease`, path.join(mobileDir, 'android'));
    }

    if (args.includes('--with-flatpak')) {
      const ymlPath = 'apps/desktop/flatpak/com.sudokuvariant.app.yml';
      run(`flatpak-builder build-dir ${ymlPath} --force-clean`);
      run(`flatpak-builder --user --install --force-clean build-dir ${ymlPath}`);
    }
    console.log('All builds completed successfully.');
    break;
  }
  default: {
    console.error(`Unknown build target: "${command}"\n`);
    printHelp();
    process.exit(1);
  }
}

function printHelp() {
  console.log('SudoVerse Monorepo Build Tool');
  console.log('Usage: node scripts/build.js <command> [options]\n');
  console.log('Commands:');
  console.log('  bootstrap          Installs monorepo npm dependencies');
  console.log('  web                Compiles the responsive React web client');
  console.log('  desktop            Compiles web assets and packages desktop app (Tauri)');
  console.log('  android            Runs Expo prebuild and compiles Android Release APK');
  console.log('  flatpak            Compiles desktop app into a Flatpak package');
  console.log('  setup-system       Configures native packages and dependencies for the host OS');
  console.log('  all                Compiles web and desktop (optionally android/flatpak via flags)\n');
  console.log('Options:');
  console.log('  --skip-install     Used with bootstrap to skip installing dependencies');
  console.log('  --with-android     Used with all to run Android compilation');
  console.log('  --with-flatpak     Used with all to run Flatpak packaging');
}
