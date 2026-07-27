
import { FastifyInstance } from "fastify"

import { checkFirebaseToken } from "../middlewares/auth.js"
import { completeAuthSchema } from "../objects/validationSchemas/auth.js"
import { completeAuthenticationController } from "../controllers/auth/completeAuthentication.controller.js"

export default async function router(fastify: FastifyInstance) {

    fastify.post(
        '/completeAuthentication',
        {
            preHandler: [checkFirebaseToken],
            schema: completeAuthSchema,
        },
        completeAuthenticationController,
    )

}
