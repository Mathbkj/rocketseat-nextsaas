import { prisma } from "@/lib/prisma.js";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { BadRequestError } from "../_errors/bad-request-error.js";
import { auth } from "@/http/middlewares/auth.js";

export async function getAccount(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/users",
      {
        schema: {
          tags: ["auth"],
          summary: "Get authenticated user profile",
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              user: z.object({
                id: z.string(),
                name: z.string().nullable(),
                email: z.string().email(),
                avatarUrl: z.string().url().nullable(),
              }),
            }),
          },
        },
      },
      async (request, response) => {
        const userId = await request.getCurrentUserId();
        const user = await prisma.user.findUnique({
          select: { id: true, name: true, email: true, avatarUrl: true },
          where: { id: userId },
        });
        if (!user) {
          throw new BadRequestError("User not found");
        }
        return response.send({ user });
      }
    );
}
