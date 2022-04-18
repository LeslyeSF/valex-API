import { Router } from "express";
import { paymentCard } from "../controllers/paymentControllers.js";

const paymentRouters = Router();

paymentRouters.post('/payment', paymentCard);

export default paymentRouters;