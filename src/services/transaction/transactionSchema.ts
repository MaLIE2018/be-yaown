import mongoose from "mongoose";

const { Schema } = mongoose;

export const balanceSchema = new Schema({
  balanceAmount: { type: Object, default: {} },
  balanceType: { type: String, default: "" },
  referenceDate: { type: String, default: "" },
});

const transactionSchema = new Schema({
  transactionId: { type: String, default: "" },
  debtorName: { type: String, default: "" },
  debtorAccount: { type: Object, default: {} },
  transactionAmount: { type: Object, default: {} },
  bankTransactionCode: { type: String, default: "" },
  bookingDate: { type: String, default: "" },
  valueDate: { type: String, default: "" },
  remittanceInformationUnstructured: { type: String, default: "" },
  category: { type: String, default: "" },
});

export default transactionSchema;
