import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/errors";
import { Logger } from "../../shared/types";

// Centralised error -> HTTP mapping. Typed AppErrors carry their own status; anything else
// is an unexpected fault and becomes a 500 (and is logged). Express recognises an error
// handler by its four-argument signature.
export function errorHandler(logger: Logger) {
  return (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof AppError) {
      res.status(err.httpStatus).json({ error: { code: err.code, message: err.message } });
      return;
    }
    logger.error("http.unhandled_error", { message: err instanceof Error ? err.message : String(err) });
    res.status(500).json({ error: { code: "INTERNAL", message: "Internal server error" } });
  };
}
