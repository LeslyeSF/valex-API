import dayjs from "dayjs";
import { Request, Response } from "express";
import { Router } from "express";
import { createCard } from "../controllers/cardControllers.js";
import verifyApiKeyMiddleware from "../middlewares/verifyApiKeyMiddleware.js";

const cardRouters = Router();

cardRouters.post('/card/create', verifyApiKeyMiddleware, createCard);
cardRouters.post('/card/activate', (req: Request, res: Response)=>{
  res.send(dayjs().add(5, 'year').format('MM/YYYY'));
});
cardRouters.get('/card/transactions');

export default cardRouters;