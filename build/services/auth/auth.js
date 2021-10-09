"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userSchema_1 = __importDefault(require("../user/userSchema"));
const http_errors_1 = __importDefault(require("http-errors"));
const crypto_1 = __importDefault(require("crypto"));
const authMiddleware_1 = require("../../lib/auth/authMiddleware");
const tools_1 = require("../../lib/auth/tools");
const passport_1 = __importDefault(require("passport"));
const atob_1 = __importDefault(require("atob"));
const email_1 = require("../../lib/email");
const cookies_1 = require("../../util/cookies");
const authRouter = express_1.default.Router();
authRouter.post("/register", async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            next(http_errors_1.default(401, { m: "Authorization required" }));
        }
        else {
            const decoded = atob_1.default(req.headers.authorization.split(" ")[1]);
            const [email, pw] = decoded.split(":");
            const newUser = new userSchema_1.default({
                email: email.toLowerCase(),
                pw: pw,
            });
            const token = crypto_1.default.randomBytes(512).toString("hex");
            const emailToken = crypto_1.default.randomBytes(512).toString("hex");
            newUser.verifyToken = token;
            newUser.emailToken = emailToken;
            await newUser.save();
            res.cookie("csrfltoken", token, cookies_1.cookieOptions);
            console.log('cookieOptions:', cookies_1.cookieOptions);
            res.status(200).send();
            await email_1.sendVerifyLink(emailToken, email);
        }
    }
    catch (error) {
        if (error.code === 11000) {
            next(http_errors_1.default(401, { m: "Email is already registered" }));
        }
        else if (error.name === "ValidationError")
            next(http_errors_1.default(400, { m: "ValidationError" }));
        else
            next(http_errors_1.default(500, { m: error.message }));
    }
});
authRouter.post("/login", authMiddleware_1.basicAuthMiddleware, async (req, res, next) => {
    try {
        if (req.user) {
            if (req.user.active === false) {
                res.cookie("csrfltoken", req.user.verifyToken, cookies_1.cookieOptions);
                res.status(401).send();
            }
            else {
                const { accessToken, refreshToken } = await tools_1.JWTAuthenticate(req.user);
                res.status(200).send({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    user: req.user,
                });
            }
        }
    }
    catch (error) {
        console.log(error);
        next(error);
    }
});
authRouter.get("/logout", authMiddleware_1.JWTMiddleWare, async (req, res, next) => {
    try {
        if (req.user) {
            res.status(200).send();
        }
    }
    catch (error) {
        console.log(error);
        next(error);
    }
});
authRouter.get("/googlelogin", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
authRouter.get("/googleRedirect", passport_1.default.authenticate("google"), async (req, res, next) => {
    try {
        res.send({
            access_token: req.user.tokens.accessToken,
            refresh_token: req.user.tokens.refreshToken,
        });
        res.status(200).redirect("https://whatsappclone-mu.vercel.app/home");
    }
    catch (error) {
        next(error);
    }
});
authRouter.post("/refreshToken", authMiddleware_1.refreshTokenMiddleWare, async (req, res, next) => {
    try {
        if (req.user) {
            const { newAccessToken, newRefreshToken } = await tools_1.refreshTokens(req.headers.authorization.split(" ")[1]);
            res.status(200).send({
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
            });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.default = authRouter;
