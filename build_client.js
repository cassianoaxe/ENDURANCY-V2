import { execSync } from 'child_process';
import fs from 'fs';

// Create dist directory if it doesn't exist
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist', { recursive: true });
}

// Build client
console.log('Building client...');
execSync('vite build', { stdio: 'inherit' });

console.log('Client build completed successfully!');