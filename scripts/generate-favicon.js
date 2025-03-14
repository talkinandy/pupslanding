const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateFavicons() {
  const inputFile = path.join(process.cwd(), 'public/images/pups-logo.svg');
  const outputDir = path.join(process.cwd(), 'public/favicon');

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Define sizes for different favicon versions
  const sizes = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'apple-touch-icon.png': 180,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512
  };

  // Generate PNG files in different sizes
  for (const [filename, size] of Object.entries(sizes)) {
    await sharp(inputFile)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, filename));
    
    console.log(`Generated ${filename}`);
  }

  // Generate ICO file (16x16 and 32x32 combined)
  const favicon16Buffer = await sharp(inputFile)
    .resize(16, 16)
    .png()
    .toBuffer();

  const favicon32Buffer = await sharp(inputFile)
    .resize(32, 32)
    .png()
    .toBuffer();

  // Write the ICO file
  await sharp(favicon32Buffer)
    .toFile(path.join(outputDir, 'favicon.ico'));

  console.log('Generated favicon.ico');
}

generateFavicons().catch(console.error); 