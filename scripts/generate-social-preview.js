const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateSocialPreview() {
  try {
    // Read the SVG file
    const svgBuffer = await fs.readFile(path.join(process.cwd(), 'public/images/pups-logo.svg'));
    
    // Create a 1200x630 image (standard social media preview size)
    await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 4,
        background: { r: 5, g: 116, b: 249 } // #0574f9 background
      }
    })
      .composite([
        {
          input: svgBuffer,
          top: 115, // Center vertically (630 - 400) / 2
          left: 400, // Center horizontally (1200 - 400) / 2
          width: 400,
          height: 400,
        }
      ])
      .png()
      .toFile(path.join(process.cwd(), 'public/images/social-preview.png'));

    console.log('Social preview image generated successfully!');
  } catch (error) {
    console.error('Error generating social preview:', error);
    process.exit(1);
  }
}

generateSocialPreview(); 