import mongoose from "mongoose";
import { ContentModel } from "../models/content.models";
import { LinkModel } from "../models/link.models";
import { UserModel } from "../models/user.models";
import { JWT_PASSWORD } from "../constants";
import { userMiddleware } from "../middlewares/middleware";
import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { random } from "../utils/utils";

const signUp = async (req: Request, res: Response) => {
  // TODO: zod validation , hash the password
  const username = req.body.username;
  const password = req.body.password;

  try {
    await UserModel.create({
      username: username,
      password: password,
    });

    res.json({
      message: "User signed up",
    });
  } catch (e) {
    res.status(411).json({
      message: "User already exists",
    });
  }
};

const signIn = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const existingUser = await UserModel.findOne({ username });

  if (!existingUser) {
    res.status(400).json({ message: "Invalid username or password" });
    return;
  }

  const isMatch = await bcrypt.compare(password, existingUser.password);
  if (!isMatch) {
    res.status(400).json({ message: "Invalid username or password" });
    return;
  }

  const token = jwt.sign({ id: existingUser._id }, JWT_PASSWORD);
  res.json({ token });
};

const uploadContent = async (req: Request, res: Response) => {
  const link = req.body.link;
  const type = req.body.type;
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
  const contentId = req.body.contentId;

  await ContentModel.deleteMany({
    contentId,
    userId: req.userId,
  });

  res.json({
    message: "Deleted",
  });
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
