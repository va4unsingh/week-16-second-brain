import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers["authorization"];
  const jwtSecret = process.env.JWT_PASSWORD;
  if (!jwtSecret) {
    throw new Error("JWT secret not defined");
  }
  const decoded = jwt.verify(header as string, jwtSecret);
  if (decoded) {
    if (typeof decoded === "string") {
      res.status(403).json({
        message: "You are not logged in",
      });
      return;
    }
    req.userId = (decoded as JwtPayload).id;
    next();
  } else {
    res.status(403).json({
      message: "You are not logged in",
    });
  }
};
