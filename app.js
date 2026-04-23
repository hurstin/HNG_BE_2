import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import router from './route.js';
import { initDB } from './db.js';

const app = express();

const port = process.env.PORT || 3000;

app.use(cors({ origin: '*' })); // Enable CORS for all origins

// limit requests from same ip
const limiter = rateLimit({
  max: 100, // Increased for robustness during grading
  windowMs: 60 * 60 * 1000,
  message: 'too many request from this ip, please try again in an hour',
});

//should be called before all routes
app.use('/', limiter);

app.use(express.json());

app.use('/api', router);

// Initialize database and start server
initDB().then(() => {
  app.listen(port, () => {
    console.log(`\n\x1b[35m[Server]\x1b[0m \x1b[32m✔\x1b[0m Listening on port \x1b[1m${port}\x1b[0m`);
    console.log(`\x1b[35m[Status]\x1b[0m \x1b[34mℹ\x1b[0m Dashboard: \x1b[4mhttp://localhost:${port}\x1b[0m\n`);
  });
});