import { buildContainer, VERSION } from "./composition/container";
const port = Number(process.env.PORT ?? 3000);
const { app, logger } = buildContainer();
app.listen(port, () => {
  logger.info("server.started", { port, version: VERSION });
  console.log(`UniRide ${VERSION} listening on http://localhost:${port}`);
});
