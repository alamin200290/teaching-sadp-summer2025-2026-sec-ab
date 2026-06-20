import { Request, Response } from "express";

// A health endpoint is the first building block of the Availability quality attribute:
// load balancers and orchestrators use it to route only to healthy instances (Week 8).
export class HealthController {
  constructor(private readonly version: string) {}

  get = (_req: Request, res: Response): void => {
    res.json({ status: "ok", version: this.version, uptimeSeconds: Math.round(process.uptime()) });
  };
}
