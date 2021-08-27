import express from "express";
import { JWTMiddleWare } from "../lib/auth/authMiddleware";
import accountRouter from "./account/account";
import authRouter from "./auth/auth";
import bankRouter from "./bank/bank";
import userRouter from "./user/user";
import verifyRouter from "./verify/verify";

const route = express.Router();

route.use("/verify-email", verifyRouter);
route.use("/user", JWTMiddleWare, userRouter);
route.use("/auth", authRouter);
route.use("/bank", JWTMiddleWare, bankRouter);
route.use("/account", JWTMiddleWare, accountRouter);

export default route;
