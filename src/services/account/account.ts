import express, { NextFunction, Request, Response } from "express";

const accountRouter = express.Router();

accountRouter.get(
  "/me",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).send();
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
accountRouter.get(
  "/me",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (error) {}
  }
);

export default accountRouter;
