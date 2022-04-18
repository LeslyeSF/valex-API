import { Request, Response } from "express";
import { verifyCardForPayment } from "../services/cardServices";
import * as businessRepository from "../repositories/businessRepository.js";
import * as paymentRepository from "../repositories/paymentRepository.js";

export async function paymentCard(req: Request, res: Response) {
  const { cardId, cardPassword, businessId, amount } = req.body;

  if(amount <= 0) throw { type: 'Unauthorized', message: 'The value entered is not valid' };

  const card = await verifyCardForPayment(cardId, cardPassword);

  const business = await businessRepository.findById(businessId);
  if(!business) throw { type: 'Not found', message: 'This company is not registered' };
  if(business.type !== card.type) throw { type: 'Unauthorized', message: 'The purchase was not authorized, the card type is different from the business type' };
  //O cartão deve possuir saldo suficiente para cobrir o montante da compra

  await paymentRepository.insert({
    cardId,
    businessId,
    amount
  });

  res.sendStatus(201);
}