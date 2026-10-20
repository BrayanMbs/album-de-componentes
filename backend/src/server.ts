import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(env.PORT, "0.0.0.0", () => {
  process.stdout.write(`pc-compare-api listening on port ${env.PORT}\n`);
});

