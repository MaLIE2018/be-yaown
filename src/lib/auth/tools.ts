import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../../types/interfaces";
import UserModel from "../../services/user/userSchema";

let expirationTime = "";

const generateAccessToken = (payload: {}) => {
  process.env.NODE_ENV === "test"
    ? (expirationTime = "15min")
    : (expirationTime = "5min");
  return new Promise<string>((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { expiresIn: expirationTime },
      (err, token) => {
        if (err) reject(err);

        resolve(token!);
      }
    )
  );
};

const generateRefreshToken = (payload: {}) => {
  process.env.NODE_ENV === "test"
    ? (expirationTime = "30min")
    : (expirationTime = "7d");
  return new Promise<string>((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { expiresIn: expirationTime },

      (err, token) => {
        if (err) reject(err);

        resolve(token!);
      }
    )
  );
};

export const JWTAuthenticate = async (user: User) => {
  const accessToken = await generateAccessToken({ _id: user._id });
  const refreshToken = await generateRefreshToken({ _id: user._id });
  user.refreshToken = refreshToken;
  await user.save();
  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (refreshToken: string): Promise<JwtPayload> =>
  new Promise((resolve, reject) =>
    jwt.verify(refreshToken, process.env.JWT_SECRET!, (err, decodedToken) => {
      if (err) reject(err);
      resolve(decodedToken!);
    })
  );

export const verifyAccessToken = (accessToken: string) =>
  new Promise<JwtPayload>((resolve, reject) =>
    jwt.verify(accessToken, process.env.JWT_SECRET!, (err, decodedToken) => {
      if (err) reject(err);

      resolve(decodedToken!);
    })
  );

export const refreshTokens = async (actualRefreshToken: string) => {
  console.log("content:");
  const content = await verifyRefreshToken(actualRefreshToken);
  console.log("contentAfter:", content);

  const user = await UserModel.findById(content._id);

  if (!user) throw new Error("User not found");

  if (user.refreshToken === actualRefreshToken) {
    const newAccessToken = await generateAccessToken({ _id: user._id });
    const newRefreshToken = await generateRefreshToken({ _id: user._id });
    user.refreshToken = newRefreshToken;

    await user.save();

    return { newAccessToken, newRefreshToken };
  } else {
    throw new Error("Refresh Token not valid!");
  }
};
