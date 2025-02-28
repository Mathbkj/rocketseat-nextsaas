import {
    AbilityBuilder,
    createMongoAbility,
} from "@casl/ability";
import type { CreateAbility, MongoAbility } from "@casl/ability";
import type { User } from "./models/user.js";

import { userSubject } from './subjects/user.js';
import { projectSubject } from "./subjects/project.js";

import { z } from "zod";
import { permissions } from "./permissions.js";
import { organizationSubject } from "./subjects/organization.js";
import { inviteSubject } from "./subjects/invite.js";
import { billingSubject } from "./subjects/billing.js";

const appAbilitiesSchema = z.union([
    projectSubject,userSubject,organizationSubject,inviteSubject,billingSubject,z.tuple([z.literal('manage'),z.literal('all')])
])

export * from "./models/organization.js";
export * from "./models/project.js";
export * from "./models/user.js";
export * from "./roles.js";



type AppAbilites = z.infer<typeof appAbilitiesSchema>;
export type AppAbilty = MongoAbility<AppAbilites>
export const createAppAbility=createMongoAbility as CreateAbility<AppAbilty>;


export function defineAbiltyFor(user:User){
    const builder = new AbilityBuilder(createAppAbility);
    if(typeof permissions[user.role] !== 'function'){
        throw new Error(`Permissions for role ${user.role} not found.`)
    }
    permissions[user.role](user,builder);
    const ability = builder.build({
					detectSubjectType(subject) {
						return subject.__typename;
					},
				})
                ability.can=ability.can.bind(ability);
                ability.cannot=ability.cannot.bind(ability);
    return ability;

}
