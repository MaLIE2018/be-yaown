import express, { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { Agreement } from "types/interfaces";
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

bankRouter.get(
  "/agreements/enduser/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const agreement = await AIPInstance.post(`agreements/enduser/`, {
        enduser_id: req.user._id,
        max_historical_days: 365,
        aspsp_id: `${req.body.aspsp_id}`,
      }).then((agreement) => agreement);

      if (agreement) req.user.agreement.push(agreement);
      req.user.save();

      agreement
        ? res.status(200).send()
        : next(createError(404, { m: "No available Banks" }));
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

bankRouter.get(
  "/requisitions/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ids = req.user.agreements.reducer(
        (acc: string[], val: Agreement) => acc.concat(val.id),
        []
      );
      const requisition = await AIPInstance.post(`requisitions/`, {
        enduser_id: req.user._id,
        agreements: [...ids],
        redirect: "http://localhost:3000/cash",
        reference: req.user.reference,
      }).then((requisition) => requisition);

      if (requisition) {
        req.user.requisition = requisition.data.id;
      }

      requisition
        ? res.status(200).send()
        : next(createError(500, { m: "Generic Server Error" }));
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default bankRouter;
