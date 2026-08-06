import fs from "node:fs";
import path from 'path';
import process from 'node:process';
import readline from 'readline';
import { Writable } from 'stream';
import { spawn, execSync } from 'child_process';
import { clearInterval, setInterval } from 'node:timers';
import os from 'os';
import sizeOf from 'image-size';
import sharp from 'sharp';

// OPTIMIZATION: Because we process files in parallel using Promise.race,
// we restrict sharp to 1 thread per image to prevent CPU thread contention.
sharp.concurrency(1);

// --- UI Helpers ---

function clearLines(count) {
  if (count > 0) {
    readline.moveCursor(process.stdout, 0, -count);
    readline.clearScreenDown(process.stdout);
  }
}

function parseDraggedPaths(input) {
  const regex = /'([^']+)'|"([^"]+)"|((?:\\ |[^ ])+)/g;
  const paths = [];
  let match;
  while ((match = regex.exec(input)) !== null) {
    let p = match[1] || match[2] || match[3];
    if (p) {
      if (match[3]) {
        p = p.replace(/\\(.)/g, '$1');
      }
      paths.push(p);
    }
  }
  return paths;
}

async function promptForPath() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    console.log('  \x1b[36m--- Target File(s) or Directory ---\x1b[0m');
    rl.question('  \x1b[90mDrag and drop file(s) or folder(s) here, then press Enter:\x1b[0m\n  > ', (answer) => {
      rl.close();
      console.log();
      resolve(parseDraggedPaths(answer.trim()));
    });
  });
}

async function promptSingleSelect(title, options) {
  return new Promise((resolve) => {
    let cursor = 0;
    let linesRendered = 0;

    console.log(`  \x1b[36m--- ${title} ---\x1b[0m`);
    console.log('  \x1b[90m(Use arrow keys to navigate, Enter to confirm)\x1b[0m\n');

    const render = () => {
      clearLines(linesRendered);
      let output = '';
      options.forEach((opt, i) => {
        const isHovered = i === cursor;
        const cursorStr = isHovered ? '\x1b[36m➔\x1b[0m' : ' ';
        const boxStr = isHovered ? '\x1b[36m◉\x1b[0m' : '\x1b[90m○\x1b[0m';
        const labelText = isHovered ? `\x1b[1;36m${opt.label}\x1b[0m` : `\x1b[2;37m${opt.label}\x1b[0m`;
        output += `  ${cursorStr}  ${boxStr}  ${labelText}\n`;
      });
      process.stdout.write(output);
      linesRendered = options.length;
    };

    const mutedOut = new Writable({
      write(chunk, encoding, callback) {
        callback();
      }
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: mutedOut,
      terminal: true
    });

    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    process.stdout.write('\x1b[?25l');

    render();

    const keypressHandler = (str, key) => {
      if (key.ctrl && key.name === 'c') {
        process.stdout.write('\x1b[?25h\n');
        process.exit(0);
      }

      if (key.name === 'up') {
        cursor = (cursor > 0) ? cursor - 1 : options.length - 1;
        render();
      } else if (key.name === 'down') {
        cursor = (cursor < options.length - 1) ? cursor + 1 : 0;
        render();
      } else if (key.name === 'return' || key.name === 'enter') {
        process.stdin.removeListener('keypress', keypressHandler);

        if (process.stdin.isTTY) process.stdin.setRawMode(false);

        process.stdout.write('\x1b[?25h\n');
        process.stdin.pause();

        rl.close();

        console.log();

        resolve(options[cursor].value);
      }
    };

    process.stdin.on('keypress', keypressHandler);
  });
}

async function promptForDimension(title) {
  let dimension = await promptSingleSelect(title, [
    { label: '600px', value: 600 },
    { label: '800px', value: 800 },
    { label: '1000px', value: 1000 },
    { label: '1200px', value: 1200 },
    { label: 'Custom...', value: 'custom' }
  ]);

  if (dimension === 'custom') {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      rl.question('  \x1b[36mEnter custom max edge in pixels (e.g. 1500):\x1b[0m ', (ans) => {
        rl.close();
        resolve(ans.trim());
      });
    });

    dimension = parseInt(answer, 10);

    if (isNaN(dimension) || dimension <= 0) {
      console.log('  \x1b[31mInvalid dimension. Defaulting to 1000px.\x1b[0m');
      dimension = 1000;
    }

    console.log();
  }

  return dimension;
}

function getShortPath(fullPath) {
  if (!fullPath) return '';

  const sep = fullPath.includes('\\') ? '\\' : '/';
  const parts = fullPath.split(sep).filter(Boolean);

  if (parts.length <= 3) return fullPath;

  return '...' + sep + parts.slice(-3).join(sep);
}

function printBoxLine(label, value, labelColor = '\x1b[37m', valueColor = '\x1b[37m') {
  const BOX_INNER_WIDTH = 58;
  const LEFT_PADDING = '      ';
  const availableSpace = BOX_INNER_WIDTH - LEFT_PADDING.length;

  const rawString = `${label} ${value}`;
  let displayValue = value;

  if (rawString.length > availableSpace) {
    displayValue = value.slice(0, availableSpace - label.length - 4) + '...';
  }

  const visualLength = label.length + 1 + displayValue.length;
  const rightPadding = ' '.repeat(availableSpace - visualLength);

  console.log(
    `\x1b[32m  │${LEFT_PADDING}${labelColor}${label} ${valueColor}${displayValue}\x1b[0m${rightPadding}\x1b[32m│\x1b[0m`
  );
}

