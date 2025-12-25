import dotenv from "dotenv";
dotenv.config();
import { app } from "./server";
import http from "http";
import { initRealtime } from "./realtime";
import { useRedis, pingRedis } from "./redis";

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const server = http.createServer(app);

initRealtime(server);

server.listen(port, () => {
  (async () => {
    if (!useRedis) {
      console.log("Redis not configured, using in-memory cache");
    } else {
      const ok = await pingRedis();
      if (ok) {
        console.log(`Redis connected at ${process.env.REDIS_URL}`);
      } else {
        console.log(
          `Redis configured at ${process.env.REDIS_URL}, but not reachable. Using in-memory cache`
        );
      }
    }
    console.log(`API running at http://localhost:${port}`);
  })();
});
