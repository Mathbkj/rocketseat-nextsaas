import {z} from "zod";
import { roleSchema } from "../roles";

export const organizationSchema = z.object({
    __typename:z.literal("Organization").default("Organization"),
    ownerId:z.string(),
    role:roleSchema
})
export type Organization = z.infer<typeof organizationSchema>;