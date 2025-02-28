import 'fastify'
import type { Organization,Member } from '@prisma/client'

declare module 'fastify'{
    export interface FastifyRequest {
        getCurrentUserId():Promise<string>
        getUserMembership(slug:string):Promise<{organization:Organization,membership:Member}>
    }
}