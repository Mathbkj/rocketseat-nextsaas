import {z} from 'zod';

export const userSubject = z.tuple([z.union([z.literal("get"),z.literal("delete"),z.literal("invite"),z.literal("manage")]),z.literal("User")])
export type UserSubject = z.infer<typeof userSubject>;