async function promptEndAction() {
  return new Promise((resolve) => {
    console.log('  \x1b[90mPress [Space] to convert more files, or [Enter] to exit.\x1b[0m\n');

    const mutedOut = new Writable({
      write(chunk, encoding, callback) {
        callback();
      }
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: mutedOut,
      terminal: true
    });

    if (process.stdin.isTTY) process.stdin.setRawMode(true);

    const keypressHandler = (str, key) => {
      if (
        (key.ctrl && key.name === 'c') ||
        key.name === 'return' ||
        key.name === 'enter' ||
        key.name === 'escape'
      ) {
        process.stdin.removeListener('keypress', keypressHandler);

        if (process.stdin.isTTY) process.stdin.setRawMode(false);

        rl.close();

        resolve(false);
      } else if (key.name === 'space') {
        process.stdin.removeListener('keypress', keypressHandler);

        if (process.stdin.isTTY) process.stdin.setRawMode(false);

        rl.close();

        resolve(true);
      }
    };

    process.stdin.on('keypress', keypressHandler);
  });
}

function closeTerminalWindow() {
  try {
    execSync(`osascript -e 'tell application "Terminal" to close front window'`);
  } catch {
    process.exit(0);
  }
}

// --- Conversion ---

function convertFile(inputPath, outputPath, dim, quality) {
  return new Promise((resolve, reject) => {
    sharp(inputPath)
      .resize({
        width: dim,
        height: dim,
        fit: 'inside',
        withoutEnlargement: true
      })
      .avif({
        quality: quality,
        effort: 4
      })
      .toFile(outputPath)
      .then(() => resolve())
      .catch(reject);
  });
}

// --- Session Runner ---

