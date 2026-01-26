import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SuccessResponseOptions<T> {
  statusCode?: number;
  message?: string;
  data?: T;
}

interface PaginatedResponseOptions<T> {
  statusCode?: number;
  message?: string;
  data: T[];
  metadata: PaginationMeta;
}

class ResponseService {
  success<T>(res: Response, options?: SuccessResponseOptions<T>) {
    const { statusCode = StatusCodes.OK, message, data } = options || {};

    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  paginated<T>(res: Response, options: PaginatedResponseOptions<T>) {
    const { statusCode = StatusCodes.OK, message, data, metadata } = options;

    const hasNext = metadata.page < metadata.totalPages;
    const hasPrev = metadata.page > 1;

    return res.status(statusCode).json({
      success: true,
      message,
      data: {
        data,
        metadata: {
          ...metadata,
          hasNext,
          hasPrev,
        },
      },
    });
  }
}

export default new ResponseService();
