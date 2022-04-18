import { Router } from "express";
import { rechargeCard } from "../controllers/rechargeControllers.js";
import verifyApiKeyMiddleware from "../middlewares/verifyApiKeyMiddleware.js";

const rechargeRouters = Router();

rechargeRouters.post('/recharge', verifyApiKeyMiddleware, rechargeCard);

export default rechargeRouters;