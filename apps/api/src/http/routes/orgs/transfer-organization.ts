import { auth } from "@/http/middlewares/auth.js";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/lib/prisma.js";
import { organizationSchema } from "@repo/auth";
import { UnauthorizedError } from "../_errors/unauthorized-error.js";
import { BadRequestError } from "../_errors/bad-request-error.js";
import { getUserPermissions } from "./update-organization.js";

export async function transferOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      "/organizations/:slug/owner",
      {
        schema: {
          tags: ["organizations"],
          summary: "Transfer organization ownership",
          security: [{ bearerAuth: [] }],
          body: z.object({
            transferToUserWithId: z.string().uuid(),
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

        const authOrganization = organizationSchema.parse(organization);
        const { cannot } = getUserPermissions(userId, membership.role);

        if (cannot("transfer_ownership", authOrganization)) {
          throw new UnauthorizedError(
            "You're not allowed to update this organization"
          );
        }
        const { transferToUserWithId } = request.body;
        const transferToMemberShip = await prisma.member.findUnique({
          where: {
            organizationId_userId: {
              organizationId: organization.id,
              userId: transferToUserWithId,
            },
          },
        });
        if (!transferToMemberShip) {
          throw new BadRequestError(
            "Target user is not a member of this organization"
          );
        }
        await prisma.$transaction([
           prisma.member.update({
            where: {
              organizationId_userId: {
                organizationId: organization.id,
                userId: transferToUserWithId,
              },
            },
            data: { role: "ADMIN" },
          }),
           prisma.organization.update({
            where:{id:organization.id},
            data:{userId:transferToUserWithId}
          })
        ]);
        return response.status(204).send();
      }
    );
}
