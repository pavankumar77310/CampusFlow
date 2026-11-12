import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import { seedDatabase } from './utils/seed.js';

// Route Handlers
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// Core Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'CampusFlow API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statsRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server only after database is connected
const startServer = async () => {
  try {
    await connectDB();
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('ℹ️ Empty database detected. Auto-populating initial academic demo data...');
        await seedDatabase(false);
      }
    } catch (err) {
      console.warn('Seeding check warning:', err.message);
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 CampusFlow Backend Server running on port ${PORT} [Mode: ${process.env.NODE_ENV || 'development'}]`);
      console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`);
    });

    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection Error:', err);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;
