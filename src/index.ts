import express from 'express';
import { prisma } from './lib/prisma';

const app = express();
const APP_PORT = process.env.API_PORT || 3000;

app.use(express.json());

app.get('/', async (req, res) => {
  res
    .json({
      message: 'Welcome to the LMS Express API',
    })
    .status(200);
});

app.listen(APP_PORT, () => {
  console.log(`Server is running on port ${APP_PORT}`);
});
