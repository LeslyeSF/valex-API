import { Request, Response } from "express";
import * as cardServices from "../services/cardServices.js";
import * as rechargeRepository from "../repositories/rechargeRepository.js";

export async function rechargeCard(req: Request, res: Response) {
  const { cardId, recharge } = req.body;

  const card = await cardServices.verifyCard(cardId);

  if(recharge <= 0) throw { type: 'Unauthorized', message: 'The value entered is not valid' };

  await rechargeRepository.insert({
    cardId,
    amount: recharge
  });

  res.sendStatus(201);
}