import express, { CookieOptions } from "express";
import UserModel from "../user/userSchema";
import createError from "http-errors";
import { basicAuthMiddleware, JWTMiddleWare } from "../../lib/auth/auth";
import { JWTAuthenticate, refreshTokens } from "../../lib/auth/tools";
import passport from "passport";

const authRouter = express.Router();

const cookieOptions: CookieOptions =
  process.env.NODE_ENV === "development"
    ? { httpOnly: true }
    : { httpOnly: true, sameSite: "none", secure: true };

authRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new UserModel({
      ...req.body,
      email: req.body.email.toLowerCase(),
    });
    await newUser.save();
    res.status(201).send(newUser);
  } catch (error: any) {
    if (error.name === "MongoError")
      next(
        createError(400, {
          m: {
            error: error.keyValue,
            reason: "Duplicated key",
            advice: "Change the key value",
          },
        })
      );
    else if (error.name === "ValidationError")
      next(createError(400, { m: "ValidationError" }));
    else next(createError(500, { m: error.message }));
  }
});

authRouter.get("/login", basicAuthMiddleware, async (req, res, next) => {
  try {
    if (req.user) {
      const { accessToken, refreshToken } = await JWTAuthenticate(req.user);
      res.send({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      res.status(200).send(req.user);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

authRouter.get("/logout", JWTMiddleWare, async (req, res, next) => {
  try {
    if (req.user) {
      req.user.save()!;
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

authRouter.post("/refreshToken", async (req, res, next) => {
  try {
    const { newAccessToken, newRefreshToken } = await refreshTokens(
      req.body.actualRefreshToken
    );
    res.send({ newAccessToken, newRefreshToken });
  } catch (error) {
    next(error);
  }
});

export default authRouter;
