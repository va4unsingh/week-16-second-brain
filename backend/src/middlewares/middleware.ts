import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
      return;
    }

    const jwtSecret = process.env.JWT_PASSWORD;
    if (!jwtSecret) {
      throw new Error("JWT secret not defined");
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
      return;
    }

    req.userId = decoded.id;
    next();
    return;
  } catch (error) {
    console.log("Auth middleware failure");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
};
