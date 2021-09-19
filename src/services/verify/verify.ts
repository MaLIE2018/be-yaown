import express, { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { cookieOptions } from "../../util/cookies";
import { JWTAuthenticate } from "../../lib/auth/tools";
import Models from "../../services/models";
import UsersM from "../../services/user/userSchema";
const { Users } = Models;

const verifyRouter = express.Router();

verifyRouter.post(
  "/:token",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await UsersM.findOneAndUpdate(
        { emailToken: req.params.token },
        { active: true, verifyToken: "", emailToken: "" }
      );
      if (!user) {
        next(createError(404, { m: "Not Found" }));
      } else {
        req.user = user;
        const { accessToken, refreshToken } = await JWTAuthenticate(req.user);
        res.clearCookie("csrfltoken", cookieOptions);
        res.status(200).send({
          access_token: accessToken,
          refresh_token: refreshToken,
          user: req.user,
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

export default verifyRouter;
