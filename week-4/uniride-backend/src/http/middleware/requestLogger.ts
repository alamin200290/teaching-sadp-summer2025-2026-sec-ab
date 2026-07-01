import { Request, Response, NextFunction } from "express";
import { Logger } from "../../shared/types";
export function requestLogger(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    res.on("finish", () => logger.info("http.request", { method: req.method, path: req.path, status: res.statusCode, ms: Date.now() - start }));
    next();
  };
}
