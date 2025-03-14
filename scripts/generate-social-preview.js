const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateSocialPreview() {
  try {
    // Read the PUPS character image
    const pupsJpegBuffer = await fs.readFile(path.join(process.cwd(), 'public/images/pups.jpeg'));
    
    // Create the base image with green background
    const baseImage = await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 4,
        background: { r: 37, g: 173, b: 89 } // #25ad59 - Primary green
      }
    }).png().toBuffer();
    
    // Add subtle grid pattern
    const withPattern = await sharp(baseImage)
      .composite([
        {
          input: Buffer.from(`
            <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
              <rect width="1200" height="630" fill="none"/>
              <rect x="0" y="0" width="1200" height="630" fill="url(#grid)" />
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                </pattern>
              </defs>
            </svg>
          `),
        }
      ])
      .png()
      .toBuffer();
    
    // Prepare the PUPS logo
    const circleMask = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([
        {
          input: Buffer.from(`
            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="100" fill="white" />
            </svg>
          `),
        }
      ])
      .png()
      .toBuffer();
    
    // Process the PUPS image with the circle mask
    const roundedPups = await sharp(pupsJpegBuffer)
      .resize(200, 200)
      .composite([
        {
          input: circleMask,
          blend: 'dest-in'
        }
      ])
      .png()
      .toBuffer();
    
    // Create final image with all elements
    await sharp(withPattern)
      .composite([
        // Logo circle (PUPS character with beanie)
        {
          input: roundedPups,
          top: 100,
          left: 500
        },
        // Text overlay with branding elements
        {
          input: Buffer.from(`
            <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#ffffff" />
                  <stop offset="100%" stop-color="#f0f0f0" />
                </linearGradient>
              </defs>
              
              <!-- Title -->
              <text 
                x="600" 
                y="380" 
                font-family="Arial, sans-serif" 
                font-size="72" 
                font-weight="bold" 
                fill="url(#textGradient)" 
                text-anchor="middle"
                filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.3))"
              >
                PUPS BOT
              </text>
              
              <!-- Subtitle -->
              <text 
                x="600" 
                y="470" 
                font-family="Arial, sans-serif" 
                font-size="36" 
                font-weight="normal" 
                fill="white" 
                text-anchor="middle"
                filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.2))"
              >
                Advanced Runes Trading Bot for Odin
              </text>
              
              <!-- Features in smaller text -->
              <text 
                x="600" 
                y="540" 
                font-family="Arial, sans-serif" 
                font-size="24" 
                font-weight="normal" 
                fill="rgba(255,255,255,0.9)" 
                text-anchor="middle"
              >
                ⚡ Trading · 📊 Analytics · 🤖 Automation · 💰 Deposits
              </text>
            </svg>
          `),
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