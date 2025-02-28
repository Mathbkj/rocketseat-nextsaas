import { auth } from "@/http/middlewares/auth.js";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { roleSchema } from "@repo/auth";

export const organizationSchema = z.object({
  organization: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    domain: z.string().nullable(),
    shouldAttachUsersByDomain: z.boolean().optional(),
    avatarUrl: z.string().url().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    ownerId: z.string().uuid(),
  }),
});

export async function getOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/organizations/:slug",
      {
        schema: {
          tags: ["organizations"],
          summary: "Get details from organization",
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            /*TODO: /*200:organizationSchema*/
          },
        },
      },
      async (request, _response) => {
        const { slug } = request.params;
        const { organization } = await request.getUserMembership(slug);
        return {
          organization,
        };
      }
    );
}
