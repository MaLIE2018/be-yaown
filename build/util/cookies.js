"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieOptions = void 0;
exports.cookieOptions = process.env.NODE_ENV === "development"
    ? { httpOnly: false }
    : {
        httpOnly: false,
        sameSite: "none",
        secure: true,
        expires: new Date(Date.now() + 9000000),
    };
