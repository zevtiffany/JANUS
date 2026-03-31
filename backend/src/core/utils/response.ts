import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode = 200): void {
  res.status(statusCode).json({
    success: true,
    data,
    message,
  } as ApiResponse<T>);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
): void {
  res.status(200).json({
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  } as ApiResponse<T[]>);
}

export function sendError(res: Response, message: string, statusCode = 400): void {
  res.status(statusCode).json({
    success: false,
    error: message,
  } as ApiResponse);
}
