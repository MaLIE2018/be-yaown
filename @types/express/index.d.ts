import UserModel from "../../src/services/user/userSchema";

declare module "express-serve-static-core" {
  interface Request {
    user?: UserModel;
  }
}
