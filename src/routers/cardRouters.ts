import { Router } from "express";
import { activateCard, createCard, transactionsCard } from "../controllers/cardControllers.js";
import verifyApiKeyMiddleware from "../middlewares/verifyApiKeyMiddleware.js";

const cardRouters = Router();

cardRouters.post('/card/create', verifyApiKeyMiddleware, createCard);
cardRouters.post('/card/activate', activateCard);
cardRouters.get('/card/transactions', transactionsCard);
cardRouters.post('/card/block');
cardRouters.post('/card/unblock');

export default cardRouters;