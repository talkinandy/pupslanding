const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateSocialPreview() {
  try {
    // Read the SVG file
    const svgBuffer = await fs.readFile(path.join(process.cwd(), 'public/images/pups-logo.svg'));
    
    // Create a text overlay SVG
    const textSvg = Buffer.from(`
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <text 
          x="600" 
          y="500" 
          font-family="Arial, sans-serif" 
          font-size="48" 
          font-weight="bold" 
          fill="white" 
          text-anchor="middle"
          dominant-baseline="middle"
        >
          Advanced Runes Trading Bot for Odin
        </text>
      </svg>
    `);
    
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
          top: 65, // Moved up to make room for text
          left: 400,
          width: 400,
          height: 400,
        },
        {
          input: textSvg,
          top: 0,
          left: 0,
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