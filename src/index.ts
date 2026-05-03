import express from 'express';
import routes from './routes/index';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from './lib/passport';
import { verifyToken } from './lib/auth';

const app = express();
const APP_PORT = process.env.API_PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(
  cors({
    origin: process.env.FRONTEND_APP_URL,
    credentials: true,
  }),
);

app.get('/', async (req, res) => {
  res.status(200).json({
    message: 'Welcome to the LMS Express API',
  });
});

app.use('/', routes);

app.use('/protected', verifyToken, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: req.user,
  });
});

// Express error handler middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[EXPRESS ERROR]', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    message,
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  console.warn(`[404] Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler untuk unhandled errors
process.on('uncaughtException', (error) => {
  console.error('[FATAL ERROR] Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(
    '[FATAL ERROR] Unhandled Rejection at:',
    promise,
    'reason:',
    reason,
  );
  process.exit(1);
});

// Start server dengan error handling
const server = app.listen(APP_PORT, () => {
  console.log(`Server is running on port ${APP_PORT}`);
});

server.on('error', (error: any) => {
  console.error('[SERVER ERROR] Failed to start server:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${APP_PORT} is already in use. Try a different port.`);
  }
  process.exit(1);
});
export default app;