async function runSession() {
  console.clear();

  console.log('\n\x1b[33m  ┌────────────────────────────────────────────────────────────┐\x1b[0m');
  console.log('\x1b[33m  │\x1b[0m                   STEVEN CASTEEL // WEB                    \x1b[33m│\x1b[0m');
  console.log('\x1b[33m  │\x1b[0m                    AVIF Image Converter                    \x1b[33m│\x1b[0m');
  console.log('\x1b[33m  └────────────────────────────────────────────────────────────┘\x1b[0m\n');

  // 1. Get Directory or Files

  const targetPaths = await promptForPath();

  if (targetPaths.length === 0) {
    console.log(`  \x1b[31mError: No valid paths provided.\x1b[0m\n`);
    return;
  }

  let filesQueue = [];
  let primaryOutputDir = '';

  for (const p of targetPaths) {
    if (!fs.existsSync(p)) continue;

    const stat = fs.statSync(p);

    // SUPPORTS JPG / PNG / WEBP
    if (stat.isFile() && /\.(jpe?g|png|webp)$/i.test(p)) {
      filesQueue.push(p);

      if (!primaryOutputDir) {
        primaryOutputDir = path.dirname(p);
      }
    } else if (stat.isDirectory()) {
      if (!primaryOutputDir) {
        primaryOutputDir = p;
      }

      const dirFiles = fs.readdirSync(p)
        .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
        .map(f => path.join(p, f));

      filesQueue.push(...dirFiles);
    }
  }

  filesQueue = [...new Set(filesQueue)];

  if (filesQueue.length === 0) {
    console.log(`  \x1b[31mNo .jpg, .png, or .webp files found in the provided targets.\x1b[0m\n`);
    return;
  }

  // 2. Pre-process Aspect Ratios

  const fileData = [];

  let squareCount = 0;
  let nonSquareCount = 0;

  for (const filePath of filesQueue) {
    let isSquare = false;

    try {
      const buffer = fs.readFileSync(filePath);
      const dimensions = sizeOf(buffer);

      if (dimensions.width && dimensions.height) {
        isSquare = Math.abs((dimensions.width / dimensions.height) - 1) < 0.05;
      }
    } catch {
      // ignore
    }

    if (isSquare) {
      squareCount++;
    } else {
      nonSquareCount++;
    }

    fileData.push({
      filePath,
      isSquare,
      fileName: path.basename(filePath)
    });
  }

  const isMixed = squareCount > 0 && nonSquareCount > 0;

  // 3. UI Prompts

  let dimSquare;
  let dimNonSquare;
  let dimension;

  if (isMixed) {
    console.log(
      `  \x1b[35m[!] Mixed aspect ratios detected (${squareCount} Square, ${nonSquareCount} Non-Square).\x1b[0m\n`
    );

    dimSquare = await promptForDimension('Dimensions for SQUARE images (1:1)');
    dimNonSquare = await promptForDimension('Dimensions for NON-SQUARE images');
  } else {
    dimension = await promptForDimension('Target Dimensions (Max Edge)');
  }

  const quality = await promptSingleSelect('Visual Quality / Compression Level', [
    { label: 'Standard (Q: 50) - Good quality, smallest file (Default)', value: 50 },
    { label: 'High     (Q: 65) - Great quality, medium file', value: 65 },
    { label: 'Ultra    (Q: 80) - Best quality, largest file', value: 80 }
  ]);

  const suffix = await promptSingleSelect('Append Size Suffix?', [
    { label: 'Yes, append "_sm" to filename', value: '_sm' },
    { label: 'No suffix', value: '' }
  ]);

  // 4. Queue Preparation

  const queue = [];
  let skipped = 0;

  for (const data of fileData) {
    const ext = path.extname(data.filePath);
    const baseName = path.basename(data.filePath, ext);

    const outName = `${baseName}${suffix}.avif`;

    const fileDir = path.dirname(data.filePath);

    const outputPath = path.join(fileDir, outName);

    if (fs.existsSync(outputPath)) {
      skipped++;
    } else {
      const targetDim = isMixed
        ? (data.isSquare ? dimSquare : dimNonSquare)
        : dimension;

      queue.push({
        inputPath: data.filePath,
        outputPath,
        fileName: data.fileName,
        targetDim
      });
    }
  }

  if (queue.length === 0) {
    console.log(
      `  \x1b[32mAll ${filesQueue.length} files already have matching .avif versions. Nothing to do!\x1b[0m\n`
    );

    return;
  }

  // 5. Processing

  console.log(
    `  \x1b[36mProcessing ${queue.length} file${queue.length === 1 ? '' : 's'} (${skipped} skipped)...\x1b[0m\n`
  );

  let completed = 0;

  let activePromises = [];

  const maxConcurrent = Math.max(1, Math.floor(os.cpus().length / 2));

  let frameIndex = 0;

  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  let currentFileText = '';

  const throbber = setInterval(() => {
    const progress = completed / queue.length;

    const barWidth = 16;

    const filled = Math.floor(progress * barWidth);

    const empty = barWidth - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);

    const percent = Math.round(progress * 100);

    process.stdout.write(
      `\r  \x1b[36m${frames[frameIndex % frames.length]}\x1b[0m \x1b[1m[${bar}]\x1b[0m ${percent}% \x1b[2m| ${currentFileText}\x1b[0m\x1b[K`
    );

    frameIndex++;
  }, 60);

  const processItem = async (item) => {
    currentFileText =
      item.fileName.length > 40
        ? `...${item.fileName.slice(-40)}`
        : item.fileName;

    await convertFile(
      item.inputPath,
      item.outputPath,
      item.targetDim,
      quality
    );

    completed++;
  };

  for (const item of queue) {
    const p = processItem(item).then(() => {
      activePromises.splice(activePromises.indexOf(p), 1);
    });

    activePromises.push(p);

    if (activePromises.length >= maxConcurrent) {
      await Promise.race(activePromises);
    }
  }

  await Promise.all(activePromises);

  clearInterval(throbber);

  process.stdout.write('\r\x1b[K');

  // 6. Completion

  spawn('afplay', ['/System/Library/Sounds/Glass.aiff'], {
    detached: true,
    stdio: 'ignore'
  }).unref();

  if (primaryOutputDir) {
    spawn('open', [primaryOutputDir], {
      detached: true,
      stdio: 'ignore'
    }).unref();
  }

  const exampleFile =
    queue.length > 0
      ? path.basename(queue[0].outputPath)
      : '';

  const shortOutputDir = getShortPath(primaryOutputDir);

  console.clear();

  console.log('\n\x1b[32m  ┌──────────────────────────────────────────────────────────┐\x1b[0m');
  console.log('\x1b[32m  │                                                          │\x1b[0m');
  console.log('\x1b[32m  │               \x1b[1;32m✔  AVIF CONVERSION COMPLETE\x1b[0;32m                │\x1b[0m');
  console.log('\x1b[32m  │                                                          │\x1b[0m');

  printBoxLine(
    'Processed:',
    `${queue.length} file${queue.length === 1 ? '' : 's'}`
  );

  if (skipped > 0) {
    printBoxLine(
      'Skipped:',
      `${skipped} file${skipped === 1 ? '' : 's'}`
    );
  }

  console.log('\x1b[32m  │                                                          │\x1b[0m');

  printBoxLine(
    'Out:',
    shortOutputDir,
    '\x1b[36m',
    '\x1b[37m'
  );

  if (exampleFile) {
    printBoxLine(
      'Ex:',
      exampleFile,
      '\x1b[36m',
      '\x1b[37m'
    );
  }

  console.log('\x1b[32m  │                                                          │\x1b[0m');
  console.log('\x1b[32m  └──────────────────────────────────────────────────────────┘\x1b[0m\n');
}

// --- App Entry Point ---

async function main() {
  while (true) {
    await runSession();

    const shouldRestart = await promptEndAction();

    if (!shouldRestart) {
      closeTerminalWindow();
      break;
    }
  }
}

main().catch(err => {
  console.error('\n  \x1b[31mFatal Error:\x1b[0m', err.message);
  process.exit(1);
});
