import { CookieOptions } from "express";

export const cookieOptions: CookieOptions = {
        httpOnly: false,
        sameSite: "none",
        secure: true,
        expires: new Date(Date.now() + 9000000),
      };
