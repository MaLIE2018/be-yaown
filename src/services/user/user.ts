import express, { NextFunction, Request, Response } from "express";
import UserModel from "../user/userSchema";
import createError from "http-errors";
import { JWTAuthenticate } from "../../lib/auth/tools";

const userRouter = express.Router();

userRouter.get(
  "/me",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).send();
    } catch (error) {}
  }
);
userRouter.get(
  "/verify/:token",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.cookies.csrfltoken) {
        next(createError(404, { message: "NotFound" }));
      }
      const user = UserModel.find(
        { verifyToken: req.params.token },
        { verified: true, verifyToken: "" }
      );
      if (!user) {
        next(createError(404, { message: "NotFound" }));
      } else {
        req.user = user;
        const { accessToken, refreshToken } = await JWTAuthenticate(req.user);
        res
          .status(200)
          .redirect(
            `${process.env.FE_URL}/verified?at=${accessToken}&rt=${refreshToken}`
          );
      }
    } catch (error) {
      next(error);
    }
  }
);
userRouter.get(
  "/me",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (error) {}
  }
);
userRouter.get(
  "/me",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (error) {}
  }
);

export default userRouter;
