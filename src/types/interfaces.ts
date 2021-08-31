import { NextFunction, Request, Response } from "express";
import { Account } from "./bankAccount";
import { Asset } from "types/asset";

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export interface Agreement {
  aspsp_id: string;
  id: string;
  created_at: string;
  access_valid_for_days: number;
  max_historical_days: number;
  accepted: string | null;
}

export interface User {
  _id?: string;
  name: string;
  img: string;
  email: string;
  pw: string;
  refreshToken: string;
  accounts: Account[];
  assets: Asset[];
  active: boolean;
  save: Function;
  googleId: string;
  verifyToken: string;
  emailToken: string;
  estimates: {};
  reference: string;
  agreements: Agreement[];
  requisition: string;
}
