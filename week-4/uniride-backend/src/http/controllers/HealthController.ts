import { Request, Response } from "express";
export class HealthController {
  constructor(private readonly version: string) {}
  get = (_req: Request, res: Response): void => {
    res.json({ status: "ok", version: this.version, uptimeSeconds: Math.round(process.uptime()) });
  };
}
