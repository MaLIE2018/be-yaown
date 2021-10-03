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
  requisition: string;
  accounts: { id: string; accountId: string }[];
  reference: string;
  access_token?: string;
  bunqUserId?: string;
}

export interface User {
  _id?: string;
  name: string;
  img: string;
  email: string;
  pw: string;
  refreshToken: string;
  assets: Asset[];
  active: boolean;
  save: Function;
  googleId: string;
  verifyToken: string;
  emailToken: string;
  lastTransRefresh: Date;
  estimates: {};

  agreements: Agreement[];
}
