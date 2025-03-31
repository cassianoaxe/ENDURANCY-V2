import { execSync } from 'child_process';

// Set environment to production
process.env.NODE_ENV = 'production';

// Start the server
console.log('Starting production server...');
execSync('node dist/index.js', { stdio: 'inherit' });