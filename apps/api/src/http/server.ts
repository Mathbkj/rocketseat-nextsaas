import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifyJwt from "@fastify/jwt"
import fastifySwaggerUi from "@fastify/swagger-ui";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { createAccount } from "./routes/auth/create-account.js";
import { authenticateWithPassword } from "./routes/auth/authenticate-with-password.js";
import { getAccount } from "./routes/auth/get-profile.js";
import { errorHandler } from "./error-handler.js";
import { requestPasswordRecover } from "./routes/auth/request-password-recover.js";
import { authenticateWithGithub } from "./routes/auth/authenticate-with-github.js";
import { env } from "@repo/env";
import { createOrganization } from "./routes/orgs/create-organization.js";
import { getMembership } from "./routes/orgs/get-membership.js";
import { getOrganization } from "./routes/orgs/get-organization.js";
import { getOrganizations } from "./routes/orgs/get-organizations.js";
import { createProject } from "./routes/projects/create-project.js";
import { getProject } from "./routes/projects/get-project.js";


const app =fastify();
app.setSerializerCompiler(serializerCompiler);

app.setValidatorCompiler(validatorCompiler);

app.setErrorHandler(errorHandler)

app.register(fastifySwagger,{
   openapi:{
        openapi:'3.0.0',
        info:{
            title:"Next",
            description:"Testing",
            version:"0.1.0"
        },
        components:{
            securitySchemes:{
                bearerAuth:{
                    type:"http",
                    scheme:"bearer",
                    bearerFormat:"JWT"
                }
            }
        }
    },
    transform:jsonSchemaTransform
})

app.register(fastifySwaggerUi,{
    routePrefix:"/docs"
})

app.register(fastifyJwt,{
    secret:env.JWT_SECRET,
    
})

app.register(fastifyCors);
app.register(createAccount);
app.register(createOrganization);
app.register(createProject);
app.register(getMembership);
app.register(authenticateWithPassword);
app.register(authenticateWithGithub);
app.register(getAccount);
app.register(getOrganization);
app.register(getOrganizations);
app.register(getProject);
app.register(requestPasswordRecover);


app.listen({port:3333}).then(()=>console.log("HTTP Server is running"))