#!/bin/bash

# Create necessary directories
mkdir -p public/images
mkdir -p public/images/social
mkdir -p public/images/features

# Download the hero character image you provided
cp hero-character.png public/images/hero-character.png

# Try to download assets from pupstoken.com
echo "Downloading assets from pupstoken.com..."

# Download social icons
curl -s -o public/images/social/twitter.svg "https://www.pupstoken.com/twitter.svg" || echo "Failed to download Twitter icon"
curl -s -o public/images/social/telegram.svg "https://www.pupstoken.com/telegram.svg" || echo "Failed to download Telegram icon"
curl -s -o public/images/social/discord.svg "https://www.pupstoken.com/discord.svg" || echo "Failed to download Discord icon"

# Create feature icons if download fails
echo "Creating feature icons..."
cat > public/images/features/trading.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
  <polyline points="17 6 23 6 23 12"></polyline>
</svg>
EOF

cat > public/images/features/btc.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"></circle>
  <path d="M9 12h6M9 8h6M9 16h6"></path>
  <path d="M14 8v8M10 8v8"></path>
</svg>
EOF

cat > public/images/features/scanner.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="8"></circle>
  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
</svg>
EOF

cat > public/images/features/pnl.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="20" x2="18" y2="10"></line>
  <line x1="12" y1="20" x2="12" y2="4"></line>
  <line x1="6" y1="20" x2="6" y2="14"></line>
</svg>
EOF

cat > public/images/features/tpsl.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"></circle>
  <circle cx="12" cy="12" r="6"></circle>
  <circle cx="12" cy="12" r="2"></circle>
</svg>
EOF

cat > public/images/features/copy.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
  <circle cx="9" cy="7" r="4"></circle>
  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
</svg>
EOF

# Create cloud SVGs
cat > public/images/cloud-1.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" fill="white">
  <path d="M25,75 C10,75 0,65 0,50 C0,35 10,25 25,25 C30,10 45,0 65,0 C90,0 110,20 110,45 C125,45 140,60 140,75 C140,90 125,105 110,105 C110,115 100,120 90,120 L40,120 C30,120 20,115 20,105 C10,105 0,95 0,85 C0,75 10,75 25,75 Z" />
</svg>
EOF

cat > public/images/cloud-2.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 90" fill="white">
  <path d="M20,60 C8,60 0,52 0,40 C0,28 8,20 20,20 C24,8 36,0 52,0 C72,0 88,16 88,36 C100,36 112,48 112,60 C112,72 100,84 88,84 C88,92 80,96 72,96 L32,96 C24,96 16,92 16,84 C8,84 0,76 0,68 C0,60 8,60 20,60 Z" />
</svg>
EOF

cat > public/images/cloud-3.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 70" fill="white">
  <path d="M15,45 C6,45 0,39 0,30 C0,21 6,15 15,15 C18,6 27,0 39,0 C54,0 66,12 66,27 C75,27 84,36 84,45 C84,54 75,63 66,63 C66,69 60,72 54,72 L24,72 C18,72 12,69 12,63 C6,63 0,57 0,51 C0,45 6,45 15,45 Z" />
</svg>
EOF

echo "Asset download and creation complete!"

# Make the script executable
chmod +x scripts/download-assets.sh 