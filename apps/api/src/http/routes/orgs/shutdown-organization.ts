import { auth } from "@/http/middlewares/auth.js";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/lib/prisma.js";
import { organizationSchema } from "@repo/auth";
import { UnauthorizedError } from "../_errors/unauthorized-error.js";
import { BadRequestError } from "../_errors/bad-request-error.js";
import { getUserPermissions } from "./update-organization.js";

export async function shutdownOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/organizations/:slug",
      {
        schema: {
          tags: ["organizations"],
          summary: "Deletes the desired organization",
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            domain: z.string(),
            shouldAttachUsersByDomain: z.boolean().optional(),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, response) => {
        const { slug } = request.params;
        const userId = await request.getCurrentUserId();
        const { membership, organization } =
          await request.getUserMembership(slug);

        const { name, domain, shouldAttachUsersByDomain } = request.body;

        const authOrganization = organizationSchema.parse(organization);
        const { cannot } = getUserPermissions(userId,membership.role);

        if (cannot("update", authOrganization)) {
          throw new UnauthorizedError(
            "You're not allowed to update this organization"
          );
        }
        if (domain) {
          const organizationByDomain = await prisma.organization.findFirst({
            where: {
              domain,
              slug: {
                not: slug,
              },
            },
          });
          if (organizationByDomain) {
            throw new BadRequestError(
              "Another organization with same domain already exists"
            );
          }
        }
        await prisma.organization.update({
          where: {
            id: organization.id,
          },
          data: {
            name,
            domain,
            shouldAttachUsersByDomain,
          },
        });
        return response.status(204).send();
      }
    );
}
