"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.basicAuthMiddleware = exports.refreshTokenMiddleWare = exports.JWTMiddleWare = void 0;
const userSchema_1 = __importDefault(require("../../services/user/userSchema"));
const http_errors_1 = __importDefault(require("http-errors"));
const tools_1 = require("./tools");
const atob_1 = __importDefault(require("atob"));
const JWTMiddleWare = async (req, res, next) => {
    if (!req.headers.authorization) {
        next(http_errors_1.default(401, { m: "Provide Access Token" }));
    }
    else {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];
            const content = await tools_1.verifyAccessToken(accessToken);
            const user = await userSchema_1.default.findById(content._id);
            if (user) {
                req.user = user;
                next();
            }
            else {
                next(http_errors_1.default(404, { m: "User not found" }));
            }
        }
        catch (error) {
            next(http_errors_1.default(401, { m: "AccessToken not valid" }));
        }
    }
};
exports.JWTMiddleWare = JWTMiddleWare;
const refreshTokenMiddleWare = async (req, res, next) => {
    if (!req.headers.authorization) {
        next(http_errors_1.default(401, { m: "Provide Refresh Token" }));
    }
    else {
        try {
            const refreshToken = req.headers.authorization.split(" ")[1];
            const content = await tools_1.verifyRefreshToken(refreshToken);
            const user = await userSchema_1.default.findById(content._id);
            if (user) {
                req.user = user;
                next();
            }
            else {
                next(http_errors_1.default(404, { m: "User not found" }));
            }
        }
        catch (error) {
            next(http_errors_1.default(401, { m: "RefreshToken not valid" }));
        }
    }
};
exports.refreshTokenMiddleWare = refreshTokenMiddleWare;
const basicAuthMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        next(http_errors_1.default(400, { m: "Authorization required" }));
    }
    else {
        const decoded = atob_1.default(req.headers.authorization.split(" ")[1]);
        const [email, password] = decoded.split(":");
        const user = await userSchema_1.default.checkCredentials(email, password);
        if (user) {
            req.user = user;
            next();
        }
        else {
            next(http_errors_1.default(401, { m: "Credentials wrong" }));
        }
    }
};
exports.basicAuthMiddleware = basicAuthMiddleware;
