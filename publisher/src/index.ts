import { serve } from "bun";
import figlet from "figlet";

import rabbitService from "./rabbit.service";

(async () => {
  await new Promise((resolve) => setTimeout(resolve, 10000)); // hack delay when connect to RabbitMQ
  await rabbitService.connect();

  const server = serve({
    port: 3000,

    async fetch(req) {
      const path = new URL(req.url).pathname;
      const method = req.method;

      if (path === "/" && method === "GET") {
        return new Response(figlet.textSync("I am a publisher", "3D-ASCII"));
      }

      if (path === "/" && method === "POST") {
        const { message } = (await req.json()) as { message: string };
        if (!message || !message.length)
          return new Response("Internal server error", { status: 500 });

        const messageId = crypto.randomUUID();
        await rabbitService.publish("tasks", messageId, message);

        const answer = await rabbitService.receive("results", messageId);

        return new Response(answer.content);
      }

      // 404
      return new Response(figlet.textSync("404", "3D-ASCII"));
    },
  });

  console.log(`Listening on http://localhost:${server.port}`);
})();
