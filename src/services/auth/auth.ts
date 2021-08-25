import express, { NextFunction, Request, Response } from "express";

const authRouter = express.Router();

authRouter.get(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {}
);
authRouter.post(
  "/refreshToken",
  async (req: Request, res: Response, next: NextFunction) => {}
);

export default authRouter;
