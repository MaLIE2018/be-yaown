import mongoose, { Model } from "mongoose";
import { Account } from "types/bankAccount";
import transactionSchema, {
  balanceSchema,
} from "../transaction/transactionSchema";
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
  balances: { type: [balanceSchema], default: [] },
  transactions: {
    booked: { type: [transactionSchema], default: [] },
    pending: { type: [transactionSchema], default: [] },
  },
});

accountSchema.pre("find", async function () {
  const account = this;
  console.log("account:", account.set);
  // if (account.transactions.booked.length - 1) {
  //   const lastTransactionAmount =
  //     account.transactions.booked[account.transactions.booked.length - 1]
  //       .transactionAmount.amount;
  //   const oldBalance = account.balances[0].balanceAmount.amount;
  //   account.balances[0].balanceAmount.amount =
  //     lastTransactionAmount + oldBalance;
  //   account.balances[0].referenceDate = new Date().toISOString();
  //   account.save();
  // }
});

export default model<Account>("Account", accountSchema);
