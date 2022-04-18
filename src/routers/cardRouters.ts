import { Router } from "express";
import { activateCard, blockCard, createCard, createOnlineCard, transactionsCard, unblockCard } from "../controllers/cardControllers.js";
import verifyApiKeyMiddleware from "../middlewares/verifyApiKeyMiddleware.js";

const cardRouters = Router();

cardRouters.post('/card/create', verifyApiKeyMiddleware, createCard);
cardRouters.post('/card/activate', activateCard);
cardRouters.get('/card/transactions', transactionsCard);
cardRouters.post('/card/block', blockCard);
cardRouters.post('/card/unblock', unblockCard);

cardRouters.post('/card/online/create', createOnlineCard);

export default cardRouters;