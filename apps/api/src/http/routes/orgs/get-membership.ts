import { auth } from "@/http/middlewares/auth.js";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {roleSchema} from "@repo/auth";

export async function getMembership(app:FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().register(auth).get("/organizations/:slug/membership",{
        schema:{
            tags:['organizations'],
            summary:'Get user membership on organization',
            security:[{bearerAuth:[]}],
            params:z.object({
                slug:z.string()
            }),
            response:{
                200:z.object({
                    membership:z.object({
                        id:z.string().uuid(),
                        role:roleSchema
                    })

                })
            }
        }
    },async(request,_response)=>{
        const {slug} = request.params;
        const {membership} = await request.getUserMembership(slug);
        return {
            membership:{
                id:membership.id,
                role:roleSchema.parse(membership.role),
                organizaionId:membership.organizationId
                
            }
        }
    })
}