"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_errors_1 = __importDefault(require("http-errors"));
const models_1 = __importDefault(require("../models"));
const assetRouter = express_1.default.Router();
// Post Asset
assetRouter.post("/", async (req, res, next) => {
    try {
        const asset = new models_1.default.Assets({
            ...req.body,
            userId: req.user._id,
        });
        await asset.save();
        res.status(200).send();
    }
    catch (error) {
        next(error);
    }
});
// Get all Assets
assetRouter.get("/", async (req, res, next) => {
    try {
        const assets = await models_1.default.Assets.find({ userId: req.user._id });
        if (!assets) {
            next(http_errors_1.default(404, { m: "No assets found" }));
        }
        else if (assets.length > 0) {
            res.status(200).send(assets);
        }
    }
    catch (error) { }
});
//Add change
assetRouter.put("/:id", async (req, res, next) => {
    try {
    }
    catch (error) { }
});
//Delete
assetRouter.delete("/:id", async (req, res, next) => {
    try {
    }
    catch (error) { }
});
exports.default = assetRouter;
