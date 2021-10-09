"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_errors_1 = __importDefault(require("http-errors"));
const accountSchema_1 = __importDefault(require("../account/accountSchema"));
const accountRouter = express_1.default.Router();
//post Account
accountRouter.post("/", async (req, res, next) => {
    try {
        const newAccount = new accountSchema_1.default({
            ...req.body,
            userId: req.user._id,
        });
        await newAccount.save();
        res.status(200).send();
    }
    catch (error) {
        next(error);
    }
});
// get all accounts
accountRouter.get("/", async (req, res, next) => {
    try {
        const accounts = await accountSchema_1.default.find({ userId: req.user._id }).select({ transactions: 0 });
        !accounts
            ? next(http_errors_1.default(404, { m: "Account not found" }))
            : res.status(200).send(accounts);
    }
    catch (error) {
        next(error);
    }
});
// delete accounts
accountRouter.delete("/:id", async (req, res, next) => {
    try {
    }
    catch (error) { }
});
exports.default = accountRouter;
