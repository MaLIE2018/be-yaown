"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieOptions = void 0;
exports.cookieOptions = process.env.TS_NODE_DEV === 'true'
    ? { httpOnly: false }
    : {
        domain: "vercel.app",
        httpOnly: false,
        sameSite: "none",
        secure: true,
        expires: new Date(Date.now() + 9000000),
    };
