import { auth } from "@/http/middlewares/auth.js";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/lib/prisma.js";
import { organizationSchema } from "./get-organization.js";

export async function getOrganizations(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/organizations",
      {
        schema: {
          tags: ["organizations"],
          summary: "Get organizations where user is a member",
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            /*TODO: 200: z.object({
              organizations: z.array(organizationSchema),
            })*/
          },
        },
      },
      async (request, _response) => {
        const userId = await request.getCurrentUserId();
        const organizations = await prisma.organization.findMany({
            select:{
                id:true,
                name:true,
                slug:true,
                avatarUrl:true,
                members:{
                    select:{
                        role:true
                    },
                    where:{
                        userId
                    }
                }
            },
            where:{
                members:{
                    some:{
                        userId
                    }
                }
            }
        })
        const organizationsWithUserRole = organizations.map(({members,...org})=>{
            return {...org,role:members[0].role}
        })
        return {organization:organizationsWithUserRole};

      }
    );
}
