import mongoose from "mongoose";
import { Booked, DebtorAccount, TransactionAmount } from "types/bankAccount";

const { Schema, model } = mongoose;

export const transactionAmountSchema = new Schema<TransactionAmount>(
  {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "EUR" },
  },
  { _id: false }
);

export const debtorAccountSchema = new Schema<DebtorAccount>(
  {
    iban: { type: String, default: "" },
    debtorName: { type: String, default: "" },
    logo:{ type: String, default: "" }
  },
  { _id: false }
);

export const balanceSchema = new Schema(
  {
    balanceAmount: { type: transactionAmountSchema },
    balanceType: { type: String, default: "" },
    referenceDate: { type: String, default: "" },
  },
  { _id: false }
);

const transactionSchema = new Schema<Booked>({
  transactionId: { type: String, default: "" },
  accountId: { type: Schema.Types.ObjectId, ref: "Account" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  debtorAccount: { type: debtorAccountSchema },
  creditorName: { type: String, default: "" },
  transactionAmount: { type: transactionAmountSchema },
  bankTransactionCode: { type: String, default: "" },
  bookingDate: { type: Date, default: new Date() },
  valueDate: { type: Date, default: new Date() },
  remittanceInformationUnstructured: { type: String, default: "" },
  additionalInformation: { type: String, default: ""},
  type: { type: String, default: "" },
  sub_type: { type: String, default: "" },
  category: { type: String, default: "" },
});

export default model("Transaction", transactionSchema);
