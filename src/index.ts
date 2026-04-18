import express from 'express';
import authRouter from './routes/auth';
import cors from "cors"

import { verifyToken } from './lib/auth';

import cookieParser from 'cookie-parser';
import passport from './lib/passport';
import modulRouter from './routes/modul';
import userRouter from './routes/user';

const app = express();
const APP_PORT = process.env.API_PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(cors({
  origin: process.env.FRONTEND_APP_URL,
  credentials: true
}))

app.get('/', async (req, res) => {
  res
    .json({
      message: 'Welcome to the LMS Express API',
    })
    .status(200);
});

app.use('/auth', authRouter);
app.use('/modul', modulRouter);
app.use('/user', userRouter)

app.use('/protected', verifyToken, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: req.user,
  });
});

app.listen(APP_PORT, () => {
  console.log(`Server is running on port ${APP_PORT}`);
});
