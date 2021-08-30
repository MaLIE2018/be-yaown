import express, { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import AccountModel from "../account/accountSchema";
const accountRouter = express.Router();

//post Account
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

// get all accounts
accountRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accounts = await AccountModel.find({ userId: req.user._id }).select(
        { transactions: 0 }
      );
      !accounts
        ? next(createHttpError(404, { m: "Account not found" }))
        : res.status(200).send(accounts);
    } catch (error) {
      next(error);
    }
  }
);
// delete accounts
accountRouter.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (error) {}
  }
);

export default accountRouter;
