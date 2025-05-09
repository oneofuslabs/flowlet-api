import { NextFunction, Request, Response } from "express";
import { getUser } from "../services/auth.service";
import { Session, User } from "@supabase/supabase-js";

export interface AuthenticatedRequest extends Request {
  user?: User;
  session?: Session;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Bearer token missing" });
    }

    // Use service role client for auth verification
    const { data, error } = await getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Attach the user to the request object for later use
    req.user = data.user;

    return next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res
      .status(500)
      .json({ message: "Server error during authentication" });
  }
};
