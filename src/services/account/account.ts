import express, { NextFunction, Request, Response } from "express";
import AccountModel from "../account/accountSchema";
const accountRouter = express.Router();

accountRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newAccount = new AccountModel({
        ...req.body,
        userId: req.user._id,
      });
      await newAccount.save();
      res.status(200).send();
    } catch (error) {
      next(error);
    }
  }
);
accountRouter.get(
  "/me",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (error) {}
  }
);
accountRouter.get(
  "/me",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (error) {}
  }
);
accountRouter.get(
  "/me",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (error) {}
  }
);

export default accountRouter;
