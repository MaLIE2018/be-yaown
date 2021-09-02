import mongoose, { Model } from "mongoose";
import { Account } from "types/bankAccount";
import transactionSchema, {
  balanceSchema,
} from "../transaction/transactionSchema";
const { Schema, model } = mongoose;

const accountSchema = new Schema<Account>(
  {
    resourceId: { type: String, default: "" },
    iban: { type: String, default: "" },
    currency: { type: String, default: "" },
    ownerName: { type: String, default: "" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, default: "" },
    product: { type: String, default: "" },
    accountId: { type: String, default: "" },
    bankName: { type: String, default: "" },
    logo: { type: String, default: "" },
    aspspId: { type: String, default: "" },
    cashAccountType: { type: String, default: "" },
    balances: { type: [balanceSchema], default: [] },
    transactions: {
      booked: { type: [transactionSchema], default: [] },
      pending: { type: [transactionSchema], default: [] },
    },
  },
  { timestamps: true }
);

export default model<Account>("Account", accountSchema);
