import { auth } from "@/http/middlewares/auth.js";
import { prisma } from "@/lib/prisma.js";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { BadRequestError } from "../_errors/bad-request-error.js";

export const createSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[\s_]+/g, '-')  // Replace spaces and underscores with hyphens
      .replace(/[^\w\-]+/g, '') // Remove all non-word characters (letters, digits, and hyphens)
      .replace(/\-\-+/g, '-')   // Replace multiple hyphens with a single hyphen
      .replace(/^-+/, '')       // Trim hyphens from the start
      .replace(/-+$/, '');      // Trim hyphens from the end
  }

export async function createOrganization(app:FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().register(auth).post('/organization',{
        schema:{
            tags:['organization'],
            summary:"Create a new organization",
            security:[{bearerAuth:[]}],
            body:z.object({
                name:z.string(),
                domain:z.string(),
                shouldAttachUsersByDomain:z.boolean().optional()
            }),
            response:{
                201:z.object({organizationId:z.string()})
            }
        }
    },async (request,response)=>{
        const userId = await request.getCurrentUserId();
        const {name,domain,shouldAttachUsersByDomain} = request.body;

        if(domain){
            const organizationByDomain = await prisma.organization.findUnique({
                where:{domain}
            })
            if(organizationByDomain){
                throw new BadRequestError('Another organization with same domain already exists');
            }
        }
        const organization = await prisma.organization.create({
            data:{
                name,
                slug:createSlug(name),
                domain,
                shouldAttachUsersByDomain,
                userId,
                members:{
                    create:{
                        userId,
                        role:"ADMIN",
                    }
                }

            }
        })
        return response.status(201).send({organizationId:organization.id})
    })
}