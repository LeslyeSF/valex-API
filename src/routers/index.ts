import { Router } from "express";
import cardRouters from "./cardRouters.js";
import paymentRouters from "./paymentRouters.js";
import rechargeRouters from "./rechargeRouters.js";

const router = Router();

router.use(cardRouters);
router.use(rechargeRouters);
router.use(paymentRouters);

export default router;
