import cors from "@fastify/cors";
import Fastify from "fastify";
import { normalizeAggregateRequest } from "@prompt-media-queue/shared";
import { aggregateMedia } from "./recommendation.js";

const server = Fastify({
  logger: true
});

await server.register(cors, {
  origin: true
});

server.get("/health", async () => ({
  ok: true,
  service: "prompt-media-queue-api"
}));

server.post("/aggregate", async (request, reply) => {
  const aggregateRequest = normalizeAggregateRequest(request.body ?? {});

  if (!aggregateRequest.prompt) {
    return reply.status(400).send({
      error: "Prompt is required."
    });
  }

  return aggregateMedia(aggregateRequest);
});

const port = Number(process.env.PORT ?? 4000);

try {
  await server.listen({ port, host: "0.0.0.0" });
} catch (error) {
  server.log.error(error);
  process.exit(1);
}
