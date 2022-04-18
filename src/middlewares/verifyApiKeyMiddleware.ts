import { Response, Request, NextFunction } from "express";
import { findByApiKey } from "../repositories/companyRepository.js";

export default async function verifyApiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'];

  const company = await findByApiKey(`${apiKey}`);

  if(!company) throw { type: 'not found', message: 'Card type does not exist' };

  res.locals.company = company;
  next();
}

