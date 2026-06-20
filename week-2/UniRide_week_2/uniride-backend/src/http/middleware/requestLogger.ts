import { Request, Response, NextFunction } from "express";
import { Logger } from "../../shared/types";

// One structured log line per request (method, path, status, latency) — the seed of the
// observability work in Week 9.
export function requestLogger(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    res.on("finish", () => {
      logger.info("http.request", {
        method: req.method, path: req.path, status: res.statusCode, ms: Date.now() - start,
      });
    });
    next();
  };
}
