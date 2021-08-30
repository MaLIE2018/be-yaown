import mongoose from "mongoose";
import { DebtorAccount, TransactionAmount } from "types/bankAccount";

const { Schema } = mongoose;

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

const transactionSchema = new Schema({
  transactionId: { type: String, default: "" },
  debtorName: { type: String, default: "" },
  debtorAccount: { type: debtorAccountSchema },
  transactionAmount: { type: transactionAmountSchema },
  bankTransactionCode: { type: String, default: "" },
  bookingDate: { type: String, default: "" },
  valueDate: { type: String, default: "" },
  remittanceInformationUnstructured: { type: String, default: "" },
  category: { type: String, default: "" },
});

export default transactionSchema;
