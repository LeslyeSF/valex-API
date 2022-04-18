/* eslint-disable import/no-unresolved */
import dotenv from 'dotenv';
import express, { json } from 'express';
import cors from 'cors';
import "express-async-errors";
import router from './routers/index.js';
import errorMiddlewares from './middlewares/errorMiddlewares.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(json());
app.use(router);
app.use(errorMiddlewares);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Running on ${PORT}`);
});
