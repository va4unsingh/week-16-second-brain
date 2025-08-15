import { ContentModel } from "../models/content.models";
import { LinkModel } from "../models/link.models";
import { UserModel } from "../models/user.models";
import { Request, RequestHandler, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { random } from "../utils/utils";
import mongoose from "mongoose";

const signUp: RequestHandler = async (req: Request, res: Response) => {
  // TODO: zod validation , hash the password
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        message: "All fields are required",
      });
      return;
    }

    const existingUser = await UserModel.findOne({ username });

    if (existingUser) {
      res.status(400).json({
        message: "User already exist",
      });
      return;
    }

    const user = await UserModel.create({
      username: username.toLowerCase(),
      password,
    });

    if (!user) {
      res.status(400).json({
        message: "User not registered",
      });
      return;
    }

    res.status(200).json({
      message: "User registered succesfully",
      success: true,
      user: {
        id: user._id,
        username: user.username,
      },
    });

    return;
  } catch (error: any) {
    console.error("SignUp Error: ", error);

    res.status(500).json({
      message: "Internal server error while registering user",
      success: false,
    });
    return;
  }
};

const signIn: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const existingUser = await UserModel.findOne({ username }).select(
      "+password"
    );

    if (!existingUser) {
      res.status(400).json({
        message: "Invalid username or password",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      res.status(400).json({
        message: "Invalid username or password",
      });
      return;
    }

    const jwtSecret = process.env.JWT_PASSWORD;
    if (!jwtSecret) {
      throw new Error("JWT secret not defined");
    }

    const token = jwt.sign({ id: existingUser._id }, jwtSecret, {
      expiresIn: "24h",
    });

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.status(200).cookie("token", token, cookieOptions).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error: any) {
    console.error("SignIn Error: ", error);

    res.status(500).json({
      message: "Internal server error while user login",
      success: false,
    });
    return;
  }
};

const uploadContent = async (req: Request, res: Response) => {
  const { link, type } = req.body;
  await ContentModel.create({
    link,
    type,
    title: req.body.title,
    userId: req.userId,
    tags: [],
  });

  res.json({
    message: "Content added",
  });
};

const getContent = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.userId;
  const content = await ContentModel.find({
    userId: userId,
  }).populate("userId", "username");
  res.json({
    content,
  });
};

const deleteContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        message: "Invalid or missing id",
        success: false,
      });
      return;
    }

    if (!req.userId) {
      res.status(401).json({
        message: "Unauthorized: missing user ID",
        success: false,
      });
      return;
    }
    const result = await ContentModel.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({
        message: "Content not found or you do not have permission to delete it",
        success: false,
      });
      return;
    }

    res.status(200).json({
      message: "Content deleted successfully",
      success: true,
    });
    return;
  } catch (error) {
    console.error("DeleteContent Error:", error);
    res.status(500).json({
      message: "Internal server error while deleting content",
      success: false,
    });
    return;
  }
};

const shareContent = async (req: Request, res: Response) => {
  const share = req.body.share;
  if (share) {
    const existingLink = await LinkModel.findOne({
      userId: req.userId,
    });

    if (existingLink) {
      res.json({
        hash: existingLink.hash,
      });
      return;
    }
    const hash = random(10);
    await LinkModel.create({
      userId: req.userId,
      hash: hash,
    });

    res.json({
      hash,
    });
  } else {
    await LinkModel.deleteOne({
      userId: req.userId,
    });

    res.json({
      message: "Removed link",
    });
  }
};

const shareLinkContent = async (req: Request, res: Response) => {
  const hash = req.params.shareLink;

  const link = await LinkModel.findOne({
    hash,
  });

  if (!link) {
    res.status(411).json({
      message: "Sorry incorrect input",
    });
    return;
  }
  // userId
  const content = await ContentModel.find({
    userId: link.userId,
  });

  console.log(link);
  const user = await UserModel.findOne({
    _id: link.userId,
  });

  if (!user) {
    res.status(411).json({
      message: "user not found, error should ideally not happen",
    });
    return;
  }

  res.json({
    username: user.username,
    content: content,
  });
};

export {
  signUp,
  signIn,
  uploadContent,
  getContent,
  deleteContent,
  shareContent,
  shareLinkContent,
};
