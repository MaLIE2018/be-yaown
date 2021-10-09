"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
const assetSchema = new Schema({
    name: { type: String, default: "" },
    value: { type: Number, default: 0 },
    type: { type: String, default: "" },
    valueDate: { type: String, default: "" },
    currency: { type: String, default: "" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    residualDebt: { type: Number, default: 0 },
    residualDebtDate: { type: String, default: "" },
    savingRate: { type: Number, default: 0 },
    description: { type: String, default: "" },
    note: { type: String, default: "" },
});
exports.default = model("Asset", assetSchema);
