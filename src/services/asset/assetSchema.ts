import mongoose, { Model } from "mongoose";
import { Asset } from "types/asset";

const { Schema, model } = mongoose;

const assetSchema = new Schema<Asset>({
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

export default model<Asset>("Asset", assetSchema);
