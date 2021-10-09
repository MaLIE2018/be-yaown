import { CookieOptions } from "express";

export const cookieOptions: CookieOptions =
  process.env.TS_NODE_DEV === 'true'
    ? { httpOnly: false }
    : {
        httpOnly: false,
        sameSite: "none",
        secure: true,
        expires: new Date(Date.now() + 9000000),
      };
