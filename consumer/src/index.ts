import { serve, sleep } from "bun";
import figlet from "figlet";

import rabbitService from "./rabbit.service";
import jobService from "./job.service";

(async () => {
  await new Promise((resolve) => setTimeout(resolve, 10000)); // hack delay when connect to RabbitMQ

  const rabbit = await rabbitService.connect();
  await rabbit.receive("tasks", async (msg) => {
    const task = msg.content.toString();
    const result = await jobService.doHardWork(task);

    await rabbitService.publish("results", msg.properties.messageId, result);
  });

  const server = serve({
    port: 3000,

    fetch(req) {
      const path = new URL(req.url).pathname;
      const method = req.method;

      if (path === "/" && method === "GET") {
        return new Response(figlet.textSync("I am a consumer", "3D-ASCII"));
      }

      return new Response(figlet.textSync("404", "3D-ASCII"));
    },
  });

  console.log(`Listening on http://localhost:${server.port}`);
})();
