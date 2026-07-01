import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/errors";
import { Logger } from "../../shared/types";
export function errorHandler(logger: Logger) {
  return (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof AppError) { res.status(err.httpStatus).json({ error: { code: err.code, message: err.message } }); return; }
    logger.error("http.unhandled_error", { message: err instanceof Error ? err.message : String(err) });
    res.status(500).json({ error: { code: "INTERNAL", message: "Internal server error" } });
  };
}
