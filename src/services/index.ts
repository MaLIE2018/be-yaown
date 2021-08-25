import express from "express";
import authRouter from "./auth/auth";
import bankRouter from "./bank/bank";
import userRouter from "./user/user";

const route = express.Router();

route.use("/user", userRouter);
route.use("/auth", authRouter);
route.use("/bank", bankRouter);

export default route;
