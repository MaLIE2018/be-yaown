import express from "express";
import UserModel from "../user/userSchema";
import createError from "http-errors";
import crypto from "crypto";
import {
  basicAuthMiddleware,
  JWTMiddleWare,
  refreshTokenMiddleWare,
} from "../../lib/auth/authMiddleware";
import { JWTAuthenticate, refreshTokens } from "../../lib/auth/tools";
import passport from "passport";
import atob from "atob";
import { sendVerifyLink } from "../../lib/email";
import { cookieOptions } from "../../util/cookies";

const authRouter = express.Router();

authRouter.post("/register", async (req, res, next) => {
  let password = "";
  try {
    if (!req.headers.authorization) {
      next(createError(401, { m: "Authorization required" }));
    } else {
      const decoded = atob(req.headers.authorization.split(" ")[1]);
      const [email, pw] = decoded.split(":");
      password = pw;
      const newUser = new UserModel({
        email: email.toLowerCase(),
        pw: pw,
      });
      const token = crypto.randomBytes(512).toString("hex");
      const emailToken = crypto.randomBytes(512).toString("hex");
      newUser.verifyToken = token;
      newUser.emailToken = emailToken;
      await newUser.save();
      res.cookie("csrfltoken", token, cookieOptions);
      res.status(200).send();
      await sendVerifyLink(emailToken, email);
    }
  } catch (error: any) {
    if (error.code === 11000) {
      const user = await UserModel.checkCredentials(
        error.keyValue.email,
        password
      );
      req.user = user;
      if (req.user !== null) {
        const { accessToken, refreshToken } = await JWTAuthenticate(req.user);
        res.status(202).send({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      } else {
        next(createError(401, { m: "Credentials wrong" }));
      }
    } else if (error.name === "ValidationError")
      next(createError(400, { m: "ValidationError" }));
    else next(createError(500, { m: error.message }));
  }
});

authRouter.post("/login", basicAuthMiddleware, async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.active === false) {
        res.cookie("csrfltoken", req.user.verifyToken, cookieOptions);
        res.status(401).send();
      } else {
        const { accessToken, refreshToken } = await JWTAuthenticate(req.user);
        res.status(200).send({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

authRouter.get("/logout", JWTMiddleWare, async (req, res, next) => {
  try {
    if (req.user) {
      req.user.save();
      res.status(200).send();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

authRouter.get(
  "/googlelogin",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRouter.get(
  "/googleRedirect",
  passport.authenticate("google"),
  async (req, res, next) => {
    try {
      res.send({
        access_token: req.user.tokens.accessToken,
        refresh_token: req.user.tokens.refreshToken,
      });
      res.status(200).redirect("https://whatsappclone-mu.vercel.app/home");
    } catch (error) {
      next(error);
    }
  }
);

authRouter.post(
  "/refreshToken",
  refreshTokenMiddleWare,
  async (req, res, next) => {
    try {
      if (req.user) {
        const { newAccessToken, newRefreshToken } = await refreshTokens(
          req.headers.authorization.split(" ")[1]
        );
        res.status(200).send({
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

export default authRouter;
