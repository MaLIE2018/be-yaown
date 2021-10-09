"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieOptions = void 0;
exports.cookieOptions = {
    httpOnly: false,
    sameSite: "none",
    secure: true,
    expires: new Date(Date.now() + 9000000),
};
