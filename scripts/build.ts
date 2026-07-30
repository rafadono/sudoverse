import * as childProcess from 'node:child_process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function run(
  cmd: string,
  dir: string = projectRoot,
  env: Record<string, string | undefined> = {}
): void {
  console.log(`> Running: ${cmd}`);
  childProcess.execSync(cmd, {
    cwd: dir,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
}

const args: string[] = process.argv.slice(2);
const command: string | undefined = args[0];

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
  case 'android': {
    console.log('Compiling android application (Expo native prebuild & gradle build)...');
    const mobileDir = path.join(projectRoot, 'apps', 'mobile');
    run('npx expo prebuild --platform android', mobileDir, { CI: '1' });
    const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
    run(`${gradlew} assembleRelease`, path.join(mobileDir, 'android'));
    console.log('Build android completed.');
    break;
  }
  case 'desktop': {
    console.log('Compiling desktop application (Tauri native bundles)...');
    run('npm --workspace @sudoku/desktop run tauri:build');
    console.log(
      'Build desktop completed. Bundles are in apps/desktop/src-tauri/target/release/bundle/.'
    );
    break;
  }
  case 'setup-system': {
    console.log('Configuring development environment setup dependencies...');
    const psArgs: string[] = [];
    const shArgs: string[] = [];

    args.slice(1).forEach((arg) => {
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

    if (args.includes('--with-android')) {
      const mobileDir = path.join(projectRoot, 'apps', 'mobile');
      run('npx expo prebuild --platform android', mobileDir, { CI: '1' });
      const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
      run(`${gradlew} assembleRelease`, path.join(mobileDir, 'android'));
    }

    if (args.includes('--with-desktop')) {
      run('npm --workspace @sudoku/desktop run tauri:build');
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

function printHelp(): void {
  console.log('SudoVerse Monorepo Build Tool');
  console.log('Usage: npx tsx scripts/build.ts <command> [options]\n');
  console.log('Commands:');
  console.log('  bootstrap          Installs monorepo npm dependencies');
  console.log('  web                Compiles the responsive React web client');
  console.log('  android            Runs Expo prebuild and compiles Android Release APK');
  console.log('  desktop            Compiles native Tauri bundles (AppImage/deb/rpm/NSIS/MSI)');
  console.log('  setup-system       Configures native packages and dependencies for the host OS');
  console.log('  all                Compiles web (optionally android/desktop via flags)\n');
  console.log('Options:');
  console.log('  --skip-install     Used with bootstrap to skip installing dependencies');
  console.log('  --with-android     Used with all to run Android compilation');
  console.log('  --with-desktop     Used with all to run desktop (Tauri) compilation');
}
