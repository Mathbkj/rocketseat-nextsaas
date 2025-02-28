import { prisma } from "@/lib/prisma.js"
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { UnauthorizedError } from "../_errors/unauthorized-error.js";
import { hash } from "bcryptjs";

export async function resetPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/password/recovery",
    {
      schema: {
        tags: ["auth"],
        summary: "User Request Paswword Recovery",
        body: z.object({
          code: z.string(),
          password: z.string().min(6),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, response) => {
      const { code, password } = request.body;

      const tokenFromCode = await prisma.token.findUnique({
        where: { id: code },
      });
      if (!tokenFromCode) {
        throw new UnauthorizedError("Unauthorized: Token not found");
      }
      const passwordHash = await hash(password, 6);
      await prisma.user.update({
        where: { id: tokenFromCode.userId },
        data: {
          passwordHash,
        },
      });
      return response.status(204).send();
    }
  );
}
