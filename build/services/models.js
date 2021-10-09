"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../services/user/userSchema"));
const accountSchema_1 = __importDefault(require("../services/account/accountSchema"));
const assetSchema_1 = __importDefault(require("../services/asset/assetSchema"));
const transactionSchema_1 = __importDefault(require("../services/transaction/transactionSchema"));
const Models = {
    Users: userSchema_1.default,
    Accounts: accountSchema_1.default,
    Assets: assetSchema_1.default,
    Transaction: transactionSchema_1.default,
};
exports.default = Models;
