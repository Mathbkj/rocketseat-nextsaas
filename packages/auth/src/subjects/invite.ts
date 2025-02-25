import {z} from "zod";

export const inviteSubject = z.tuple([z.union([z.literal("create"),z.literal("list"),z.literal("get"),z.literal("delete")]),z.literal("Invite")])
export type InviteSubject = z.infer<typeof inviteSubject>;