import UserModel from "../../services/user/userSchema";
import createError from "http-errors";
import { verifyAccessToken, verifyRefreshToken } from "./tools";
import atob from "atob";

export const JWTMiddleWare = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(createError(401, { m: "Provide Access Token" }));
  } else {
    try {
      const accessToken = req.headers.authorization.split(" ")[1];
      const content = await verifyAccessToken(accessToken);

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

export const refreshTokenMiddleWare = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(createError(401, { m: "Provide Refresh Token" }));
  } else {
    try {
      const refreshToken = req.headers.authorization.split(" ")[1];
      const content = await verifyRefreshToken(refreshToken);

      const user = await UserModel.findById(content._id);

      if (user) {
        req.user = user;
        next();
      } else {
        next(createError(404, { m: "User not found" }));
      }
    } catch (error) {
      next(createError(401, { m: "RefreshToken not valid" }));
    }
  }
};

export const basicAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(createError(400, { m: "Authorization required" }));
  } else {
    const decoded = atob(req.headers.authorization.split(" ")[1]);
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
