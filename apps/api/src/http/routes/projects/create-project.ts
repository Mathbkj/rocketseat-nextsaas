import { auth } from "@/http/middlewares/auth.js";
import { prisma } from "@/lib/prisma.js";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { BadRequestError } from "../_errors/bad-request-error.js";
import { getUserPermissions } from "../orgs/update-organization.js";
import { UnauthorizedError } from "../_errors/unauthorized-error.js";

export const createSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[\s_]+/g, '-')  // Replace spaces and underscores with hyphens
      .replace(/[^\w\-]+/g, '') // Remove all non-word characters (letters, digits, and hyphens)
      .replace(/\-\-+/g, '-')   // Replace multiple hyphens with a single hyphen
      .replace(/^-+/, '')       // Trim hyphens from the start
      .replace(/-+$/, '');      // Trim hyphens from the end
  }

export async function createProject(app:FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().register(auth).post('/organizations/:slug/projects',{
        schema:{
            tags:['projects'],
            summary:"Create a new project",
            security:[{bearerAuth:[]}],
            body:z.object({
                name:z.string(),
                description:z.string()
            }),
            params:z.object({
                slug:z.string(),
            }),
            response:{
                201:z.object({projectId:z.string()})
            }
        }
    },async (request,response)=>{
        const {slug} = request.params;
        const userId = await request.getCurrentUserId();
        const {organization,membership} = await request.getUserMembership(slug);
       

        const {cannot} = getUserPermissions(userId,membership.role);

        if(cannot("create","Project")){
            throw new UnauthorizedError("You're not allowed to create new projects")
        }

        const {name,description} = request.body;

        const project=await prisma.project.create({
            data:{
                name,
                slug:createSlug(name),
                description,
                organizationId:organization.id,
                userId
            }
        })

    })
}