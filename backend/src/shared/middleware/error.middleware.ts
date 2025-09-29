import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/common.types";
import { AppError, sendErrorResponse } from "../utils/error.utils";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err.stack);

  if (err instanceof AppError) {
    return sendErrorResponse(res, err);
  }

  const response: ApiResponse = {
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  };

  res.status(500).json(response);
};
