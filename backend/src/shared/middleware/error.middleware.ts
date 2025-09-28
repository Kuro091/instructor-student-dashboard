import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/common.types";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err.stack);

  const response: ApiResponse = {
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  };

  res.status(500).json(response);
};
