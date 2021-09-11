import express, { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import models from "../models";

const assetRouter = express.Router();

// Post Asset
assetRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const asset = new models.Assets({
        ...req.body,
        userId: req.user._id,
      });
      await asset.save();
      res.status(200).send();
    } catch (error) {
      next(error);
    }
  }
);
// Get all Assets
assetRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assets = await models.Assets.find({ userId: req.user._id });
      if (!assets) {
        next(createHttpError(404, { m: "No assets found" }));
      } else if (assets.length > 0) {
        res.status(200).send(assets);
      }
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
