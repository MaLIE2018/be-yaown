"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const transactionSchema_1 = require("../transaction/transactionSchema");
const { Schema, model } = mongoose_1.default;
const accountSchema = new Schema({
    resourceId: { type: String, default: "" },
    iban: { type: String, default: "" },
    currency: { type: String, default: "" },
    ownerName: { type: String, default: "" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, default: "" },
    product: { type: String, default: "" },
    accountId: { type: String, default: "" },
    savingRate: { type: Number, default: 0 },
    bankName: { type: String, default: "" },
    logo: { type: String, default: "" },
    aspspId: { type: String, default: "" },
    cashAccountType: { type: String, default: "" },
    balances: { type: [transactionSchema_1.balanceSchema], default: [] },
}, { timestamps: true });
accountSchema.methods.toJSON = function () {
    const account = this;
    const accountObj = account.toObject();
    delete accountObj.accountId;
    delete accountObj.userId;
    delete accountObj.iban;
    delete accountObj.cashAccountType;
    delete accountObj.resourceId;
    return accountObj;
};
exports.default = model("Account", accountSchema);
