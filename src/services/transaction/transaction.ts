import express, { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import models from "../models";
const transactionRouter = express.Router();

// Get all transactions for a specific account
transactionRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const account = await models.Accounts.findOne({
        cashAccountType: "cash",
        userId: req.user._id,
      });
      if (!account) {
        next(createHttpError(404, { m: "Account not found" }));
      } else {
        res.status(200).send(account.transactions);
      }
    } catch (error) {
      next(error);
    }
  }
);

//Add transaction to an account
transactionRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const account = await models.Accounts.findOneAndUpdate(
        { cashAccountType: "cash", userId: req.user.id },
        {
          $push: { "transactions.booked": req.body },
          $inc: {
            "balances.0.balanceAmount.amount":
              req.body.transactionAmount.amount,
          },
          $set: { "balances.0.referenceDate": new Date().toISOString() },
        }
      );

      if (!account) {
        next(createHttpError(404, { m: "Account not found" }));
      } else {
        res.status(200).send();
      }
    } catch (error) {
      next(error);
    }
  }
);
//Batch add transaction to account
transactionRouter.post(
  "/:id/batchTransaction",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (error) {}
  }
);

// delete transaction
transactionRouter.delete(
  "/:id/transaction/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (error) {}
  }
);

export default transactionRouter;
