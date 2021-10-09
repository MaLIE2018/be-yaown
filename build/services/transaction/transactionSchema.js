"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.balanceSchema = exports.debtorAccountSchema = exports.transactionAmountSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
exports.transactionAmountSchema = new Schema({
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "EUR" },
}, { _id: false });
exports.debtorAccountSchema = new Schema({
    iban: { type: String, default: "" },
    debtorName: { type: String, default: "" },
    logo: { type: String, default: "" }
}, { _id: false });
exports.balanceSchema = new Schema({
    balanceAmount: { type: exports.transactionAmountSchema },
    balanceType: { type: String, default: "" },
    referenceDate: { type: String, default: "" },
}, { _id: false });
const transactionSchema = new Schema({
    transactionId: { type: String, default: "" },
    accountId: { type: Schema.Types.ObjectId, ref: "Account" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    debtorAccount: { type: exports.debtorAccountSchema },
    creditorName: { type: String, default: "" },
    transactionAmount: { type: exports.transactionAmountSchema },
    bankTransactionCode: { type: String, default: "" },
    bookingDate: { type: Date, default: new Date() },
    valueDate: { type: Date, default: new Date() },
    remittanceInformationUnstructured: { type: String, default: "" },
    additionalInformation: { type: String, default: "" },
    type: { type: String, default: "" },
    sub_type: { type: String, default: "" },
    category: { type: String, default: "" },
});
exports.default = model("Transaction", transactionSchema);
