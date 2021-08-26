import express from "express";
import { JWTMiddleWare } from "../lib/auth/auth";
import accountRouter from "./account/account";
import authRouter from "./auth/auth";
import bankRouter from "./bank/bank";
import userRouter from "./user/user";

const route = express.Router();

route.use("/user", JWTMiddleWare, userRouter);
route.use("/auth", authRouter);
route.use("/bank", JWTMiddleWare, bankRouter);
route.use("/account", JWTMiddleWare, accountRouter);

export default route;
