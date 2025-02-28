import type { FastifyInstance } from "fastify"
import { ZodError } from "zod";
import { BadRequestError } from "./routes/_errors/bad-request-error.js";
import { UnauthorizedError } from "./routes/_errors/unauthorized-error.js";

type FastifyErrorHandler = FastifyInstance['errorHandler'];

export const errorHandler:FastifyErrorHandler = (error,_request,response)=>{
 if(error instanceof ZodError){
    return response.status(400).send({message:"Validation Error",errors:error.flatten().fieldErrors})
 }
 if(error instanceof BadRequestError){
    return response.status(400).send({message:error.message})
 }
 if(error instanceof UnauthorizedError){
    return response.status(401).send({message:error.message})
 }
 console.error(error);
}