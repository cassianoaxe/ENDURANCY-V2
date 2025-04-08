
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Create dist directory structure if it doesn't exist
const requiredDirs = ['./dist', './dist/public', './dist/public/assets'];
for (const dir of requiredDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Step 1: Build client
console.log('Building client...');
execSync('vite build', { stdio: 'inherit' });

// Step 2: Build server
console.log('Building server...');
execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });

console.log('Build completed successfully!');
