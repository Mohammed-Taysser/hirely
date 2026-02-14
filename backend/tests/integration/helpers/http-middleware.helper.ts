import errorHandlerMiddleware from '@dist/middleware/error-handler.middleware';

type NextFn = (err?: unknown) => void;

const runMiddleware = async (
  middleware: (req: any, res: any, next: NextFn) => void,
  req: Record<string, unknown>
): Promise<unknown> =>
  new Promise((resolve) => {
    middleware(req, {}, (err?: unknown) => resolve(err));
  });

const runErrorHandler = (err: unknown, req: Record<string, unknown>) => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  errorHandlerMiddleware(err as never, req as never, response as never, (() => {}) as never);

  return response;
};

export { runErrorHandler, runMiddleware };
