import mongoose, { Model } from "mongoose";
import { Asset } from "types/asset";

const { Schema, model } = mongoose;

const assetSchema = new Schema<Asset>({
  name: { type: String, default: "" },
  value: { type: String, default: "" },
  valueDate: { type: String, default: "" },
  currency: { type: String, default: "" },
  residualDebt: { type: String, default: "" },
  residualDebtDate: { type: String, default: "" },
  description: { type: String, default: "" },
  note: { type: String, default: "" },
});

export default model<Asset>("Asset", assetSchema);
