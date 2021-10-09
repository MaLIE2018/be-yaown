"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const models_1 = __importDefault(require("../../services/models"));
const { Schema, model } = mongoose_1.default;
const userSchema = new Schema({
    name: { type: String },
    email: { type: String, unique: true, required: true },
    img: { type: String, default: '' },
    pw: { type: String, default: '' },
    refreshToken: { type: String, default: '' },
    active: { type: Boolean, default: false },
    verifyToken: { type: String, default: '' },
    emailToken: { type: String, default: '' },
    googleId: { type: String, default: '' },
    lastTransRefresh: { type: Date, default: new Date(2000, 0, 1) },
    lastBalRefresh: { type: Date, default: new Date(2000, 0, 1) },
    agreements: [
        new Schema({
            id: {
                type: String,
                default: '',
            },
            aspsp_id: { type: String, default: '' },
            created_at: { type: String, default: '' },
            accepted: { type: String, default: '' },
            access_valid_for_days: { type: Number },
            max_historical_days: { type: Number },
            requisition: { type: String, default: '' },
            accounts: [],
            reference: { type: String, default: '' },
            access_token: { type: String },
            bunqUserId: { type: String },
        }, { _id: false }),
    ],
}, { timestamps: true }); //, strict: false
userSchema.methods.toJSON = function () {
    const user = this;
    const userObj = user.toObject();
    delete userObj.refreshToken;
    delete userObj.verifyToken;
    delete userObj.googleId;
    delete userObj.pw;
    delete userObj.__v;
    delete userObj.agreements;
    return userObj;
};
userSchema.pre('save', async function () {
    const newUser = this;
    const accounts = await models_1.default.Accounts.find({
        $and: [{ cashAccountType: 'cash' }, { userId: newUser._id }],
    });
    if (accounts.length === 0) {
        const cashAccount = new models_1.default.Accounts();
        cashAccount.userId = newUser._id;
        cashAccount.name = 'Cash';
        cashAccount.cashAccountType = 'cash';
        cashAccount.currency = 'EUR';
        cashAccount.balances.push({
            balanceAmount: { currency: 'EUR', amount: 0 },
            referenceDate: new Date().toISOString(),
            balanceType: 'closingBooked',
        });
        cashAccount.bankName = 'Cash';
        await cashAccount.save();
    }
    if (newUser.isModified('pw')) {
        newUser.pw = await bcrypt_1.default.hash(newUser.pw, 10);
    }
});
userSchema.static('checkCredentials', async function checkCredentials(email, password) {
    const user = await await this.findOne({ email: email });
    if (user) {
        // if (!user.active) return null;
        const isMatch = await bcrypt_1.default.compare(password, user.pw);
        if (isMatch) {
            return user;
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
});
exports.default = model('User', userSchema);
