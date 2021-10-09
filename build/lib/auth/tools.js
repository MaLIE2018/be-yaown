"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokens = exports.verifyAccessToken = exports.verifyRefreshToken = exports.JWTAuthenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userSchema_1 = __importDefault(require("../../services/user/userSchema"));
let expirationTime = "";
const generateAccessToken = (payload) => {
    process.env.NODE_ENV === "test"
        ? (expirationTime = "15min")
        : (expirationTime = "5min");
    return new Promise((resolve, reject) => jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: expirationTime }, (err, token) => {
        if (err)
            reject(err);
        resolve(token);
    }));
};
const generateRefreshToken = (payload) => {
    process.env.NODE_ENV === "test"
        ? (expirationTime = "45min")
        : (expirationTime = "7d");
    return new Promise((resolve, reject) => jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: expirationTime }, (err, token) => {
        if (err)
            reject(err);
        resolve(token);
    }));
};
const JWTAuthenticate = async (user) => {
    const accessToken = await generateAccessToken({ _id: user._id });
    const refreshToken = await generateRefreshToken({ _id: user._id });
    user.refreshToken = refreshToken;
    await user.save();
    return { accessToken, refreshToken };
};
exports.JWTAuthenticate = JWTAuthenticate;
const verifyRefreshToken = (refreshToken) => new Promise((resolve, reject) => jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err)
        reject(err);
    resolve(decodedToken);
}));
exports.verifyRefreshToken = verifyRefreshToken;
const verifyAccessToken = (accessToken) => new Promise((resolve, reject) => jsonwebtoken_1.default.verify(accessToken, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err)
        reject(err);
    resolve(decodedToken);
}));
exports.verifyAccessToken = verifyAccessToken;
const refreshTokens = async (actualRefreshToken) => {
    const content = await exports.verifyRefreshToken(actualRefreshToken);
    const user = await userSchema_1.default.findById(content._id);
    if (!user)
        throw new Error("User not found");
    if (user.refreshToken === actualRefreshToken) {
        const newAccessToken = await generateAccessToken({ _id: user._id });
        const newRefreshToken = await generateRefreshToken({ _id: user._id });
        user.refreshToken = newRefreshToken;
        await user.save();
        return { newAccessToken, newRefreshToken };
    }
    else {
        throw new Error("Refresh Token not valid!");
    }
};
exports.refreshTokens = refreshTokens;
