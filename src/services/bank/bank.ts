import express, { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { AIPInstance } from "../../util/axios";

const bankRouter = express.Router();

bankRouter.get(
  "/:countrycode",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const banks = await AIPInstance.get(
        `aspsps/?country=${req.params.countrycode}`
      ).then((banks) => banks);
      banks
        ? res.status(200).send(banks.data)
        : next(createError(404, { m: "No available Banks" }));
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default bankRouter;
