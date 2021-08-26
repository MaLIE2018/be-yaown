import mongoose, { Model } from "mongoose";
import { Account } from "types/bankAccount";
import { Booked } from "../../types/bankAccount";

const { Schema, model } = mongoose;

const accountSchema = new Schema<Account>({
  resourceId: { type: String, default: "" },
  iban: { type: String, default: "" },
  currency: { type: String, default: "" },
  ownerName: { type: String, default: "" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  name: { type: String, default: "" },
  product: { type: String, default: "" },
  cashAccountType: { type: String, default: "" },
  balances: [],
  transactions: { booked: [], pending: [] },
});

export default model<Account>("Account", accountSchema);
