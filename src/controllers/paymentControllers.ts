import { Request, Response } from "express";
import { verifyCardForPayment } from "../services/cardServices.js";
import * as paymentRepository from "../repositories/paymentRepository.js";
import { verifyBusiness, verifyBalance } from "../services/paymentServices.js";

export async function paymentCard(req: Request, res: Response) {
  const { cardId, cardPassword, businessId, amount } = req.body;

  if(amount <= 0) throw { type: 'Unauthorized', message: 'The value entered is not valid' };

  const card = await verifyCardForPayment(cardId, cardPassword);

  await verifyBusiness(businessId, card.type);

  await verifyBalance(cardId, amount);

  await paymentRepository.insert({
    cardId,
    businessId,
    amount
  });

  res.sendStatus(201);
}