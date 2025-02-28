import { auth } from "@/http/middlewares/auth.js";
import { prisma } from "@/lib/prisma.js";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { BadRequestError } from "../_errors/bad-request-error.js";
import { getUserPermissions } from "../orgs/update-organization.js";
import { UnauthorizedError } from "../_errors/unauthorized-error.js";

export async function getProjects(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/organizations/:orgSlug/projects/:slug",
      {
        schema: {
          tags: ["projects"],
          summary: "Get a project details",
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            id: z.string().uuid(),
          }),
          response: {
            200:z.object({
              authProject:z.object({
                  id:z.string(),
                  description:z.string(),
                  name:z.string(),
                  slug:z.string(),
                  avatarUrl:z.string().nullable(),
                  organizationId:z.string().uuid(),
                  userId:z.string().uuid(),
                  owner:z.object({
                    id:z.string().uuid(),
                    name:z.string().nullable(),
                    avatarUrl:z.string().nullable()
                  })
                  
              })
            })
          },
        },
      },
      async (request, response) => {
        const { slug, id } = request.params;
        const userId = await request.getCurrentUserId();
        const { organization, membership } = await request.getUserMembership(slug);
        const { cannot } = getUserPermissions(userId, membership.role);
        if (cannot("get", "Project")) {
          throw new UnauthorizedError(
            "You're not allowed to delete this project"
          );
        }
        const authProject=await prisma.project.findUnique({
          select:{
            id:true,
            name:true,
            description:true,
            slug:true,
            userId:true,
            avatarUrl:true,
            organization:true,
            organizationId:true,
            owner:{
              select:{
                id:true,
                name:true,
                avatarUrl:true
              }
            }
          },
          where:{
            slug,
            organizationId:organization.id
          }
        });
        if(!authProject){
          throw new BadRequestError("Project not found!");
        }
        return response.status(200).send({authProject})
      }
    );
}
