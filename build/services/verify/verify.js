"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_errors_1 = __importDefault(require("http-errors"));
const cookies_1 = require("../../util/cookies");
const tools_1 = require("../../lib/auth/tools");
const models_1 = __importDefault(require("../../services/models"));
const userSchema_1 = __importDefault(require("../../services/user/userSchema"));
const { Users } = models_1.default;
const verifyRouter = express_1.default.Router();
verifyRouter.post("/:token", async (req, res, next) => {
    try {
        const user = await userSchema_1.default.findOneAndUpdate({ emailToken: req.params.token }, { active: true, verifyToken: "", emailToken: "" });
        if (!user) {
            next(http_errors_1.default(404, { m: "Not Found" }));
        }
        else {
            req.user = user;
            const { accessToken, refreshToken } = await tools_1.JWTAuthenticate(req.user);
            res.clearCookie("csrfltoken", cookies_1.cookieOptions);
            res.status(200).send({
                access_token: accessToken,
                refresh_token: refreshToken,
                user: req.user,
            });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.default = verifyRouter;
