import { Request, Response } from "express";
import * as cardServices from "../services/cardServices.js";

export async function createCard(req: Request, res: Response) {
  const { employeeId, cardType } = req.body;

  const { company } = res.locals;

  cardServices.verifyCardType(`${cardType}`);

  const employee = await cardServices.verifyEmployeeCompany(employeeId, company.id);

  const card = await cardServices.createNewCard( employee, cardType.toString());

  res.status(201).send(card);
}

export async function activateCard(req: Request, res: Response) {
  const { employeeId, cardId, CVC, password } = req.body;

  const card = await cardServices.verifyCardCVC(employeeId, cardId, CVC);

  cardServices.validatePassword(password);

  await cardServices.activateCardEmployee(Number(card.id), password);

  res.sendStatus(200);
}

export async function transactionsCard(req: Request, res: Response) {
  const { cardId, password } = req.body;

  cardServices.verifyPassword(cardId, password);

  
}