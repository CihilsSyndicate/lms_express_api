import express from 'express';
import authRouter from './routes/auth';
import cors from 'cors';

import { verifyToken } from './lib/auth';

import cookieParser from 'cookie-parser';
import passport from './lib/passport';
import modulRouter from './routes/modul';
import userRouter from './routes/user';
import materiRouter from './routes/materi';
import submateriRouter from './routes/submateri';
import topikRouter from './routes/topik';
import pretestRouter from './routes/pretest';
import posttestRouter from './routes/posttest';
import progressRouter from './routes/progress';
import certificateRouter from './routes/certificate';
import docsRouter from './routes/docs';

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

// API Documentation
app.use('/api-docs', docsRouter);

app.use('/auth', authRouter);
app.use('/modul', modulRouter);
app.use('/user', userRouter);
app.use('/materi', materiRouter);
app.use('/submateri', submateriRouter);
app.use('/topik', topikRouter);
app.use('/pretest', pretestRouter);
app.use('/posttest', posttestRouter);
app.use('/progress', progressRouter);
app.use('/certificate', certificateRouter);

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
// const server = app.listen(APP_PORT, () => {
//   console.log(`Server is running on port ${APP_PORT}`);
// });

// server.on('error', (error: any) => {
//   console.error('[SERVER ERROR] Failed to start server:', error);
//   if (error.code === 'EADDRINUSE') {
//     console.error(`Port ${APP_PORT} is already in use. Try a different port.`);
//   }
//   process.exit(1);
// });
export default app;
