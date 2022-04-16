import { Request, Response } from "express";
import { createNewCard, verifyCardType } from "../services/cardServices.js";

export async function createCard(req: Request, res: Response) {
  const { employeeId, cardType } = req.body;

  const { company } = res.locals;

  verifyCardType(cardType.toString());

  createNewCard( Number(employeeId), cardType.toString(), company.id);

  res.sendStatus(201);
}

export async function activateCard(req: Request, res: Response) {
  const { employeeName, CVC, password } = req.body;
}

export async function transactionsCard(req: Request, res: Response) {
  
}