import { Router } from "express";
import { onlinePayment, paymentCard } from "../controllers/paymentControllers.js";

const paymentRouters = Router();

paymentRouters.post('/payment', paymentCard);
paymentRouters.post('/payment/online', onlinePayment);

export default paymentRouters;