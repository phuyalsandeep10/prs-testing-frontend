#!/bin/bash

# Build script for Render deployment
# This script ensures Sharp is properly installed for Linux x64

echo "Starting build process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Ensure Sharp is properly installed for Linux x64
echo "Ensuring Sharp is properly installed for Linux x64..."
npm rebuild sharp --platform=linux --arch=x64

# Build the application
echo "Building the application..."
npm run build

echo "Build completed successfully!" 