import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthUser, Role } from "../../modules/auth/auth.types";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, error: "Invalid token" });
  }
};

export const requireRole = (role: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }

    if (req.user.role !== role) {
      return res
        .status(403)
        .json({ success: false, error: "Insufficient permissions" });
    }

    next();
  };
};
