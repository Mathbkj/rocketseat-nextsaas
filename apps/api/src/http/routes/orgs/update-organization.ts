import { auth } from "@/http/middlewares/auth.js";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/lib/prisma.js";
import { userSchema, organizationSchema, defineAbiltyFor } from "@repo/auth";
import { UnauthorizedError } from "../_errors/unauthorized-error.js";
import { BadRequestError } from "../_errors/bad-request-error.js";
import type { Role } from "@repo/auth";

export const getUserPermissions = (userId:string,role:Role)=>{
    
    const authUser = userSchema.parse({
        id: userId,
        role: role,
      });
      const ability = defineAbiltyFor(authUser);
      return ability;
}

export async function updateOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/organizations/:slug",
      {
        schema: {
          tags: ["organizations"],
          summary: "Update organization details",
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

        if (cannot("delete", authOrganization)) {
          throw new UnauthorizedError(
            "You're not allowed to shutdown/delete this organization"
          );
        }
        await prisma.organization.delete({
          where: {
            id: organization.id,
          },
        });
        return response.status(204).send();
      }
    );
}
