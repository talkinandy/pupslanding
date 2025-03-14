#!/bin/bash

# Create necessary directories
mkdir -p public/images/social
mkdir -p public/images/features

# Download logo and brand images
curl -o public/images/logo.svg "https://raw.githubusercontent.com/pupstoken/website-assets/main/logo.svg"

# Download hero section images
curl -o public/images/hero-character.svg "https://raw.githubusercontent.com/pupstoken/website-assets/main/hero-character.svg"
curl -o public/images/cloud-1.svg "https://raw.githubusercontent.com/pupstoken/website-assets/main/cloud-1.svg"
curl -o public/images/cloud-2.svg "https://raw.githubusercontent.com/pupstoken/website-assets/main/cloud-2.svg"
curl -o public/images/cloud-3.svg "https://raw.githubusercontent.com/pupstoken/website-assets/main/cloud-3.svg"
curl -o public/images/floating-character.svg "https://raw.githubusercontent.com/pupstoken/website-assets/main/floating-character.svg"

# Download feature section images (using placeholder emoji SVGs for now)
curl -o public/images/features/trading.svg "https://raw.githubusercontent.com/pupstoken/website-assets/main/features/trading.svg"
curl -o public/images/features/btc.svg "https://raw.githubusercontent.com/pupstoken/website-assets/main/features/btc.svg"
curl -o public/images/features/scanner.svg "https://raw.githubusercontent.com/pupstoken/website-assets/main/features/scanner.svg"
curl -o public/images/features/pnl.svg "https://raw.githubusercontent.com/pupstoken/website-assets/main/features/pnl.svg"
curl -o public/images/features/tpsl.svg "https://raw.githubusercontent.com/pupstoken/website-assets/main/features/tpsl.svg"
curl -o public/images/features/copy.svg "https://raw.githubusercontent.com/pupstoken/website-assets/main/features/copy.svg"

# Download about section images
curl -o public/images/about-characters.svg "https://web-assets.same.dev/3868614272/236860049.svg+xml"
curl -o public/images/swimming-characters.svg "https://web-assets.same.dev/883269295/1949714165.svg+xml"

# Download tokenomics section images
curl -o public/images/tokenomics-chart.svg "https://web-assets.same.dev/3462673886/3876976203.svg+xml"
curl -o public/images/fish-character.svg "https://web-assets.same.dev/3160816340/757850757.svg+xml"

# Download FAQ section images
curl -o public/images/faq-character.svg "https://web-assets.same.dev/3838168781/1088124287.svg+xml"

# Download social icons
curl -o public/images/social/twitter.svg "https://raw.githubusercontent.com/pupstoken/website-assets/main/social/twitter.svg"
curl -o public/images/social/telegram.svg "https://raw.githubusercontent.com/pupstoken/website-assets/main/social/telegram.svg"
curl -o public/images/social/discord.svg "https://raw.githubusercontent.com/pupstoken/website-assets/main/social/discord.svg"
curl -o public/images/social/github.svg "https://raw.githubusercontent.com/pupstoken/website-assets/main/social/github.svg"

# Make the script executable
chmod +x scripts/download-images.sh 