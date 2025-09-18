// Simple startup script for Railway
const { exec } = require('child_process');

console.log('Starting HAUD Redirect Hub...');

// Run database setup and start server
exec('npx prisma db push && npx ts-node prisma/seed.ts && node dist/index.js', (error, stdout, stderr) => {
  if (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
  console.log(stdout);
  if (stderr) console.error(stderr);
});
