import express, {
  Request, Response, NextFunction,
} from 'express';

export default function errorMiddlewares(error: any, req: Request, res: Response, next: NextFunction){
  if (error.response) {
    return res.sendStatus(error.response.status);
  }
  
  res.status(500).send(error);
  
}