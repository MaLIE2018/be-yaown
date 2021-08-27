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
