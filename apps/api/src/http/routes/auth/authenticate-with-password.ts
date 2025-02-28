import { prisma } from "@/lib/prisma.js";
import { compare } from "bcryptjs";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { BadRequestError } from "../_errors/bad-request-error.js";

export async function authenticateWithPassword(app:FastifyInstance){
app.withTypeProvider<ZodTypeProvider>().post("/sessions/password",{
    schema:{
        tags:["auth"],
        summary:"Authenticate with email and password",
        body:z.object({
            email:z.string().email(),
            password:z.string()
        }),
        response:{
            201:z.object({token:z.string()})
        }
    }
},async(request,response)=>{
    const {email,password} = request.body;
    const userFromEmail = await prisma.user.findUnique({
        where:{email}
    })
    if(!userFromEmail){
        throw new BadRequestError("Invalid credentials")
    }
    if(userFromEmail.passwordHash==null){
        throw new BadRequestError("User does not have a password, use a social login")
    }
    const isPasswordValid = await compare(password,userFromEmail.passwordHash);
    if(!isPasswordValid){
        throw new BadRequestError("Invalid Credentials")
    }

    const token = await response.jwtSign({
        sub:userFromEmail.id,
    },{ sign: {expiresIn:'7d'} });
    return response.status(201).send({token});
})
}
