import { prisma } from "@/lib/prisma.js";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

export async function requestPasswordRecover(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/password/recovery",
    {
      schema: {
        tags: ["auth"],
        summary: "User Request Paswword Recovery",
        body: z.object({
          email: z.string().email(),
        }),
        response:{
            201:z.null()
        }
      },
    },
    async (request, response) => {
        const {email} = request.body;
        const userFromEmail = await prisma.user.findUnique({
            where:{email}
        })
        if(!userFromEmail){
            return response.status(201).send();
        }
        const {id} = await prisma.token.create({
            data:{
                type:'PASSWORD_RECOVER',
                userId:userFromEmail.id
            }
        })
        return response.status(201).send();
    }
  );
}
