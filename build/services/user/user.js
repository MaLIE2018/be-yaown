"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRouter = express_1.default.Router();
userRouter.get("/me", async (req, res, next) => {
    try {
        res.status(200).send();
    }
    catch (error) { }
});
userRouter.get("/me", async (req, res, next) => {
    try {
    }
    catch (error) { }
});
userRouter.get("/me", async (req, res, next) => {
    try {
    }
    catch (error) { }
});
exports.default = userRouter;
