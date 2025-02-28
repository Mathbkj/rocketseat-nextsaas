import { auth } from "@/http/middlewares/auth.js";
import { prisma } from "@/lib/prisma.js";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { BadRequestError } from "../_errors/bad-request-error.js";
import { getUserPermissions } from "../orgs/update-organization.js";
import { UnauthorizedError } from "../_errors/unauthorized-error.js";
import { projectSchema } from "@repo/auth";

export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters (letters, digits, and hyphens)
    .replace(/\-\-+/g, "-") // Replace multiple hyphens with a single hyphen
    .replace(/^-+/, "") // Trim hyphens from the start
    .replace(/-+$/, ""); // Trim hyphens from the end
};

export async function deleteProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/organizations/:slug/:id",
      {
        schema: {
          tags: ["projects"],
          summary: "Delete an existing project",
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            id: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, response) => {
        const { slug, id } = request.params;
        const userId = await request.getCurrentUserId();
        const { organization, membership } =
          await request.getUserMembership(slug);

        const project = await prisma.project.findUnique({
          where: {
            id,
            organizationId: organization.id,
          },
        });
        if (!project) {
          throw new BadRequestError("Project Not Found");
        }
        const { cannot } = getUserPermissions(userId, membership.role);
        const authProject = projectSchema.parse(project);
        if (cannot("delete", authProject)) {
          throw new UnauthorizedError(
            "You're not allowed to delete this project"
          );
        }
        await prisma.project.delete({
          where: { id },
        });
        return response.status(204).send();
      }
    );
}
