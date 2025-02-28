import type { AbilityBuilder } from "@casl/ability";
import type { AppAbilty } from "./index.js";
import type { User } from "./models/user.js";
import type { Role } from "./roles.js";
type PermissionsByRole = (user:User,builder:AbilityBuilder<AppAbilty>)=>void;

export const permissions:Record<Role,PermissionsByRole> = {
    ADMIN:(user,builder)=>{
        builder.can("manage","all");
        builder.cannot(["transfer_ownership","update"],"Organization");
        builder.can(["transfer_ownership","update"],"Organization",{ownerId:{$eq:user.id}})
    },
    MEMBER:(user,builder)=>{
        builder.can("get","User");
        builder.can(["create","get"],"Project")
        builder.can(["update","delete"],"Project",{ownerId:{$eq:user.id}});
        builder.can("invite","User");
        builder.can("manage","Project",{ownerId:{$eq:user.id}});
    },
    BILLING:(_,builder)=>{
      builder.can("manage","Billing");
    }
}