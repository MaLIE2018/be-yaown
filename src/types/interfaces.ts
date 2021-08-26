import { NextFunction, Request, Response } from "express";
import { Account } from "./bankAccount";

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export interface User {
  _id?: string;
  name: string;
  img: string;
  email: string;
  pw: string;
  refreshToken: string;
  accounts: Account[];
  verified: boolean;
  save: Function;
  googleId: string;
  verifyToken: string;
}
