import { hash } from "bcryptjs";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "@/lib/prisma.js";
import { BadRequestError } from "../_errors/bad-request-error.js";

export async function createAccount(app:FastifyInstance){
 app.withTypeProvider<ZodTypeProvider>().post("/users",{
    schema:{
        summary:"Create a new user",
        tags:['auth'],
        body:z.object({
            name:z.string(),
            email:z.string(),
            password:z.string()
        })
    }
 }, async(request, response) => {
     const { name, email, password } = request.body;
     const userWithSameEmail = await prisma.user.findUnique({
         where:{email}
     })
     if (userWithSameEmail) {
         throw new BadRequestError("Associated email already registered");
     }
     const [,domain] = email.split("@");
     const autoJoinOrganization = await prisma.organization.findFirst({
        where:{
            domain,
            shouldAttachUsersByDomain:true
        }
     })
     const passwordHash = await hash(password,6)
     await prisma.user.create({
        data:{
            name,
            email,
            passwordHash,
            member_on:autoJoinOrganization? {create:{organizationId:autoJoinOrganization.id}} : undefined
        }
     })
     return response.status(201).send({})
 })
}