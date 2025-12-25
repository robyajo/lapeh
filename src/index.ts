import dotenv from "dotenv";
dotenv.config();
import { app } from "./server";
import http from "http";
import { initRealtime } from "./realtime";
import { initRedis } from "./redis";

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const server = http.createServer(app);

initRealtime(server);

server.listen(port, () => {
  (async () => {
    // Initialize Redis transparently (no logs if missing)
    await initRedis();
    console.log(`API running at http://localhost:${port}`);
  })();
});
