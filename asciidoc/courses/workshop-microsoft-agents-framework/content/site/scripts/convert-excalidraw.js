#!/usr/bin/env node

/**
 * Convert Excalidraw JSON files to SVG and PNG formats using puppeteer.
 * Loads the official Excalidraw library in a headless browser to render outputs.
 *
 * Usage: cd site && node scripts/convert-excalidraw.js
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const IMAGES_DIR = path.join(__dirname, '..', 'modules', 'ROOT', 'images');

const HTML_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@excalidraw/excalidraw@0.17.6/dist/excalidraw.production.min.js"></script>
</head>
<body>
  <div id="app"></div>
  <script>
    window.convertToSVG = async function(excalidrawData) {
      try {
        const { exportToSvg } = window.ExcalidrawLib;
        const { elements, appState, files } = excalidrawData;

        const svg = await exportToSvg({
          elements: elements || [],
          appState: {
            ...appState,
            exportWithDarkMode: false,
            exportBackground: true,
          },
          files: files || null,
        });

        return svg.outerHTML;
      } catch (error) {
        console.error('Error in convertToSVG:', error);
        throw error;
      }
    };

    window.convertToBlob = async function(excalidrawData) {
      try {
        const { exportToBlob } = window.ExcalidrawLib;
        const { elements, appState, files } = excalidrawData;

        const blob = await exportToBlob({
          elements: elements || [],
          appState: {
            ...appState,
            exportWithDarkMode: false,
            exportBackground: true,
          },
          files: files || null,
          mimeType: 'image/png',
          quality: 1,
        });

        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('Error in convertToBlob:', error);
        throw error;
      }
    };

    window.conversionReady = true;
  </script>
</body>
</html>
`;

async function convertExcalidraw(page, inputFile) {
  try {
    const baseName = path.basename(inputFile, '.excalidraw');
    console.log(`Converting ${baseName}...`);

    const excalidrawData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

    const svgString = await page.evaluate((data) => {
      return window.convertToSVG(data);
    }, excalidrawData);

    const svgPath = path.join(path.dirname(inputFile), `${baseName}.svg`);
    fs.writeFileSync(svgPath, svgString);
    console.log(`  Created ${baseName}.svg`);

    const pngBase64 = await page.evaluate((data) => {
      return window.convertToBlob(data);
    }, excalidrawData);

    const pngPath = path.join(path.dirname(inputFile), `${baseName}.png`);
    fs.writeFileSync(pngPath, Buffer.from(pngBase64, 'base64'));
    console.log(`  Created ${baseName}.png`);

    return true;
  } catch (error) {
    console.error(`  Error converting ${path.basename(inputFile)}:`);
    console.error(`    ${error.message}`);
    return false;
  }
}

async function convertAll() {
  console.log('Converting Excalidraw diagrams to SVG + PNG...\n');

  const files = fs.readdirSync(IMAGES_DIR)
    .filter(file => file.endsWith('.excalidraw'))
    .sort();

  if (files.length === 0) {
    console.log('No .excalidraw files found in modules/ROOT/images/.');
    return;
  }

  console.log(`Found ${files.length} diagram(s) to convert.\n`);

  console.log('Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(HTML_TEMPLATE);
  await page.waitForFunction(() => window.conversionReady === true, { timeout: 30000 });
  console.log('Excalidraw library loaded.\n');

  let successCount = 0;

  for (const file of files) {
    const inputPath = path.join(IMAGES_DIR, file);

    const success = await convertExcalidraw(page, inputPath);
    if (success) successCount++;
  }

  await browser.close();

  console.log(`\nConversion complete: ${successCount}/${files.length} files converted successfully.`);
  console.log(`Output directory: ${IMAGES_DIR}\n`);

  if (successCount < files.length) {
    process.exit(1);
  }
}

convertAll().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
