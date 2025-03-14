#!/bin/bash

# Create directories if they don't exist
mkdir -p public/images

# Download hero character image
curl -o public/images/hero-character.png https://i.imgur.com/JGMx6iP.png

echo "Hero image downloaded successfully!"

# Make the script executable
chmod +x scripts/download-hero.sh 