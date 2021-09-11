import { ObjectId } from "mongoose";

export interface Asset {
  name: string;
  userId: ObjectId;
  value: number;
  type: string;
  valueDate: string;
  currency: string;
  residualDebt: number;
  residualDebtDate: string;
  savingRate: number;
  description: string;
  note: string;
}
