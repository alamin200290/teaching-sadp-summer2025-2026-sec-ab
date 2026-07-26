import express, { Express } from "express";
import { Logger } from "../shared/types";
import { Controllers, buildRouter } from "./routes";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
export function createApp(deps: { logger: Logger; controllers: Controllers }): Express {
  const app = express();
  app.use(express.json());
  app.use(requestLogger(deps.logger));
  app.use(buildRouter(deps.controllers));
  app.use(errorHandler(deps.logger));
  return app;
}
