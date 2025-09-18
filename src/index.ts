import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import redirectRoutes from './routes/redirect';
import adminRoutes from './routes/admin';

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Prisma with error handling
let prisma: PrismaClient;
try {
  prisma = new PrismaClient();
  console.log('✅ Prisma Client initialized');
} catch (error: any) {
  console.error('❌ Prisma Client initialization failed:', error);
  process.exit(1);
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Static files
app.use('/static', express.static(path.join(__dirname, '../public')));

// Health check with detailed info
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      port: port
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Simple root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'HAUD Redirect Hub is running!',
    admin: '/admin',
    health: '/health'
  });
});

// Routes
app.use('/', redirectRoutes);
app.use('/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

const server = app.listen(port, async () => {
  console.log(`✅ Server is running on port ${port}`);
  console.log(`🌐 Server URL: http://localhost:${port}`);
  console.log(`📊 Admin Dashboard: http://localhost:${port}/admin`);
  console.log(`📈 Blog Analytics: http://localhost:${port}/admin/analytics`);
  
  // Seed data is handled in npm start script
  
  console.log(`🎯 Ready to track clicks from 6 blogs!`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

export { prisma };