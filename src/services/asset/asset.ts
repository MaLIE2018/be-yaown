import express, { NextFunction, Request, Response } from "express";
import AccountModel from "../account/accountSchema";
const assetRouter = express.Router();

// Post Asset
assetRouter.post(
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
// Get all Assets
assetRouter.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (error) {}
  }
);

//Add change
assetRouter.put(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (error) {}
  }
);

//Delete
assetRouter.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (error) {}
  }
);

export default assetRouter;
