import express, { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import models from "../models";
const testRouter = express.Router();

testRouter.get(
  "/:accountId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const account = await models.Accounts.findByIdAndUpdate(
        req.params.accountId,
        {
          $set: {
            "balances.0.balanceAmount.amount": {
              $sum: "$transactions.booked.transactionAmount.amount",
            },
          },
        },

        { new: true }
      );

      if (!account) {
        next(createHttpError(404, { m: "Account not found" }));
      } else {
        res.status(200).send(account);
      }
    } catch (error) {
      next(error);
    }
  }
);

//Add transaction to an account
testRouter.post(
  "/:accountId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const account = await models.Accounts.findByIdAndUpdate(
        req.params.accountId,
        {
          $push: { "transactions.booked": req.body },
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

export default testRouter;
