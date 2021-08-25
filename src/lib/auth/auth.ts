import UserModel from "../../services/user/userSchema";
import createError from "http-errors";
import { verifyAccessToken } from "./tools";
import atob from "atob";
import { Middleware } from "types/interfaces";

export const JWTMiddleWare = async (req, res, next) => {
  if (!req.headers.get("Authorization")) {
    next(createError(401, { m: "Provide Access Token" }));
  } else {
    try {
      const content = await verifyAccessToken(req.headers.get("Authorization"));

      const user = await UserModel.findById(content._id);

      if (user) {
        req.user = user;
        next();
      } else {
        next(createError(404, { m: "User not found" }));
      }
    } catch (error) {
      next(createError(401, { m: "AccessToken not valid" }));
    }
  }
};

export const basicAuthMiddleware = async (req, res, next) => {
  if (!req.headers.get("Authorization")) {
    next(createError(401, { m: "Authorization required" }));
  } else {
    const decoded = atob(req.headers.get("Authorization").split(" ")[1]);
    const [email, password] = decoded.split(":");

    const user = await UserModel.checkCredentials(email, password);

    if (user) {
      req.user = user;
      next();
    } else {
      next(createError(401, { m: "Credentials wrong" }));
    }
  }
};
