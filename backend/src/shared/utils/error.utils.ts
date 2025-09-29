import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/common.types";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Insufficient permissions") {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export const sendErrorResponse = (
  res: Response,
  error: AppError | Error,
  statusCode?: number,
): void => {
  const isOperational = error instanceof AppError ? error.isOperational : false;
  const status =
    statusCode || (error instanceof AppError ? error.statusCode : 500);

  const response: ApiResponse = {
    success: false,
    error: error.message,
  };

  res.status(status).json(response);
};

export const sendSuccessResponse = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200,
): void => {
  const response: ApiResponse<T> = {
    success: true,
    ...(data && { data }),
    ...(message && { message }),
  };

  res.status(statusCode).json(response);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const createController = <T extends any[]>(
  handler: (req: Request, res: Response, ...args: T) => Promise<void>,
) => {
  return asyncHandler(async (req: Request, res: Response, ...args: T) => {
    await handler(req, res, ...args);
  });
};

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      const validationError = new ValidationError(
        error.errors?.map((e: any) => e.message).join(", ") ||
          "Validation failed",
      );
      sendErrorResponse(res, validationError);
    }
  };
};

export const requireAuth = (req: Request): void => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
};

export const requireRole = (requiredRole: string) => {
  return (req: Request): void => {
    requireAuth(req);
    if (req.user?.role !== requiredRole) {
      throw new ForbiddenError();
    }
  };
};
